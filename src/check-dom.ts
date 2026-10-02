import typeCheck from "./check.js";
import type { TypeCheckDOM } from "./types-dom.js";

const typeCheckDOM = typeCheck as unknown as TypeCheckDOM;

export * from "./base-dom-checkers.js";
export type { FormControl, InputType, TypeCheckDOM } from "./types-dom.js";
export { typeCheckDOM };
