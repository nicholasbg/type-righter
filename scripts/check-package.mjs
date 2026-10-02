import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = mkdtempSync(join(tmpdir(), "type-righter-package-"));
const consumer = join(temporary, "consumer");
const run = (command, args, cwd = consumer) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });
const compilerVersion = process.argv[2];

try {
  const [archive] = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary],
      { cwd: project, encoding: "utf8" },
    ),
  );

  for (const file of archive.files)
    assert(
      file.path.startsWith("dist/") ||
        ["package.json", "README.md", "LICENSE"].includes(file.path),
      `Unexpected published file: ${file.path}`,
    );
  for (const file of [
    "dist/index.js",
    "dist/index.d.ts",
    "dist/check.js",
    "dist/check.d.ts",
    "dist/check-dom.js",
    "dist/check-dom.d.ts",
  ])
    assert(
      archive.files.some((entry) => entry.path === file),
      `Missing ${file}`,
    );

  mkdirSync(consumer);
  run("npm", [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--package-lock=false",
    join(temporary, archive.filename),
  ]);

  run(process.execPath, [
    "--input-type=module",
    "-e",
    `
    import assert from "node:assert/strict";
    import typeCheck, { typeCheck as namedTypeCheck, typeCheckDOM, isString, isInput } from "type-righter";
    import coreTypeCheck, { typeCheck as namedCoreTypeCheck, isString as coreIsString } from "type-righter/core";
    assert.equal(typeof document, "undefined");
    assert.equal(typeof window, "undefined");
    assert.equal(typeCheck, namedTypeCheck);
    assert.equal(typeCheck, typeCheckDOM);
    assert.equal(typeCheck, coreTypeCheck);
    assert.equal(coreTypeCheck, namedCoreTypeCheck);
    assert.equal(isString, coreIsString);
    assert.equal(typeCheck.isString, isString);
    assert.equal(typeCheckDOM.isInput, isInput);
    assert.equal(isInput({}), false);
    assert.equal(typeCheck.isStringOrFalsy(0), true);
    assert.equal(typeCheck.areStrings(new Set(["a", "b"])), true);
    assert.equal(typeCheck.isStringOrNumberOrBooleanOrNullish?.(true), true);
    assert.equal(typeCheck.isBanana, undefined);
    await assert.rejects(import("type-righter/dom"), { code: "ERR_PACKAGE_PATH_NOT_EXPORTED" });
  `,
  ]);

  const compilerCommand = compilerVersion ? "npm" : process.execPath;
  const compilerPrefix = compilerVersion
    ? ["exec", "--yes", `--package=typescript@${compilerVersion}`, "--", "tsc"]
    : [join(project, "node_modules", "typescript", "bin", "tsc")];
  run(compilerCommand, [...compilerPrefix, "--version"]);
  const compilerArgs = [
    ...compilerPrefix,
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "false",
    "--target",
    "ES2022",
    "--module",
    "NodeNext",
    "--moduleResolution",
    "NodeNext",
    "--typeRoots",
    join(consumer, "no-ambient-types"),
  ];
  for (const [fixture, libraries] of [
    ["core", "ES2022"],
    ["dom", "ES2022,DOM,DOM.Iterable"],
  ]) {
    const filename = `${fixture}-consumer.mts`;
    copyFileSync(
      join(project, "tests", "types", `${fixture}-consumer.ts`),
      join(consumer, filename),
    );
    run(compilerCommand, [...compilerArgs, "--lib", libraries, filename]);
  }
  console.log(
    "Packed package passed Node imports and core/DOM consumer type checks.",
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
