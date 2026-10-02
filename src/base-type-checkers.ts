import type {
  Constructor,
  Falsy,
  FunctionType,
  NaNType,
  Nullish,
} from "./types.js";

/**
 * Narrows a value to a primitive string, excluding boxed `String` objects.
 *
 * @param val - Value to check.
 * @returns True if the value is a primitive string.
 */
export const isString = (val: unknown): val is string =>
  typeof val === "string";

/**
 * Narrows a value to a non-null object, including arrays and class instances.
 * Functions are excluded.
 *
 * @param val - Value to check.
 * @returns True if the value is a non-null object.
 */
export const isObject = (val: unknown): val is object =>
  Boolean(val) && typeof val === "object";

/**
 * Checks for `typeof "function"`, including classes.
 * Does not validate the function's signature or whether it can be called without `new`.
 *
 * @param val - Value to check.
 * @returns True if the value has `typeof "function"`.
 */
export const isFunction = (val: unknown): val is FunctionType =>
  typeof val === "function";

/**
 * Narrows a value to a primitive number, including `NaN` and infinities.
 * Boxed `Number` objects are excluded.
 *
 * @param val - Value to check.
 * @returns True if the value is a primitive number.
 */
export const isNumber = (val: unknown): val is number =>
  typeof val === "number";

/**
 * Narrows a value to a primitive boolean, excluding boxed `Boolean` objects.
 *
 * @param val - Value to check.
 * @returns True if the value is a primitive boolean.
 */
export const isBoolean = (val: unknown): val is boolean =>
  typeof val === "boolean";

/**
 * Narrows a value to a primitive bigint, excluding boxed bigint objects.
 *
 * @param val - Value to check.
 * @returns True if the value is a primitive bigint.
 */
export const isBigInt = (val: unknown): val is bigint =>
  typeof val === "bigint";

/**
 * Narrows a value to a primitive symbol, excluding boxed symbol objects.
 *
 * @param val - Value to check.
 * @returns True if the value is a primitive symbol.
 */
export const isSymbol = (val: unknown): val is symbol =>
  typeof val === "symbol";

/**
 * Narrows a value to an array using `Array.isArray`, including across realms.
 * Does not check element types; typed arrays are excluded.
 *
 * @param val - Value to check.
 * @returns True if the value is an array.
 */
export const isArray = (val: unknown): val is unknown[] => Array.isArray(val);

/**
 * Checks for a Date across realms using its object tag and a callable `getTime`.
 * Includes invalid dates; this structural check can be spoofed.
 *
 * @param val - Value to check.
 * @returns True if the value has the Date object tag and a callable `getTime`.
 */
export const isDate = (val: unknown): val is Date =>
  isObject(val) &&
  isFunction((val as Date).getTime) &&
  Object.prototype.toString.call(val) === "[object Date]";

/**
 * Checks for a non-null object with a callable `Symbol.iterator`.
 * Excludes primitive strings and functions; does not invoke or validate the iterator.
 *
 * @param val - Value to check.
 * @returns True if the value is an object with a callable `Symbol.iterator`.
 */
export const isIterableObj = (val: unknown): val is Iterable<unknown> =>
  isObject(val) && isFunction((val as Iterable<unknown>)[Symbol.iterator]);

/**
 * Narrows a value to exactly `null`, excluding `undefined` and other falsy values.
 *
 * @param val - Value to check.
 * @returns True if the value is `null`.
 */
export const isNull = (val: unknown): val is null => val === null;

/**
 * Checks for numeric `NaN` without coercion and narrows to the `NaNType` brand.
 * The brand is type-only; no property is added to the value.
 *
 * @param val - Value to check without coercion.
 * @returns True if the value is numeric `NaN`.
 */
export const isNaNType = (val: unknown): val is NaNType =>
  typeof val === "number" && Number.isNaN(val);

/**
 * Narrows a value to exactly `undefined`, excluding `null` and other falsy values.
 *
 * @param val - Value to check.
 * @returns True if the value is `undefined`.
 */
export const isUndefined = (val: unknown): val is undefined =>
  val === undefined;

/**
 * Narrows a value to `null | undefined`, excluding other falsy values such as `0`.
 *
 * @param val - Value to check.
 * @returns True if the value is `null` or `undefined`.
 */
export const isNullish = (val: unknown): val is Nullish =>
  val === undefined || val === null;

/**
 * Checks JavaScript falsiness: `false`, zero (including `-0` and `0n`), `""`,
 * `null`, `undefined`, and `NaN`.
 * In browsers, also accepts the legacy `document.all` value, not modeled by `Falsy`.
 *
 * @param val - Value to check.
 * @returns True if the value is falsy under JavaScript truthiness rules.
 */
export const isFalsy = (val: unknown): val is Falsy => !val;

/**
 * Narrows a value to the constructor's instance type using `instanceof`.
 * Returns false if the constructor is not a function with an object prototype.
 * Realm identity and custom `Symbol.hasInstance` behavior apply; exceptions propagate.
 *
 * @param val - Value to check.
 * @param constructor - Constructor whose instance type to test against.
 * @returns True if the constructor passes validation and `val instanceof constructor`.
 */
export const isInstanceOf = <T, Args extends unknown[]>(
  val: unknown,
  constructor: Constructor<T, Args>,
): val is T =>
  isFunction(constructor) &&
  isObject(constructor.prototype) &&
  val instanceof constructor;

/**
 * Checks each constructor with `isInstanceOf`, stopping at the first match.
 * Narrows to the union of instance types; an empty list returns false.
 *
 * @param elem - Value to check.
 * @param constructors - Constructors to test in order.
 * @returns True if the value matches at least one constructor.
 */
export const isInstanceOfOneOf = <
  T extends readonly Constructor<unknown, never[]>[],
>(
  elem: unknown,
  constructors: T,
): elem is InstanceType<T[number]> => {
  for (const ctor of constructors) if (isInstanceOf(elem, ctor)) return true;
  return false;
};
