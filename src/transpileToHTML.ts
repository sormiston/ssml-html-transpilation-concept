import { SSML_TAGS } from "./constants.js";

export function transpileToHTML(doc: Document): DocumentFragment {
  let done = false;
  while (!done) {
    done = editPass(doc);
  }
  
  const docFragment = returnAsFragment(doc)
  // console.log("compiled HTML");
  // console.log(docFragment)
  return docFragment;
}

function returnAsFragment(doc: Document): DocumentFragment {
  if (doc.firstElementChild?.childNodes) {
    const fragment = new DocumentFragment();
    fragment.append(...doc.firstElementChild.childNodes);
    return fragment;
  } else {
    throw new Error("Empty HTML document from SSML input");
  }
}

function wrapLooseTextChildren(childNodes: NodeListOf<ChildNode>) {
  // const nodeFilter = {
  //   acceptNode: function (node: Text) {
  //     if (node.parentElement) {
  //       return NodeFilter.FILTER_ACCEPT;
  //     } else return NodeFilter.FILTER_SKIP;
  //   },
  // };
  // let textNodeIterator = document.createNodeIterator(
  //   root,
  //   NodeFilter.SHOW_TEXT,
  //   null
  // );

  return [...childNodes].map((cn) => {
    if (cn instanceof Text) {
      const span = document.createElement("span")
      span.classList.add("text-node")
      span.setAttribute("removal-flag", "text-node")
      cn.remove()
      span.append(cn)
      return span
    } else {
      return cn
    }
  })
}

function createElementIterator(doc: Document) {
  const nodeFilter = {
    acceptNode: function (node: Node) {
      // if Element is not an HTML tag...
      if (
        !Object.values(HTML_TAGS).includes(
          (node as Element)?.tagName.toLowerCase()
        )
      ) {
        return NodeFilter.FILTER_ACCEPT;
      } else return NodeFilter.FILTER_SKIP;
    },
  };

  const elementIterator = document.createNodeIterator(
    doc.firstElementChild!,
    NodeFilter.SHOW_ELEMENT,
    nodeFilter
  );
  return elementIterator;
}

function editPass(doc: Document) {
  const elementIterator = createElementIterator(doc);
  const src = elementIterator.nextNode() as Element;

  if (!src) {
    return true;
  }

  const newTag = chooseHTMLTag(src.tagName);
  let newElt = document.createElement(newTag);

  if (newElt instanceof HTMLDivElement) {
    attributeTransfer(src, newElt as HTMLDivElement);
  } else if (newElt instanceof HTMLSpanElement) {
    attributeTransfer(src, newElt as HTMLSpanElement);
  } else if (newElt instanceof HTMLInputElement) {
    attributeTransfer(src, newElt as HTMLInputElement);
  }

  const children = wrapLooseTextChildren(src.childNodes);
  newElt.append(...children);

  newElt = addNewParentage(src.tagName, newElt);
  src.replaceWith(newElt);
  return false;
}

function chooseHTMLTag(ssmlTag: string) {
  switch (ssmlTag) {
    // case SSML_TAGS.voice:
    //   return HTML_TAGS.div;
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
function attributeTransfer(src: Element, target: Element) {
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

function addNewParentage(ssmlTag: string, newElt: HTMLElement) {
  switch (ssmlTag) {
    case SSML_TAGS.voice:
      const div1 = document.createElement("div");
      div1.classList.add("voice-block");
      div1.setAttribute("removal-flag", SSML_TAGS.voice);
      const div2 = document.createElement("div");
      div2.classList.add("block-placeholder");
      div2.append(newElt);
      div1.append(div2);
      return div1;
    default:
      return newElt;
  }
}
const HTML_TAGS = {
  div: "div",
  span: "span",
  input: "input",
};
