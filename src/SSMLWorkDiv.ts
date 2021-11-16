import transpileToHTML from "./transpileToHTML.js";
import transpileToSSML from "./transpileToSSML.js";
import { getRangeMap } from "./correlationEngine.js";
import { attachSelectionListener } from "./eventListeners.js";

const parser = new DOMParser();
const serializer = new XMLSerializer();

export default class SSMLWorkDiv {
  public static OPEN_SPEAK_TAG = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;
  public static CLOSE_SPEAK_TAG = `</speak>`;

  _currentRange: Range | null = null;

  elt = document.createElement("div");
  anchorElt: HTMLElement;

  constructor(
    anchorElt: HTMLElement,
    SSMLString: string,
    simpleSpeak?: boolean
  ) {
    if (simpleSpeak) {
      SSMLWorkDiv.OPEN_SPEAK_TAG = "<speak>";
      SSMLWorkDiv.CLOSE_SPEAK_TAG = "</speak>";
    }

    this.elt.classList.add("ssml-edit-div");
    this.elt.setAttribute("contenteditable", "true");

    const subtree = transpileToHTML(
      parser.parseFromString(
        SSMLWorkDiv.OPEN_SPEAK_TAG + SSMLString + SSMLWorkDiv.CLOSE_SPEAK_TAG,
        "text/xml"
      )
    );
    if (subtree) {
      this.elt.appendChild(subtree);
    }
    this.anchorElt = anchorElt;
    // this.elt.addEventListener("selectstart", (e) => console.log(e));
    this.anchorElt.prepend(this.elt);
    attachSelectionListener(this);
  }
  applySelectionToRange(range: Range) {
    const selectionHolder = document.createElement("span");
    selectionHolder.classList.add("selection-placeholder");
    range.surroundContents(selectionHolder);
  }
  set currentRange(range: Range | null) {
    // IF RANGE ENCOMPASSES MULTIPLE TEXT NODES 
    if (range && range.commonAncestorContainer instanceof HTMLElement) {
      const rangeMap = getRangeMap(
        range.toString(),
        range.commonAncestorContainer
      );

      const headRange = document.createRange();
      headRange.setStart(range.startContainer, range.startOffset);
      headRange.setEnd(
        range.startContainer,
        range.startContainer.textContent!.length
      );
      this.applySelectionToRange(headRange);

      const endRange = document.createRange();
      endRange.setStart(range.endContainer, 0);
      endRange.setEnd(range.endContainer, range.endOffset);

      this.applySelectionToRange(endRange);

      if (Reflect.ownKeys(rangeMap).length > 2) {
        const middleRangeKeys = Reflect.ownKeys(rangeMap).filter(
          (k, i, arr) => {
            return i > 0 && i < arr.length - 1;
          }
        );
        middleRangeKeys.forEach((k) => {
          const targetTNode = rangeMap[k as string];
          const range = document.createRange();
          range.selectNodeContents(targetTNode);

          this.applySelectionToRange(range);
        }, this);
      }
      // SIMPLER CASE, SELECTION WITHIN SINGLE TEXT NODE
    } else if (range) {
      this._currentRange = range;
      const selectionHolder = document.createElement("span");
      selectionHolder.classList.add("selection-placeholder");
      range.surroundContents(selectionHolder);
    }
  }
}
