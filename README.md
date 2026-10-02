# type-righter

Composable runtime type guards for JavaScript and TypeScript. Write the check;
the Proxy supplies the predicate.

## Core

```ts
import check, { isString } from "type-righter";
import type { Falsy } from "type-righter";

const value: unknown = "hello";
if (check.isString(value)) value.toUpperCase();
if (check.isStringOrNumber(value)) value.toString();
if (check.isStringOrFalsy(value)) {
  const match: string | Falsy = value;
}

const values: unknown[] = ["hello", 42];
if (check.areStringsOrNumbers(values)) {
  values.map((item) => item.toString());
}

isString(value);
```

Default and named `check` exports reference the same object. The standalone
named predicates bypass the Proxy.

Core names: `String`, `Number`, `Boolean`, `BigInt`, `Symbol`, `Function`,
`Object`, `Array`, `Date`, `IterableObj`, `Null`, `Undefined`, `Nullish`,
`Falsy`, and `NaNType`.

`isNumber` includes NaN and infinities. `isObject` excludes null and functions.
`isIterableObj` excludes strings. `isFalsy` follows JavaScript truthiness;
`NaNType` is a compile-time brand used by `isNaNType`, not a runtime property.

`isInstanceOf(value, Constructor)` and `isInstanceOfOneOf(value, constructors)`
are also available as standalone helpers. Neither is registered as a Proxy
predicate or an Or-chain token. Custom
`Symbol.hasInstance` hooks can still throw.

## DOM

```ts
import checkDOM, { isInput } from "type-righter/dom";

const value: unknown = document.querySelector("input");
if (checkDOM.isInput(value)) value.value;
if (checkDOM.isHTMLOrSVG(value)) value.style;

isInput(value);
```

`checkDOM` is the same runtime Proxy as `check`, with a separate typed view.
Its names are `Node`, `Element`, `HTML`, `SVG`, `Input`, `Dialog`, `File`,
`FormControl`, and `InputType`. The DOM entry also exports the standalone
DOM predicates and the `CheckDOM`, `FormControl`, and `InputType` types.

Element checks use the node's owning Window, including iframe elements.
`isFile` uses the current realm's `File` constructor. DOM checks require
appropriate browser APIs when called; importing the core entry does not
require DOM globals or DOM TypeScript libraries.

## Grammar And Typing

- `is<Type>` checks one value; `are<Type>` checks every value in an iterable.
- `Or` joins alternatives: every item must match at least one alternative.
- `are` accepts bare or plural names, such as `areString` and `areStrings`.
- Chains of up to three types have precise type guards within each domain.
- Precisely typed `are` chains are consistently bare or consistently plural.
- Longer, mixed-pluralization, and core/DOM chains work at runtime but fall
  back to optional boolean predicates, without type narrowing.
- Unknown or malformed names return `undefined`.
- Repeated access to a generated predicate reuses its cached function.

```ts
check.isStringOrNumberOrBooleanOrNullish?.(value);
checkDOM.isNodeOrNullish?.(value);
```

Empty iterables pass. Checks iterate the supplied value, so checking a
generator consumes it and may stop at the first failing item. Arrays keep
array narrowing, readonly arrays stay readonly, and other iterables are
not claimed to be arrays.

The core and DOM type domains grow independently to limit TypeScript's
combinatorial key generation. Splitting domains provides headroom, not an
unlimited type-complexity budget.

## Development

ESM only. Node 24+ for Node consumers and development; modern browsers for
DOM use. CI and the nvm version file select Node 24 LTS. For nvm users,
run `nvm install` and `nvm use` in the repository before the commands below.
The minimum consumer TypeScript version is 4.7.2. Consumer declarations are
tested with that version and the development compiler.
TypeScript 4.6 cannot parse the constrained `infer` syntax in the public
declarations. There are no runtime package dependencies.

```sh
npm ci
npm run playwright:install
npm run check
npm run test:package -- 4.7.2
```

`npm test` runs Node tests against source, and `npm run test:browser` runs
Chromium DOM tests. `npm run build` emits JavaScript and declarations into
`dist`. `npm run typecheck` checks source and consumer fixtures with
`skipLibCheck: false`, including a core consumer without DOM libraries.

`npm run test:package` builds and installs an npm tarball into a temporary
consumer, then checks ESM exports and consumer declarations. The check is
implemented in [scripts/check-package.mjs](scripts/check-package.mjs). It does
not publish or register anything. `npm run check` includes this packaging check.
Pass an exact TypeScript version after `--` to test consumer compatibility
without changing the development dependency. CI tests the installed tarball
with both the development compiler and TypeScript 4.7.2.

## License

MIT.
