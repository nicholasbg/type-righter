import type { Falsy, NaNType } from "type-righter/core";
import typeCheck, {
  isInstanceOf,
  isInstanceOfOneOf,
  isString,
} from "type-righter/core";

declare function expectType<T>(value: T): void;

export const checkCoreTypes = (
  value: unknown,
  values: unknown[],
  readonlyValues: readonly unknown[],
  iterable: Iterable<unknown>,
) => {
  if (typeCheck.isString(value)) value.toUpperCase();
  if (isString(value)) value.toUpperCase();
  if (typeCheck.isStringOrFalsy(value)) expectType<string | Falsy>(value);
  if (typeCheck.isStringOrNumberOrNullish(value))
    expectType<string | number | null | undefined>(value);
  if (typeCheck.isNaNType(value)) expectType<NaNType>(value);
  if (isInstanceOf(value, Date)) value.getTime();
  if (isInstanceOfOneOf(value, [Date, Error] as const)) {
    expectType<Date | Error>(value);
    expectType<typeof value>({} as Date | Error);
  }
  if (isInstanceOfOneOf(value, [] as const)) expectType<never>(value);

  if (typeCheck.areStrings(values)) {
    expectType<string[]>(values);
    values.push("a");
    values.forEach((item) => item.toUpperCase());
    // @ts-expect-error Successful string checks do not permit numbers.
    values.push(1);
  }
  if (typeCheck.areStringsOrNumbersOrBooleans(values))
    expectType<(string | number | boolean)[]>(values);
  if (typeCheck.areStrings(readonlyValues)) {
    expectType<readonly string[]>(readonlyValues);
    // @ts-expect-error Checking a readonly array does not make it mutable.
    readonlyValues.push("a");
  }
  if (typeCheck.areStrings(iterable)) {
    for (const item of iterable) item.toUpperCase();
    // @ts-expect-error Checking an iterable does not turn it into an array.
    iterable.push("a");
  }
  // @ts-expect-error Unknown keys can resolve to undefined.
  typeCheck.isBanana(value);
  // @ts-expect-error Core/DOM chains retain their runtime-only fallback.
  typeCheck.isNodeOrNumber(value);
  typeCheck.isStringOrNumberOrBooleanOrNullish?.(value);
};
