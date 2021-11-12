export function mountEditableSSML(
  fragment: DocumentFragment,
  divSelector?: string
): HTMLDivElement {
  const div = divSelector
    ? document.querySelector("div" + divSelector)
    : document.createElement("div");
  if (div instanceof HTMLDivElement) {
    div.appendChild(fragment);
  } else {
    throw new Error("no div found with selector: " + divSelector);
  }
  return div;
}
