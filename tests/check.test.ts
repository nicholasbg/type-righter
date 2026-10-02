import { describe, expect, it } from "vitest";
import typeCheck, {
  isInstanceOf,
  isInstanceOfOneOf,
  isString,
  typeCheck as namedTypeCheck,
} from "../src/check.js";

describe("typeCheck", () => {
  describe("single-type predicates", () => {
    it("isString", () => {
      expect(typeCheck.isString("a")).toBe(true);
      expect(typeCheck.isString(1)).toBe(false);
    });

    it("isNumber", () => {
      expect(typeCheck.isNumber(1)).toBe(true);
      expect(typeCheck.isNumber("1")).toBe(false);
    });

    it("isBoolean", () => {
      expect(typeCheck.isBoolean(true)).toBe(true);
      expect(typeCheck.isBoolean(0)).toBe(false);
    });

    it("isBigInt", () => {
      expect(typeCheck.isBigInt(1n)).toBe(true);
      expect(typeCheck.isBigInt(1)).toBe(false);
    });

    it("isSymbol", () => {
      expect(typeCheck.isSymbol(Symbol("s"))).toBe(true);
      expect(typeCheck.isSymbol("s")).toBe(false);
    });

    it("isFunction", () => {
      expect(typeCheck.isFunction(() => {})).toBe(true);
      expect(typeCheck.isFunction({})).toBe(false);
    });

    it("isObject", () => {
      expect(typeCheck.isObject({})).toBe(true);
      expect(typeCheck.isObject(null)).toBe(false);
    });

    it("isArray", () => {
      expect(typeCheck.isArray([1, 2])).toBe(true);
      expect(typeCheck.isArray({})).toBe(false);
    });

    it("isIterableObj", () => {
      expect(typeCheck.isIterableObj([1, 2])).toBe(true);
      expect(typeCheck.isIterableObj(new Set())).toBe(true);
      expect(typeCheck.isIterableObj("a")).toBe(false);
      expect(typeCheck.isIterableObj({})).toBe(false);
    });

    it("isDate", () => {
      expect(typeCheck.isDate(new Date())).toBe(true);
      expect(typeCheck.isDate("2020-01-01")).toBe(false);
    });

    it("isNull", () => {
      expect(typeCheck.isNull(null)).toBe(true);
      expect(typeCheck.isNull(undefined)).toBe(false);
    });

    it("isUndefined", () => {
      expect(typeCheck.isUndefined(undefined)).toBe(true);
      expect(typeCheck.isUndefined(null)).toBe(false);
    });

    it("isNullish", () => {
      expect(typeCheck.isNullish(null)).toBe(true);
      expect(typeCheck.isNullish(undefined)).toBe(true);
      expect(typeCheck.isNullish(0)).toBe(false);
    });

    it("isFalsy", () => {
      for (const value of [false, 0, -0, 0n, "", null, undefined, NaN])
        expect(typeCheck.isFalsy(value)).toBe(true);
      expect(typeCheck.isFalsy("a")).toBe(false);
      expect(typeCheck.isFalsy(1)).toBe(false);
      expect(typeCheck.isFalsy({})).toBe(false);
    });

    it("isNaNType", () => {
      expect(typeCheck.isNaNType(NaN)).toBe(true);
      expect(typeCheck.isNaNType(1)).toBe(false);
      expect(typeCheck.isNaNType("NaN")).toBe(false);
    });
  });

  describe("Or chains", () => {
    it("isBooleanOrUndefined", () => {
      expect(typeCheck.isBooleanOrUndefined(true)).toBe(true);
      expect(typeCheck.isBooleanOrUndefined(undefined)).toBe(true);
      expect(typeCheck.isBooleanOrUndefined(null)).toBe(false);
    });

    it("isStringOrNumber", () => {
      expect(typeCheck.isStringOrNumber("x")).toBe(true);
      expect(typeCheck.isStringOrNumber(2)).toBe(true);
      expect(typeCheck.isStringOrNumber(true)).toBe(false);
    });

    it("chains three types", () => {
      expect(typeCheck.isStringOrNumberOrNullish("x")).toBe(true);
      expect(typeCheck.isStringOrNumberOrNullish(2)).toBe(true);
      expect(typeCheck.isStringOrNumberOrNullish(null)).toBe(true);
      expect(typeCheck.isStringOrNumberOrNullish(undefined)).toBe(true);
      expect(typeCheck.isStringOrNumberOrNullish({})).toBe(false);
    });

    it("keeps Falsy available in Or chains", () => {
      expect(typeCheck.isStringOrFalsy("x")).toBe(true);
      expect(typeCheck.isStringOrFalsy(0)).toBe(true);
      expect(typeCheck.isStringOrFalsy({})).toBe(false);
    });

    it("supports runtime chains beyond three types", () => {
      expect(typeCheck.isStringOrNumberOrBooleanOrNullish?.("x")).toBe(true);
      expect(typeCheck.isStringOrNumberOrBooleanOrNullish?.(true)).toBe(true);
      expect(typeCheck.isStringOrNumberOrBooleanOrNullish?.(null)).toBe(true);
      expect(typeCheck.isStringOrNumberOrBooleanOrNullish?.({})).toBe(false);
    });
  });

  describe("are multi-value predicates", () => {
    it("checks every item in an iterable", () => {
      expect(typeCheck.areString(["a", "b", "c"])).toBe(true);
      expect(typeCheck.areString(["a", 1, "c"])).toBe(false);
      expect(typeCheck.areString([])).toBe(true);
    });

    it("checks falsy values", () => {
      expect(typeCheck.areFalsy([false, 0, "", null, undefined, NaN])).toBe(true);
      expect(typeCheck.areFalsy([false, 1])).toBe(false);
      expect(typeCheck.areFalsy([])).toBe(true);
    });

    it("checks Or chains", () => {
      expect(typeCheck.areStringOrNumber(["a", 1, "b"])).toBe(true);
      expect(typeCheck.areStringOrNumber(["a", true, "b"])).toBe(false);
    });

    it("tolerates pluralized type names", () => {
      expect(typeCheck.areStrings(["a", "b", "c"])).toBe(true);
      expect(typeCheck.areStrings(["a", 1, "c"])).toBe(false);
      expect(typeCheck.areStringsOrNumbers(["a", 1, "b"])).toBe(true);
      expect(typeCheck.areStringsOrNumbersOrBooleans(["a", 1, true])).toBe(true);
    });

    it("narrows arrays without changing their container", () => {
      const values: unknown[] = ["a", "b", "c"];
      if (typeCheck.areString(values)) {
        expect(values.map((value) => value.toUpperCase())).toEqual([
          "A",
          "B",
          "C",
        ]);
      }
      if (typeCheck.areStringOrArray(values))
        expect(values.map((value) => value.length)).toEqual([1, 1, 1]);
      if (typeCheck.areStringsOrArrays(values))
        expect(values.map((value) => value.length)).toEqual([1, 1, 1]);
      if (typeCheck.areStringsOrBooleansOrNumbers(values))
        expect(values.map((value) => value.toString())).toEqual(values);
    });

    it("accepts Sets and consumes generators", () => {
      expect(typeCheck.areStrings(new Set(["a", "b"]))).toBe(true);
      expect(typeCheck.areStrings(new Set(["a", 1]))).toBe(false);
      const values = (function* () {
        yield "a";
        yield "b";
      })();
      expect(typeCheck.areStrings(values)).toBe(true);
      expect([...values]).toEqual([]);
    });

    it("supports mixed pluralization at runtime", () => {
      expect(typeCheck.areStringOrNumbers?.(["a", 1])).toBe(true);
      expect(typeCheck.areStringOrNumbers?.([true])).toBe(false);
    });

    it("supports runtime chains beyond three types", () => {
      expect(
        typeCheck.areStringsOrNumbersOrBooleansOrDates?.([
          "a",
          1,
          true,
          new Date(),
        ]),
      ).toBe(true);
      expect(
        typeCheck.areStringOrNumberOrBooleanOrDate?.(["a", 1, true, new Date()]),
      ).toBe(true);
    });

    it("returns undefined for unknown or incomplete keys", () => {
      expect(typeCheck.areBanana).toBeUndefined();
      expect(typeCheck.are).toBeUndefined();
    });

    it("reuses the same function on repeated access", () => {
      expect(typeCheck.areString).toBe(typeCheck.areString);
    });
  });

  describe("type narrowing", () => {
    it("narrows inside if-blocks", () => {
      const checkValue = (value: unknown) => {
        if (typeCheck.isString(value)) {
          value.toUpperCase();
          return true;
        }
        if (typeCheck.isNumber(value)) {
          value.toFixed();
          return true;
        }
        if (typeCheck.isNumberOrStringOrUndefined(value)) return true;
        if (typeCheck.isDateOrNull(value)) return true;
        return false;
      };
      expect(checkValue("x")).toBe(true);
      expect(checkValue(1)).toBe(true);
      expect(checkValue(undefined)).toBe(true);
      expect(checkValue(true)).toBe(false);
    });

    it("narrows to the full union", () => {
      const value: unknown = 42;
      if (typeCheck.isStringOrNumberOrNullish(value))
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
        expect(typeCheck[key]).toBeUndefined();
    });

    it("rejects non-string keys", () => {
      const key = Symbol("isBoolean");
      expect((typeCheck as Record<symbol, unknown>)[key]).toBeUndefined();
    });
  });

  describe("exports and caching", () => {
    it("shares the named and default export", () => {
      expect(namedTypeCheck).toBe(typeCheck);
      expect(typeCheck.isString).toBe(isString);
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
          throw new Error("Unexpected instance typeCheck");
        }
      }
      expect(isInstanceOfOneOf(new Date(), [Date, Throwing])).toBe(true);
      expect(() => isInstanceOfOneOf({}, [Date, Throwing])).toThrow(
        "Unexpected instance typeCheck",
      );
    });

    it("reuses generated predicates", () => {
      expect(typeCheck.isBooleanOrUndefined).toBe(typeCheck.isBooleanOrUndefined);
    });

    it("keeps repeated invalid lookups undefined", () => {
      expect(typeCheck.isBanana).toBe(typeCheck.isBanana);
    });
  });
});
