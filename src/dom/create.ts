/**
 * Tiny, typed helpers to build DOM trees without innerHTML.
 * Text is always inserted as text nodes, so content can never inject markup.
 */

type AttributeValue = string | number | boolean | null | undefined;
export type Attributes = Readonly<Record<string, AttributeValue>>;
export type Child = Node | string | number | null | undefined | false;

const SVG_NS = 'http://www.w3.org/2000/svg';

function setAttributes(element: Element, attributes: Attributes): void {
  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || value === undefined) continue;
    element.setAttribute(name, value === true ? '' : String(value));
  }
}

function appendChildren(element: Element, children: readonly Child[]): void {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : String(child));
  }
}

/** Creates an HTML element. */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  setAttributes(element, attributes);
  appendChildren(element, children);
  return element;
}

/** Creates an SVG element. */
export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  setAttributes(element, attributes);
  appendChildren(element, children);
  return element;
}
