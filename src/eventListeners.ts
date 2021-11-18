import { SSML_TAGS, MSTTS_PREFIXED_TAGS } from "./constants.js"

function expandSelectionToWordBoundaries(range: Range) {
  let { startContainer, endContainer, startOffset, endOffset } = range;
  const { commonAncestorContainer } = range;

  const wordBoundaryRegex = /\s|\.(?=\s)|!|\.$/gm;

  const { textContent } = commonAncestorContainer;
  if (!textContent) return;

  function expandStart() {
    let i = 0;
    let done = false;
    let prev;
    const textContent = startContainer.textContent;
    if (textContent === null) throw new Error("no text selected!");
    while (!done && i < 100) {
      i++;
      prev = textContent[startOffset - 1];
      if (!prev) break;
      const isBoundary = wordBoundaryRegex.test(prev);
      if (isBoundary) {
        done = true;
      } else startOffset = startOffset - 1;
    }
    range.setStart(startContainer, startOffset);
    return range.toString();
  }
  function expandEnd() {
    let i = 0;
    let done = false;
    let next;
    const textContent = endContainer.textContent;
    if (textContent === null) throw new Error("no text selected!");
    while (!done && i < 100) {
      i++;
      next = textContent[endOffset];
      if (!next) break;
      const isBoundary = wordBoundaryRegex.test(next);
      if (isBoundary) {
        done = true;
      } else endOffset = endOffset + 1;
    }
    range.setEnd(endContainer, endOffset);
    return range.toString();
  }
  expandStart();
  expandEnd();
  return range;
}

export function attachSelectionListener(SSMLWorkDiv: any) {
  const { elt } = SSMLWorkDiv;
  elt.addEventListener("selectstart", handleSelectionChange);

  function handleSelectionChange() {
    elt.addEventListener("mouseup", handleSelection);
    elt.addEventListener("keyup", handleSelection);
  }

  function handleSelection() {
    SSMLWorkDiv.removeSelectionHolders();
    const sel = document.getSelection();
    if (sel) {
      if (sel.isCollapsed) return;
      const adjustedRanges = expandSelectionToWordBoundaries(sel.getRangeAt(0));
      SSMLWorkDiv.currentRanges = adjustedRanges;
      sel.removeAllRanges();
    }
    elt.removeEventListener("mouseup", handleSelection);
    elt.removeEventListener("keyup", handleSelection);
  }
}

export function attachHoverListener(SSMLWorkDiv: any) {
  const { elt } = SSMLWorkDiv
  elt.addEventListener("mouseover", (e: MouseEvent) => {
    let target = e.target
    if (!(target instanceof HTMLElement)) return
    let ssmlTagDetected = [...target.classList].find(c => {
      return [...Object.values(SSML_TAGS), ...Object.values(MSTTS_PREFIXED_TAGS), "text-node"].includes(c)
    })
    if (ssmlTagDetected) {
      SSMLWorkDiv.collectRegionalSSMLData(ssmlTagDetected)
    }
  } )
}
