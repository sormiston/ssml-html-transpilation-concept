export function transpileToSSML(src: HTMLElement): XMLDocument {
  let done = false;
  while (!done) {
    done = editPass(src);
  }
  done = false;
  while (!done) {
    done = removeInvasiveNewlines(src);
  }

  const doc = document.implementation.createDocument(
    "http://www.w3.org/2001/10/synthesis",
    "speak",
    null
  );
  let rootSpeak = doc.firstElementChild!;
  rootSpeak.setAttribute("version", "1.0");
  // rootSpeak.setAttribute("xmlns", "http://www.w3.org/2001/10/synthesis");
  rootSpeak.setAttribute("xmlns:mstts", "http://www.w3.org/2001/mstts");
  // rootSpeak.setAttribute("xmlns:emo", "http://www.w3.org/2009/10/emotionml");
  rootSpeak.setAttribute("xml:lang", "en-US");
  rootSpeak.append(...src.childNodes);
  console.dir(doc.childNodes[0].childNodes[0]);

  return doc;
}

function createElementIterator(root: Element) {
  const nodeFilter = {
    acceptNode: function (node: Element) {
      // if Element has recognized ssml tag in its classlist...
      if (
        [...node.classList].find((classString) => {
          return (
            Object.values(SSML_TAGS).includes(classString) ||
            Object.values(MSTTS_PREFIXED_TAGS).includes("mstts:" + classString)
          );
        }) ||
        node.hasAttribute("removal-flag")
      ) {
        return NodeFilter.FILTER_ACCEPT;
      } else return NodeFilter.FILTER_SKIP;
    },
  };
  const elementIterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_ELEMENT,
    nodeFilter
  );
  return elementIterator;
}
function removeInvasiveNewlines(root: Element) {
  const nodeFilter = {
    acceptNode: function (node: Text) {
      if (node.nodeValue === null || node.nodeValue?.trim().length === 0) {
        return NodeFilter.FILTER_ACCEPT;
      } else return NodeFilter.FILTER_SKIP;
    },
  };
  let textNodeIterator = document.createNodeIterator(
    root,
    NodeFilter.SHOW_TEXT,
    nodeFilter
  );

  let src = textNodeIterator.nextNode() as Text;
  if (src === null) {
    return true;
  }

  src.remove();
  return false;
}

function editPass(root: HTMLElement) {
  const elementIterator = createElementIterator(root);
  const src = elementIterator.nextNode() as HTMLElement;
  if (src === null) {
    return true;
  }
  // if this is "added HTML" then we should splice to adjust the tree now and attempt no SSML transpilation
  const disassemblyRequired = disassemblyPhase(src);
  if (disassemblyRequired) return false;

  let newTag = [...src.classList].find((classString) => {
    return (
      Object.values(SSML_TAGS).includes(classString) ||
      Object.values(MSTTS_PREFIXED_TAGS).includes("mstts:" + classString)
    );
  });
  if (newTag === undefined) {
    throw new Error("Could not derive SSML tag from an HTMLElement classlist!");
  }
  newTag = prefixIfNeeded(newTag);
  let newElt;
  if (Object.values(MSTTS_PREFIXED_TAGS).includes(newTag)) {
    newElt = document.createElementNS("http://www.w3.org/2001/mstts", newTag);
  } else {
    newElt = document.createElementNS(
      "http://www.w3.org/2001/10/synthesis",
      newTag
    );
  }

  attributeTransfer(src, newElt);
  // filter out invasive \n text nodes
  const children = src.childNodes;
  newElt.append(...children);
  src.replaceWith(newElt);
  return false;
}

function prefixIfNeeded(tag: string) {
  if (Object.values(MSTTS_PREFIXED_TAGS).includes("mstts:" + tag)) {
    return "mstts:" + tag;
  } else return tag;
}

function attributeTransfer(src: Element, target: Element) {
  const attributes = src.attributes;
  const ssmlTag = target.tagName.toLowerCase();
  let filtered = [...attributes].filter((attr) => {
    return attr.name.startsWith("ssml-");
  });

  if (!filtered) {
    throw new Error(`no attributes found while populating <${ssmlTag}>`);
  }
  filtered.forEach((attr) => {
    target.setAttribute(attr.name.substring(5), attr.value);
  });
}

function disassemblyPhase(elt: HTMLElement) {
  const flag = elt.getAttribute("removal-flag");
  if (!flag) return false;

  switch (flag) {
    case SSML_TAGS.voice:
      const target = elt.querySelector(".voice");
      target?.remove();
      elt.replaceWith(target!);
      return true;
    default:
      return false;
  }
}

// SSML TAG CONSTANTS

export const SSML_TAGS = {
  voice: "voice",
  lang: "lang",
  p: "p",
  s: "s",
  phoneme: "phoneme",
  lexicon: "lexicon",
  lexeme: "lexeme",
  grapheme: "grapheme",
  alias: "alias",
  prosody: "prosody",
  sayAs: "say-as",
  audio: "audio",
  sub: "sub",
  break: "break",
};

export const MSTTS_PREFIXED_TAGS = {
  expressAs: "mstts:express-as",
  silence: "mstts:silence",
  backgroundAudio: "mstts:backgroundaudio",
};
