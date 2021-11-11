export function cleanUp(ssml: XMLDocument) {
  const root = ssml.firstElementChild;
  const breakTags = [...root!.querySelectorAll("break")];
  breakTags.forEach((bt) => {
    if (!bt.previousSibling?.textContent || !bt.nextSibling?.textContent) {
      bt.remove();
    }
  });
}

export const TAGS = {
  voice: "voice",
  expressAs: "mstts:express-as",
  lang: "lang",
  silence: "mstts:silence",
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
  backgroundAudio: "mstts:backgroundaudio",
};

export const SELF_CLOSING_TAGS = {
  break: "break",
  bookmark: "bookmark",
};

export const CANVAS_ANCHOR_ELT_STYLES = [
  
    "direction: ltr !important;",
    "z-index: auto !important;",
    "float: left !important;",
    "display: inline !important;",
    "width: 0px !important;",
    "height: 0px !important;",
    "top: 0px !important;",
    "left: 0px !important;",
    "position: relative !important;",
    "visibility: visible !important;",
    "overflow: visible !important;",
    "display: none;",
  
];

export const Computed = {
  wrapperEltStyles: (instance: any) => [
    `width: ${instance.container.clientWidth}px !important;`,
    `height: ${instance.container.clientHeight}px !important;`,
    "position: absolute !important;",
    "top: 0px !important;",
    "left: 0px !important;",
    "pointer-events: none !important;",
  ],
};