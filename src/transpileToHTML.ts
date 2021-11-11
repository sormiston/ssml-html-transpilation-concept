import { SSML_TAGS } from "./transpileToSSML.js";

export function transpileToHTML(doc: XMLDocument) {
  let done = false;
  while (!done) {
    done = editPass(doc);
  }
  return doc;
}

function createElementIterator(doc: XMLDocument) {
  const nodeFilter = {
    acceptNode: function (node: Node) {
      // if Element is not an HTML tag...
      if (!Object.values(HTML_TAGS).includes((node as Element)?.tagName)) {
        return NodeFilter.FILTER_ACCEPT;
      } else return NodeFilter.FILTER_SKIP;
    },
  };
  // const elementIteratorPreflight = document.createNodeIterator(
  //   doc.firstElementChild!,
  //   NodeFilter.SHOW_ELEMENT,
  //   nodeFilter
  // );

  // let run
  // while ((run = elementIteratorPreflight.nextNode())) {
  //   console.log(run)
  // }
  const elementIterator = document.createNodeIterator(
    doc.firstElementChild!,
    NodeFilter.SHOW_ELEMENT,
    nodeFilter
  );
  return elementIterator;
}

function editPass(doc: XMLDocument) {
  const elementIterator = createElementIterator(doc);
  // console.log(elementIterator.referenceNode);
  const src = elementIterator.nextNode() as Element;
  if (src === null) {
    console.log("done");
    return true;
  }

  // const newTag =
  //   src.tagName === "voice"
  //     ? "div"
  //     : src.tagName === "break"
  //     ? "input"
  //     : "span";
  
  const newTag = chooseHTMLTag(src.tagName);
  const newElt = document.createElement(newTag);
  
  if (newElt instanceof HTMLDivElement) {
    attributeTransfer(src, newElt as HTMLDivElement);
  } else if (newElt instanceof HTMLSpanElement) {
    attributeTransfer(src, newElt as HTMLSpanElement);
  } else if (newElt instanceof HTMLInputElement) {
      attributeTransfer(src, newElt as HTMLInputElement);
  }
  

  const children = src.childNodes;
  newElt.append(...children);
  src.replaceWith(newElt);
  return false;
}

function chooseHTMLTag(ssmlTag: string) {
  switch (ssmlTag) {
    case SSML_TAGS.voice:
      return HTML_TAGS.div;
    case SSML_TAGS.break:
      return HTML_TAGS.input;
    default:
      return HTML_TAGS.span;
  }
}

function attributeTransfer(
  src: Element,
  target: HTMLDivElement
): HTMLDivElement;
function attributeTransfer(
  src: Element,
  target: HTMLSpanElement
): HTMLSpanElement;
function attributeTransfer(
  src: Element,
  target: HTMLInputElement
): HTMLInputElement;
function attributeTransfer (src: Element, target: Element) {
  const attributes = src.attributes;
  for (const attr of attributes) {
    target.setAttribute(`ssml-${attr.name}`, attr.value);
  }
  switch (src.tagName) {
    case "voice":
      target.classList.add("voice");
      const voiceNameRegex = new RegExp(
        /[a-z]{2}-[A-Z]{2}-(?<name>\w*)Neural/,
        ""
      );
      const dataContent = src.getAttribute("name")!.match(voiceNameRegex)!
        .groups!.name;
      target.setAttribute("data-content", dataContent);
      break;
    case "mstts:express-as":
      target.classList.add("express-as");
      target.setAttribute(
        "data-content",
        (("❮" + src.getAttribute("style")) as string) + "❯"
      );
      break;
    case "break":
      target.classList.add("break", "inert");
      // (target as HTMLInputElement).disabled = true;
      (target as HTMLInputElement).value = src.getAttribute("time")!;
      (target as HTMLInputElement).type = "button";
      break;
    default:
      target.classList.add(src.tagName);
      break;
  }
  return target;
}

const HTML_TAGS = {
  div: "div",
  span: "span",
  input: "input",
};
