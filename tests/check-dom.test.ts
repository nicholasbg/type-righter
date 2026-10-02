import { describe, expect, it } from "vitest";
import check from "../src/check.js";
import checkDOM, {
  checkDOM as namedCheckDOM,
  isInput,
} from "../src/check-dom.js";

describe("checkDOM", () => {
  describe("single-type predicates", () => {
    it("isNode", () => {
      expect(checkDOM.isNode(document.createElement("div"))).toBe(true);
      expect(checkDOM.isNode({})).toBe(false);
    });

    it("isElement", () => {
      expect(checkDOM.isElement(document.createElement("div"))).toBe(true);
      expect(checkDOM.isElement(document.createTextNode("x"))).toBe(false);
    });

    it("isHTML", () => {
      expect(checkDOM.isHTML(document.createElement("div"))).toBe(true);
      expect(
        checkDOM.isHTML(
          document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        ),
      ).toBe(false);
    });

    it("isSVG", () => {
      expect(
        checkDOM.isSVG(
          document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        ),
      ).toBe(true);
      expect(checkDOM.isSVG(document.createElement("div"))).toBe(false);
    });

    it("isInput", () => {
      expect(checkDOM.isInput(document.createElement("input"))).toBe(true);
      expect(checkDOM.isInput(document.createElement("div"))).toBe(false);
    });

    it("isDialog", () => {
      expect(checkDOM.isDialog(document.createElement("dialog"))).toBe(true);
      expect(checkDOM.isDialog(document.createElement("div"))).toBe(false);
    });

    it("isFile", () => {
      expect(checkDOM.isFile(new File(["x"], "x.txt"))).toBe(true);
      expect(checkDOM.isFile({})).toBe(false);
    });

    it("isFormControl", () => {
      for (const tag of ["input", "button", "select", "textarea"])
        expect(checkDOM.isFormControl(document.createElement(tag))).toBe(true);
      expect(checkDOM.isFormControl(document.createElement("div"))).toBe(false);
    });

    it("isInputType", () => {
      for (const tag of [
        "input",
        "button",
        "select",
        "textarea",
        "option",
        "fieldset",
        "optgroup",
      ])
        expect(checkDOM.isInputType(document.createElement(tag))).toBe(true);
      expect(checkDOM.isInputType(document.createElement("div"))).toBe(false);
    });
  });

  describe("Or chains", () => {
    it("isElementOrDialog", () => {
      expect(checkDOM.isElementOrDialog(document.createElement("div"))).toBe(
        true,
      );
      expect(checkDOM.isElementOrDialog(document.createElement("dialog"))).toBe(
        true,
      );
      expect(checkDOM.isElementOrDialog({})).toBe(false);
    });

    it("keeps cross-domain chains working at runtime", () => {
      expect(check.isNodeOrNumber?.(document.createElement("div"))).toBe(true);
      expect(check.isNodeOrNumber?.(2)).toBe(true);
      expect(check.isNodeOrNumber?.(true)).toBe(false);
      expect(
        check.areStringsOrNodesOrBooleans?.([
          "a",
          document.createElement("div"),
          true,
        ]),
      ).toBe(true);
    });
  });

  describe("are multi-value predicates", () => {
    it("checks every item in an iterable", () => {
      expect(
        checkDOM.areNode([
          document.createElement("div"),
          document.createElement("span"),
        ]),
      ).toBe(true);
      expect(checkDOM.areNode([document.createElement("div"), {}])).toBe(false);
      expect(checkDOM.areNode([])).toBe(true);
    });

    it("tolerates pluralized type names", () => {
      expect(
        checkDOM.areElements([
          document.createElement("div"),
          document.createElement("span"),
        ]),
      ).toBe(true);
      expect(
        checkDOM.areElementsOrDialogs([
          document.createElement("div"),
          document.createElement("dialog"),
        ]),
      ).toBe(true);
    });
  });

  describe("exports and realms", () => {
    it("aliases the same Proxy as check", () => {
      expect(checkDOM).toBe(check);
      expect(namedCheckDOM).toBe(checkDOM);
      expect(checkDOM.isInput).toBe(isInput);
    });

    it("recognizes elements and Dates from an iframe", () => {
      const frame = document.createElement("iframe");
      document.body.append(frame);
      try {
        const ownerDocument = frame.contentDocument!;
        const ownerWindow = ownerDocument.defaultView as Window &
          typeof globalThis;
        const input = ownerDocument.createElement("input");
        expect(input instanceof HTMLInputElement).toBe(false);
        expect(checkDOM.isInput(input)).toBe(true);
        expect(checkDOM.isNode(input)).toBe(true);
        expect(checkDOM.isElement(input)).toBe(true);
        expect(checkDOM.isFormControl(input)).toBe(true);
        expect(checkDOM.isInputType(input)).toBe(true);
        expect(isInput(input, ownerWindow)).toBe(true);
        expect(check.isDate(new ownerWindow.Date())).toBe(true);
      } finally {
        frame.remove();
      }
    });
  });
});
