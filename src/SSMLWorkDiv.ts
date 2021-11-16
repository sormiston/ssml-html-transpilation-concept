import transpileToHTML from "./transpileToHTML.js";
import transpileToSSML from "./transpileToSSML.js";
import { attachSelectionListener } from "./eventListeners.js";

const parser = new DOMParser();
const serializer = new XMLSerializer();

export default class SSMLWorkDiv {
  public static OPEN_SPEAK_TAG = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;
  public static CLOSE_SPEAK_TAG = `</speak>`;

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

  cacheSelection() {}
}
