import transpileToHTML from "./transpileToHTML.js";
import transpileToSSML from "./transpileToSSML.js";
import { getRangeMap } from "./correlationEngine.js";
import { attachHoverListener, attachSelectionListener } from "./eventListeners.js";

const parser = new DOMParser();
const serializer = new XMLSerializer();

export default class SSMLWorkDiv {
  public static OPEN_SPEAK_TAG = `<speak xmlns="http://www.w3.org/2001/10/synthesis" version="1.0" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;
  public static CLOSE_SPEAK_TAG = `</speak>`;

  private _currentRanges: Range[] | null = null;
  private _currentRangePlaceholders: WeakMap<Range, HTMLSpanElement> =
    new WeakMap();

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
    attachHoverListener(this)
  }
  applySelectionToRange(range: Range) {
    const selectionHolder = document.createElement("span");
    selectionHolder.classList.add("selection-placeholder");
    range.surroundContents(selectionHolder);
    this._currentRangePlaceholders.set(range, selectionHolder);
    // console.log(
    //   "placeholder from weakmap: ",
    //   this._currentRangePlaceholders.get(range)
    // );
  }
  removeSelectionHolders() {
    if (this._currentRanges) {
      this._currentRanges.forEach((range) => {
        const placeholder = this._currentRangePlaceholders.get(range);
        if (!(placeholder instanceof HTMLSpanElement)) return;
        const parent = placeholder.parentElement as HTMLElement;
        placeholder.replaceWith(placeholder.firstChild!);
        parent.normalize();

        this._currentRangePlaceholders.delete(range);
        // console.log(this._currentRangePlaceholders.get(range));
      });
    }
    this._currentRanges = null;
  }

  set currentRanges(range: Range | null) {
    if (this._currentRanges !== null) {
      this.removeSelectionHolders();
    }
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

      let middleRanges: Range[] = [];
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
          middleRanges.push(range);
        }, this);
      }
      this._currentRanges = [headRange, ...middleRanges, endRange];
      // SIMPLER CASE, SELECTION WITHIN SINGLE TEXT NODE
    } else if (range) {
      this._currentRanges = [range];
      this.applySelectionToRange(range);
    }
    // console.log(this._currentRanges);
  }
  
  collectRegionalSSMLData() {
    console.log("collectRegionalSSMLData")
    // if a textNode, climb the tree and collect
    // if an element with SSML data, collect this the data + climb and collect
  }

  // INTERFACE METHODS
  emitSSMLString(headless: boolean) {
    const derivedSSMLDoc = transpileToSSML(this.elt);
    const reserialized = serializer.serializeToString(derivedSSMLDoc);
    return reserialized;
  }
}
