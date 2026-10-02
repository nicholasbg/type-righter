# type-righter

Composable runtime type guards for JavaScript and TypeScript. Write the check;
the Proxy supplies the predicate.

## Core

```ts
import typeCheck, { isString } from "type-righter";
import type { Falsy } from "type-righter";

const value: unknown = "hello";
if (typeCheck.isString(value)) value.toUpperCase();
if (typeCheck.isStringOrNumber(value)) value.toString();
if (typeCheck.isStringOrFalsy(value)) {
  const match: string | Falsy = value;
}

const values: unknown[] = ["hello", 42];
if (typeCheck.areStringsOrNumbers(values)) {
  values.map((item) => item.toString());
}

isString(value);
```

Default and named `typeCheck` exports reference the same object. Its type is
exported as `TypeCheck`. The standalone named predicates bypass the Proxy.
All public predicates and types, including the DOM exports, are available
from `type-righter`; `typeCheck` is the only default export.

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
import { typeCheckDOM, isInput } from "type-righter";

const value: unknown = document.querySelector("input");
if (typeCheckDOM.isInput(value)) value.value;
if (typeCheckDOM.isHTMLOrSVG(value)) value.style;

isInput(value);
```

`typeCheckDOM` is the same runtime Proxy as `typeCheck`, with a separate typed
view.
Its names are `Node`, `Element`, `HTML`, `SVG`, `Input`, `Dialog`, `File`,
`FormControl`, and `InputType`. The root entry also exports the standalone
DOM predicates and the `TypeCheckDOM`, `FormControl`, and `InputType` types.

Element checks use the node's owning Window, including iframe elements.
`isFile` uses the current realm's `File` constructor. DOM checks require
appropriate browser APIs when called; importing either entry does not
require DOM globals. The root declarations require DOM TypeScript libraries.
For TypeScript consumers without DOM libraries, use the core-only entry:

```ts
import typeCheck, { isString } from "type-righter/core";
import type { TypeCheck, Falsy } from "type-righter/core";
```

`type-righter/core` exports the same `typeCheck` Proxy, core predicates, and
core types, without requiring DOM TypeScript libraries.

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
typeCheck.isStringOrNumberOrBooleanOrNullish?.(value);
typeCheckDOM.isNodeOrNullish?.(value);
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
