import type { Falsy, NaNType } from "type-righter";
import check, { isInstanceOf, isInstanceOfOneOf, isString } from "type-righter";

declare function expectType<T>(value: T): void;

export const checkCoreTypes = (
  value: unknown,
  values: unknown[],
  readonlyValues: readonly unknown[],
  iterable: Iterable<unknown>,
) => {
  if (check.isString(value)) value.toUpperCase();
  if (isString(value)) value.toUpperCase();
  if (check.isStringOrFalsy(value)) expectType<string | Falsy>(value);
  if (check.isStringOrNumberOrNullish(value))
    expectType<string | number | null | undefined>(value);
  if (check.isNaNType(value)) expectType<NaNType>(value);
  if (isInstanceOf(value, Date)) value.getTime();
  if (isInstanceOfOneOf(value, [Date, Error] as const)) {
    expectType<Date | Error>(value);
    expectType<typeof value>({} as Date | Error);
  }
  if (isInstanceOfOneOf(value, [] as const)) expectType<never>(value);

  if (check.areStrings(values)) {
    expectType<string[]>(values);
    values.push("a");
    values.forEach((item) => item.toUpperCase());
    // @ts-expect-error Successful string checks do not permit numbers.
    values.push(1);
  }
  if (check.areStringsOrNumbersOrBooleans(values))
    expectType<(string | number | boolean)[]>(values);
  if (check.areStrings(readonlyValues)) {
    expectType<readonly string[]>(readonlyValues);
    // @ts-expect-error Checking a readonly array does not make it mutable.
    readonlyValues.push("a");
  }
  if (check.areStrings(iterable)) {
    for (const item of iterable) item.toUpperCase();
    // @ts-expect-error Checking an iterable does not turn it into an array.
    iterable.push("a");
  }
  // @ts-expect-error Unknown keys can resolve to undefined.
  check.isBanana(value);
  // @ts-expect-error Core/DOM chains retain their runtime-only fallback.
  check.isNodeOrNumber(value);
  check.isStringOrNumberOrBooleanOrNullish?.(value);
};
