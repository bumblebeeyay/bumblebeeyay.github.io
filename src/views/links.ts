import { h, type Attributes, type Child } from "../dom/create";

/**
 * A link that leaves the garden. It opens in a new tab so the visit is not lost,
 * and `noopener` keeps that tab from controlling this page through `window.opener`.
 */
export function externalLink(
  href: string,
  attributes: Attributes,
  ...children: Child[]
): HTMLAnchorElement {
  return h(
    "a",
    { ...attributes, href, target: "_blank", rel: "noopener noreferrer" },
    ...children,
  );
}
