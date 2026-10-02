import checkDOM, { isElement, isFormControl } from "type-righter/dom";
import type { FormControl } from "type-righter/dom";

declare function expectType<T>(value: T): void;

export const checkDOMTypes = (value: unknown, values: unknown[]) => {
  if (checkDOM.isNode(value)) value.nodeType;
  if (isElement(value)) value.matches("input");
  if (isFormControl(value)) expectType<FormControl>(value);
  if (checkDOM.isInputOrDialog(value))
    expectType<HTMLInputElement | HTMLDialogElement>(value);
  if (checkDOM.isHTMLOrSVGOrFile(value))
    expectType<HTMLElement | SVGElement | File>(value);
  if (checkDOM.areInputsOrDialogs(values))
    expectType<(HTMLInputElement | HTMLDialogElement)[]>(values);
  if (checkDOM.areHTMLOrSVG(values))
    expectType<(HTMLElement | SVGElement)[]>(values);
  // @ts-expect-error Cross-domain chains do not have precise DOM-view keys.
  checkDOM.isNodeOrNullish(value);
  checkDOM.isNodeOrNullish?.(value);
};
