import { describe, expect, it } from "vitest";
import typeCheck, {
  isInput,
  typeCheckDOM as namedTypeCheckDOM,
  typeCheckDOM,
} from "../src/index.js";

describe("typeCheckDOM", () => {
  describe("single-type predicates", () => {
    it("isNode", () => {
      expect(typeCheckDOM.isNode(document.createElement("div"))).toBe(true);
      expect(typeCheckDOM.isNode({})).toBe(false);
    });

    it("isElement", () => {
      expect(typeCheckDOM.isElement(document.createElement("div"))).toBe(true);
      expect(typeCheckDOM.isElement(document.createTextNode("x"))).toBe(false);
    });

    it("isHTML", () => {
      expect(typeCheckDOM.isHTML(document.createElement("div"))).toBe(true);
      expect(
        typeCheckDOM.isHTML(
          document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        ),
      ).toBe(false);
    });

    it("isSVG", () => {
      expect(
        typeCheckDOM.isSVG(
          document.createElementNS("http://www.w3.org/2000/svg", "svg"),
        ),
      ).toBe(true);
      expect(typeCheckDOM.isSVG(document.createElement("div"))).toBe(false);
    });

    it("isInput", () => {
      expect(typeCheckDOM.isInput(document.createElement("input"))).toBe(true);
      expect(typeCheckDOM.isInput(document.createElement("div"))).toBe(false);
    });

    it("isDialog", () => {
      expect(typeCheckDOM.isDialog(document.createElement("dialog"))).toBe(
        true,
      );
      expect(typeCheckDOM.isDialog(document.createElement("div"))).toBe(false);
    });

    it("isFile", () => {
      expect(typeCheckDOM.isFile(new File(["x"], "x.txt"))).toBe(true);
      expect(typeCheckDOM.isFile({})).toBe(false);
    });

    it("isFormControl", () => {
      for (const tag of ["input", "button", "select", "textarea"])
        expect(typeCheckDOM.isFormControl(document.createElement(tag))).toBe(
          true,
        );
      expect(typeCheckDOM.isFormControl(document.createElement("div"))).toBe(
        false,
      );
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
        expect(typeCheckDOM.isInputType(document.createElement(tag))).toBe(
          true,
        );
      expect(typeCheckDOM.isInputType(document.createElement("div"))).toBe(
        false,
      );
    });
  });

  describe("Or chains", () => {
    it("isElementOrDialog", () => {
      expect(
        typeCheckDOM.isElementOrDialog(document.createElement("div")),
      ).toBe(true);
      expect(
        typeCheckDOM.isElementOrDialog(document.createElement("dialog")),
      ).toBe(true);
      expect(typeCheckDOM.isElementOrDialog({})).toBe(false);
    });

    it("keeps cross-domain chains working at runtime", () => {
      expect(typeCheck.isNodeOrNumber?.(document.createElement("div"))).toBe(
        true,
      );
      expect(typeCheck.isNodeOrNumber?.(2)).toBe(true);
      expect(typeCheck.isNodeOrNumber?.(true)).toBe(false);
      expect(
        typeCheck.areStringsOrNodesOrBooleans?.([
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
        typeCheckDOM.areNode([
          document.createElement("div"),
          document.createElement("span"),
        ]),
      ).toBe(true);
      expect(typeCheckDOM.areNode([document.createElement("div"), {}])).toBe(
        false,
      );
      expect(typeCheckDOM.areNode([])).toBe(true);
    });

    it("tolerates pluralized type names", () => {
      expect(
        typeCheckDOM.areElements([
          document.createElement("div"),
          document.createElement("span"),
        ]),
      ).toBe(true);
      expect(
        typeCheckDOM.areElementsOrDialogs([
          document.createElement("div"),
          document.createElement("dialog"),
        ]),
      ).toBe(true);
    });
  });

  describe("exports and realms", () => {
    it("aliases the same Proxy as typeCheck", () => {
      expect(typeCheckDOM).toBe(typeCheck);
      expect(namedTypeCheckDOM).toBe(typeCheckDOM);
      expect(typeCheckDOM.isInput).toBe(isInput);
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
        expect(typeCheckDOM.isInput(input)).toBe(true);
        expect(typeCheckDOM.isNode(input)).toBe(true);
        expect(typeCheckDOM.isElement(input)).toBe(true);
        expect(typeCheckDOM.isFormControl(input)).toBe(true);
        expect(typeCheckDOM.isInputType(input)).toBe(true);
        expect(isInput(input, ownerWindow)).toBe(true);
        expect(typeCheck.isDate(new ownerWindow.Date())).toBe(true);
      } finally {
        frame.remove();
      }
    });
  });
});
