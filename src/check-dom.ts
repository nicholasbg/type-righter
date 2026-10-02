import check from "./check.js";
import type { CheckDOM } from "./types-dom.js";

const checkDOM = check as unknown as CheckDOM;

export * from "./base-dom-checkers.js";
export type { CheckDOM, FormControl, InputType } from "./types-dom.js";
export { checkDOM };
export default checkDOM;
