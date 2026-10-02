import { describe, expect, it } from "vitest";
import check, {
  isInstanceOf,
  isInstanceOfOneOf,
  isString,
  check as namedCheck,
} from "../src/check.js";

describe("check", () => {
  describe("single-type predicates", () => {
    it("isString", () => {
      expect(check.isString("a")).toBe(true);
      expect(check.isString(1)).toBe(false);
    });

    it("isNumber", () => {
      expect(check.isNumber(1)).toBe(true);
      expect(check.isNumber("1")).toBe(false);
    });

    it("isBoolean", () => {
      expect(check.isBoolean(true)).toBe(true);
      expect(check.isBoolean(0)).toBe(false);
    });

    it("isBigInt", () => {
      expect(check.isBigInt(1n)).toBe(true);
      expect(check.isBigInt(1)).toBe(false);
    });

    it("isSymbol", () => {
      expect(check.isSymbol(Symbol("s"))).toBe(true);
      expect(check.isSymbol("s")).toBe(false);
    });

    it("isFunction", () => {
      expect(check.isFunction(() => {})).toBe(true);
      expect(check.isFunction({})).toBe(false);
    });

    it("isObject", () => {
      expect(check.isObject({})).toBe(true);
      expect(check.isObject(null)).toBe(false);
    });

    it("isArray", () => {
      expect(check.isArray([1, 2])).toBe(true);
      expect(check.isArray({})).toBe(false);
    });

    it("isIterableObj", () => {
      expect(check.isIterableObj([1, 2])).toBe(true);
      expect(check.isIterableObj(new Set())).toBe(true);
      expect(check.isIterableObj("a")).toBe(false);
      expect(check.isIterableObj({})).toBe(false);
    });

    it("isDate", () => {
      expect(check.isDate(new Date())).toBe(true);
      expect(check.isDate("2020-01-01")).toBe(false);
    });

    it("isNull", () => {
      expect(check.isNull(null)).toBe(true);
      expect(check.isNull(undefined)).toBe(false);
    });

    it("isUndefined", () => {
      expect(check.isUndefined(undefined)).toBe(true);
      expect(check.isUndefined(null)).toBe(false);
    });

    it("isNullish", () => {
      expect(check.isNullish(null)).toBe(true);
      expect(check.isNullish(undefined)).toBe(true);
      expect(check.isNullish(0)).toBe(false);
    });

    it("isFalsy", () => {
      for (const value of [false, 0, -0, 0n, "", null, undefined, NaN])
        expect(check.isFalsy(value)).toBe(true);
      expect(check.isFalsy("a")).toBe(false);
      expect(check.isFalsy(1)).toBe(false);
      expect(check.isFalsy({})).toBe(false);
    });

    it("isNaNType", () => {
      expect(check.isNaNType(NaN)).toBe(true);
      expect(check.isNaNType(1)).toBe(false);
      expect(check.isNaNType("NaN")).toBe(false);
    });
  });

  describe("Or chains", () => {
    it("isBooleanOrUndefined", () => {
      expect(check.isBooleanOrUndefined(true)).toBe(true);
      expect(check.isBooleanOrUndefined(undefined)).toBe(true);
      expect(check.isBooleanOrUndefined(null)).toBe(false);
    });

    it("isStringOrNumber", () => {
      expect(check.isStringOrNumber("x")).toBe(true);
      expect(check.isStringOrNumber(2)).toBe(true);
      expect(check.isStringOrNumber(true)).toBe(false);
    });

    it("chains three types", () => {
      expect(check.isStringOrNumberOrNullish("x")).toBe(true);
      expect(check.isStringOrNumberOrNullish(2)).toBe(true);
      expect(check.isStringOrNumberOrNullish(null)).toBe(true);
      expect(check.isStringOrNumberOrNullish(undefined)).toBe(true);
      expect(check.isStringOrNumberOrNullish({})).toBe(false);
    });

    it("keeps Falsy available in Or chains", () => {
      expect(check.isStringOrFalsy("x")).toBe(true);
      expect(check.isStringOrFalsy(0)).toBe(true);
      expect(check.isStringOrFalsy({})).toBe(false);
    });

    it("supports runtime chains beyond three types", () => {
      expect(check.isStringOrNumberOrBooleanOrNullish?.("x")).toBe(true);
      expect(check.isStringOrNumberOrBooleanOrNullish?.(true)).toBe(true);
      expect(check.isStringOrNumberOrBooleanOrNullish?.(null)).toBe(true);
      expect(check.isStringOrNumberOrBooleanOrNullish?.({})).toBe(false);
    });
  });

  describe("are multi-value predicates", () => {
    it("checks every item in an iterable", () => {
      expect(check.areString(["a", "b", "c"])).toBe(true);
      expect(check.areString(["a", 1, "c"])).toBe(false);
      expect(check.areString([])).toBe(true);
    });

    it("checks falsy values", () => {
      expect(check.areFalsy([false, 0, "", null, undefined, NaN])).toBe(true);
      expect(check.areFalsy([false, 1])).toBe(false);
      expect(check.areFalsy([])).toBe(true);
    });

    it("checks Or chains", () => {
      expect(check.areStringOrNumber(["a", 1, "b"])).toBe(true);
      expect(check.areStringOrNumber(["a", true, "b"])).toBe(false);
    });

    it("tolerates pluralized type names", () => {
      expect(check.areStrings(["a", "b", "c"])).toBe(true);
      expect(check.areStrings(["a", 1, "c"])).toBe(false);
      expect(check.areStringsOrNumbers(["a", 1, "b"])).toBe(true);
      expect(check.areStringsOrNumbersOrBooleans(["a", 1, true])).toBe(true);
    });

    it("narrows arrays without changing their container", () => {
      const values: unknown[] = ["a", "b", "c"];
      if (check.areString(values)) {
        expect(values.map((value) => value.toUpperCase())).toEqual([
          "A",
          "B",
          "C",
        ]);
      }
      if (check.areStringOrArray(values))
        expect(values.map((value) => value.length)).toEqual([1, 1, 1]);
      if (check.areStringsOrArrays(values))
        expect(values.map((value) => value.length)).toEqual([1, 1, 1]);
      if (check.areStringsOrBooleansOrNumbers(values))
        expect(values.map((value) => value.toString())).toEqual(values);
    });

    it("accepts Sets and consumes generators", () => {
      expect(check.areStrings(new Set(["a", "b"]))).toBe(true);
      expect(check.areStrings(new Set(["a", 1]))).toBe(false);
      const values = (function* () {
        yield "a";
        yield "b";
      })();
      expect(check.areStrings(values)).toBe(true);
      expect([...values]).toEqual([]);
    });

    it("supports mixed pluralization at runtime", () => {
      expect(check.areStringOrNumbers?.(["a", 1])).toBe(true);
      expect(check.areStringOrNumbers?.([true])).toBe(false);
    });

    it("supports runtime chains beyond three types", () => {
      expect(
        check.areStringsOrNumbersOrBooleansOrDates?.([
          "a",
          1,
          true,
          new Date(),
        ]),
      ).toBe(true);
      expect(
        check.areStringOrNumberOrBooleanOrDate?.(["a", 1, true, new Date()]),
      ).toBe(true);
    });

    it("returns undefined for unknown or incomplete keys", () => {
      expect(check.areBanana).toBeUndefined();
      expect(check.are).toBeUndefined();
    });

    it("reuses the same function on repeated access", () => {
      expect(check.areString).toBe(check.areString);
    });
  });

  describe("type narrowing", () => {
    it("narrows inside if-blocks", () => {
      const checkValue = (value: unknown) => {
        if (check.isString(value)) {
          value.toUpperCase();
          return true;
        }
        if (check.isNumber(value)) {
          value.toFixed();
          return true;
        }
        if (check.isNumberOrStringOrUndefined(value)) return true;
        if (check.isDateOrNull(value)) return true;
        return false;
      };
      expect(checkValue("x")).toBe(true);
      expect(checkValue(1)).toBe(true);
      expect(checkValue(undefined)).toBe(true);
      expect(checkValue(true)).toBe(false);
    });

    it("narrows to the full union", () => {
      const value: unknown = 42;
      if (check.isStringOrNumberOrNullish(value))
        value satisfies string | number | null | undefined;
    });
  });

  describe("invalid keys", () => {
    it("rejects unsupported prefixes, types, and connectors", () => {
      for (const key of [
        "hasString",
        "is",
        "isBanana",
        "isBooleanXorUndefined",
        "isBooleanOr",
        "isBooleanOrBanana",
      ])
        expect(check[key]).toBeUndefined();
    });

    it("rejects non-string keys", () => {
      const key = Symbol("isBoolean");
      expect((check as Record<symbol, unknown>)[key]).toBeUndefined();
    });
  });

  describe("exports and caching", () => {
    it("shares the named and default export", () => {
      expect(namedCheck).toBe(check);
      expect(check.isString).toBe(isString);
    });

    it("exports isInstanceOf as a standalone helper", () => {
      expect(isInstanceOf(new Date(), Date)).toBe(true);
      expect(isInstanceOf({}, Date)).toBe(false);
      expect(isInstanceOf({}, undefined as unknown as typeof Date)).toBe(false);
    });

    it("exports isInstanceOfOneOf as a standalone helper", () => {
      const constructors = [Date, Error] as const;
      expect(isInstanceOfOneOf(new Date(), constructors)).toBe(true);
      expect(isInstanceOfOneOf(new Error(), constructors)).toBe(true);
      expect(isInstanceOfOneOf({}, constructors)).toBe(false);
      expect(isInstanceOfOneOf(null, constructors)).toBe(false);
      expect(isInstanceOfOneOf(new Date(), [])).toBe(false);
    });

    it("stops checking constructors after the first match", () => {
      class Throwing {
        static [Symbol.hasInstance](): boolean {
          throw new Error("Unexpected instance check");
        }
      }
      expect(isInstanceOfOneOf(new Date(), [Date, Throwing])).toBe(true);
      expect(() => isInstanceOfOneOf({}, [Date, Throwing])).toThrow(
        "Unexpected instance check",
      );
    });

    it("reuses generated predicates", () => {
      expect(check.isBooleanOrUndefined).toBe(check.isBooleanOrUndefined);
    });

    it("keeps repeated invalid lookups undefined", () => {
      expect(check.isBanana).toBe(check.isBanana);
    });
  });
});
