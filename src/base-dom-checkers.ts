import { isInstanceOf, isInstanceOfOneOf } from "./base-type-checkers.js";
import getNodeWindow from "./get-node-window.js";
import type { FormControl, InputType } from "./types-dom.js";

/**
 * Narrows a value to a Node using its owning window's constructor.
 * Supports other realms; returns false when no owning window is available.
 *
 * @param node - Value to check.
 * @returns True if the value is a Node in its owning realm.
 */
export const isNode = (node: unknown): node is Node => {
  const ownGlobal = getNodeWindow(node);
  return Boolean(ownGlobal && isInstanceOf(node, ownGlobal.Node));
};

/**
 * Narrows a value to an Element using the supplied or inferred owning window.
 * Returns false when no window is available.
 *
 * @param elem - Value to check.
 * @param ownerWindow - Window whose constructor to use; defaults to the element's own.
 * @returns True if the value is an Element in the selected realm.
 */
export const isElement = (
  elem: unknown,
  ownerWindow?: Window & typeof globalThis,
): elem is Element => {
  const ownGlobal = ownerWindow ?? getNodeWindow(elem);
  return Boolean(ownGlobal && isInstanceOf(elem, ownGlobal.Element));
};

/**
 * Narrows a value to an HTMLElement using its owning window's constructor.
 * Excludes SVG elements; returns false when no owning window is available.
 *
 * @param elem - Value to check.
 * @returns True if the value is an HTMLElement in its owning realm.
 */
export const isHTML = (elem: unknown): elem is HTMLElement => {
  const ownGlobal = getNodeWindow(elem);
  return Boolean(ownGlobal && isInstanceOf(elem, ownGlobal.HTMLElement));
};

/**
 * Narrows a value to an SVGElement using its owning window's constructor.
 * Returns false when no owning window is available.
 *
 * @param elem - Value to check.
 * @returns True if the value is an SVGElement in its owning realm.
 */
export const isSVG = (elem: unknown): elem is SVGElement => {
  const ownGlobal = getNodeWindow(elem);
  return Boolean(ownGlobal && isInstanceOf(elem, ownGlobal.SVGElement));
};

/**
 * Narrows a value to an HTMLInputElement, regardless of its input `type`.
 * Returns false when neither a supplied nor an inferred window is available.
 *
 * @param elem - Value to check.
 * @param ownerWindow - Window whose constructor to use; defaults to the element's own.
 * @returns True if the value is an HTMLInputElement in the selected realm.
 */
export const isInput = (
  elem: unknown,
  ownerWindow?: Window & typeof globalThis,
): elem is HTMLInputElement => {
  const ownGlobal = ownerWindow ?? getNodeWindow(elem);
  return Boolean(ownGlobal && isInstanceOf(elem, ownGlobal.HTMLInputElement));
};

/**
 * Narrows a value to an HTMLDialogElement, whether open or closed.
 * Uses its owning window; returns false when that window is unavailable.
 *
 * @param elem - Value to check.
 * @returns True if the value is an HTMLDialogElement in its owning realm.
 */
export const isDialog = (elem: unknown): elem is HTMLDialogElement => {
  const ownGlobal = getNodeWindow(elem);
  return Boolean(ownGlobal && isInstanceOf(elem, ownGlobal.HTMLDialogElement));
};

/**
 * Narrows a value to a File using the current realm's `File` constructor.
 * Files from other realms may not match; requires the global `File` to exist.
 *
 * @param val - Value to check.
 * @returns True if the value is a File in the current realm.
 */
export const isFile = (val: unknown): val is File => isInstanceOf(val, File);

/**
 * Narrows a value to an input, button, select, or textarea, including disabled controls.
 * Returns false when neither a supplied nor an inferred window is available.
 *
 * @param elem - Value to check.
 * @param ownerWindow - Window whose constructors to use; defaults to the element's own.
 * @returns True if the value is a supported form control in the selected realm.
 */
export const isFormControl = (
  elem: unknown,
  ownerWindow?: Window & typeof globalThis,
): elem is FormControl => {
  const ownGlobal = ownerWindow ?? getNodeWindow(elem);
  return Boolean(
    ownGlobal &&
    (isInput(elem, ownGlobal) ||
      isInstanceOfOneOf(elem, [
        ownGlobal.HTMLButtonElement,
        ownGlobal.HTMLSelectElement,
        ownGlobal.HTMLTextAreaElement,
      ])),
  );
};

/**
 * Narrows a value to a form control, option, fieldset, or optgroup.
 * Uses its owning window; does not check disabled state or form membership.
 * Returns false when no owning window is available.
 *
 * @param elem - Value to check.
 * @returns True if the value is one of the supported input-related elements.
 */
export const isInputType = (elem: unknown): elem is InputType => {
  const ownGlobal = getNodeWindow(elem);
  return Boolean(
    ownGlobal &&
    (isFormControl(elem, ownGlobal) ||
      isInstanceOfOneOf(elem, [
        ownGlobal.HTMLOptionElement,
        ownGlobal.HTMLFieldSetElement,
        ownGlobal.HTMLOptGroupElement,
      ])),
  );
};
