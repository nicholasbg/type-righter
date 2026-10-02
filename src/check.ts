import {
  isDialog,
  isElement,
  isFile,
  isFormControl,
  isHTML,
  isInput,
  isInputType,
  isNode,
  isSVG,
} from "./base-dom-checkers.js";
import {
  isArray,
  isBigInt,
  isBoolean,
  isDate,
  isFalsy,
  isFunction,
  isIterableObj,
  isNaNType,
  isNull,
  isNullish,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
} from "./base-type-checkers.js";
import type { BaseAreTypeCheck, BaseIsTypeCheck, TypeCheck } from "./types.js";

const baseTypeCheckersMap = new Map<string, BaseIsTypeCheck>();
const baseTypeCheckers = {
  isArray,
  isBigInt,
  isBoolean,
  isDate,
  isFalsy,
  isFunction,
  isIterableObj,
  isNull,
  isNullish,
  isNumber,
  isObject,
  isString,
  isSymbol,
  isUndefined,
  isNode,
  isElement,
  isHTML,
  isSVG,
  isInput,
  isDialog,
  isFile,
  isFormControl,
  isInputType,
  isNaNType,
};
const baseCheckersMap = new Map<string, BaseIsTypeCheck>();

Object.entries(baseTypeCheckers).forEach(([key, value]) => {
  baseTypeCheckersMap.set(key, value);
  baseCheckersMap.set(
    (key.startsWith("is") ? key.slice(2) : key).toLowerCase(),
    value,
  );
});

const tokenize = (key: string, prefix: string) =>
  key.startsWith(prefix) &&
  key.length > prefix.length &&
  key.slice(prefix.length).split("Or");

const checkersFor = (
  types: string[] | false,
  allowPlural = false,
): BaseIsTypeCheck[] | undefined => {
  if (!types) return undefined;
  const checkers: BaseIsTypeCheck[] = [];
  for (const type of types) {
    const name = type.toLowerCase();
    const checker =
      baseCheckersMap.get(name) ||
      (allowPlural &&
        name.endsWith("s") &&
        baseCheckersMap.get(name.slice(0, -1)));
    if (!checker) return undefined;
    checkers.push(checker);
  }
  return checkers;
};

const cache = new Map<string, BaseIsTypeCheck | BaseAreTypeCheck | undefined>();

const matchesEvery = (checkers: BaseIsTypeCheck[], vals: Iterable<unknown>) => {
  for (const val of vals)
    if (!checkers.some((checker) => checker(val))) return false;
  return true;
};

/** Generates is/are predicates with precise typing for up to three types. */
const typeCheck: TypeCheck = new Proxy({} as TypeCheck, {
  get(_target, key) {
    if (!isString(key)) return undefined;
    if (baseTypeCheckersMap.has(key)) return baseTypeCheckersMap.get(key);

    if (!cache.has(key)) {
      const isCheckers = checkersFor(tokenize(key, "is"));
      if (isCheckers)
        cache.set(key, ((val) =>
          matchesEvery(isCheckers, [val])) as BaseIsTypeCheck);
      else {
        const areCheckers = checkersFor(tokenize(key, "are"), true);
        if (areCheckers)
          cache.set(key, ((vals) =>
            matchesEvery(areCheckers, vals)) as BaseAreTypeCheck);
      }
    }
    return cache.get(key);
  },
});

export * from "./base-type-checkers.js";
export type {
  BaseAreTypeCheck,
  BaseIsTypeCheck,
  Falsy,
  FunctionType,
  NaNType,
  Nullish,
  TypeCheck,
} from "./types.js";
export { typeCheck };
export default typeCheck;
