import { isObject } from "./base-type-checkers.js";

/**
 * Resolves a node's owning window through `ownerDocument.defaultView`,
 * or a document's own `defaultView`, for cross-realm instance checks.
 * Reads these properties without validating that the value is a DOM node.
 *
 * @param node - Node or document whose owning window to resolve.
 * @returns The owning window, or null for non-objects or documents without a view.
 */
const getNodeWindow = (node: unknown): (Window & typeof globalThis) | null => {
  if (!isObject(node)) return null;

  const nodeAsNode = node as Node;
  if (nodeAsNode.ownerDocument) return nodeAsNode.ownerDocument.defaultView;

  return (node as Document).defaultView || null;
};

export default getNodeWindow;
