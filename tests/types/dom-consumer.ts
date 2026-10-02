import type { FormControl, TypeCheck, TypeCheckDOM } from "type-righter";
import typeCheck, {
  isElement,
  isFormControl,
  isString,
  typeCheckDOM,
} from "type-righter";

declare function expectType<T>(value: T): void;

export const checkDOMTypes = (value: unknown, values: unknown[]) => {
  expectType<TypeCheck>(typeCheck);
  expectType<TypeCheckDOM>(typeCheckDOM);
  if (typeCheck.isString(value)) value.toUpperCase();
  if (isString(value)) value.toUpperCase();
  if (typeCheckDOM.isNode(value)) value.nodeType;
  if (isElement(value)) value.matches("input");
  if (isFormControl(value)) expectType<FormControl>(value);
  if (typeCheckDOM.isInputOrDialog(value))
    expectType<HTMLInputElement | HTMLDialogElement>(value);
  if (typeCheckDOM.isHTMLOrSVGOrFile(value))
    expectType<HTMLElement | SVGElement | File>(value);
  if (typeCheckDOM.areInputsOrDialogs(values))
    expectType<(HTMLInputElement | HTMLDialogElement)[]>(values);
  if (typeCheckDOM.areHTMLOrSVG(values))
    expectType<(HTMLElement | SVGElement)[]>(values);
  // @ts-expect-error Cross-domain chains do not have precise DOM-view keys.
  typeCheckDOM.isNodeOrNullish(value);
  typeCheckDOM.isNodeOrNullish?.(value);
};
