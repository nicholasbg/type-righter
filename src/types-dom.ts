import type { TypeCheckFor } from "./types.js";

export type FormControl =
  | HTMLInputElement
  | HTMLButtonElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type InputType =
  | FormControl
  | HTMLOptionElement
  | HTMLFieldSetElement
  | HTMLOptGroupElement;

type DOMTypeMap = {
  Node: Node;
  Element: Element;
  HTML: HTMLElement;
  SVG: SVGElement;
  Input: HTMLInputElement;
  Dialog: HTMLDialogElement;
  File: File;
  FormControl: FormControl;
  InputType: InputType;
};

export type TypeCheckDOM = TypeCheckFor<DOMTypeMap>;
