export function transpileToSSML(src: Element) {
  let done = false;
  while (!done) {
    done = editPass(src);
  }
  
  const doc = document.implementation.createDocument("http://www.w3.org/2001/10/synthesis", "speak", null)
  let rootSpeak = doc.firstElementChild!;
   rootSpeak.setAttribute("version", "1.0");
   rootSpeak.setAttribute("xmlns", "http://www.w3.org/2001/10/synthesis");
   rootSpeak.setAttribute("xmlns:mstts", "http://www.w3.org/2001/mstts");
   rootSpeak.setAttribute("xmlns:emo", "http://www.w3.org/2009/10/emotionml");
  rootSpeak.setAttribute("xml:lang", "en-US");
  console.log(...src.childNodes)
   rootSpeak.append(...src.childNodes);
  return doc
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
        })
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

function editPass(root: Element) {
  const elementIterator = createElementIterator(root);
  const src = elementIterator.nextNode() as Element;
  if (src === null) {
    return true;
  }

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

  const newElt = document.createElementNS("http://www.w3.org/2001/10/synthesis", newTag!);

  attributeTransfer(src, newElt);

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

  // switch (ssmlTag) {
  //   case "voice":
  //     filtered = [...attributes].filter(voiceAttrFilterCb);
  //     break;
  // }

  if (!filtered) {
    throw new Error(`no attributes found while populating <${ssmlTag}>`);
  }
  filtered.forEach((attr) => {
    target.setAttribute(attr.name.substring(5), attr.value);
  });
}

// ATTR FILTER CALLBACKS
// function voiceAttrFilterCb(attr: Attr) {
//   return ["name"].includes(attr.name);
// }

// ATTR LIST CONSTANTS
// const SSML_ATTRS = {
//   VOICE: [
//       "name"
//   ],
//   EXPRESS_AS: [
//     "style",

//   ]

// }

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
  break: "break"
};

export const MSTTS_PREFIXED_TAGS = {
  expressAs: "mstts:express-as",
  silence: "mstts:silence",
  backgroundAudio: "mstts:backgroundaudio",
};
