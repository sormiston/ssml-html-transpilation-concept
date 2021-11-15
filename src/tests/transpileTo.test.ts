import { transpileToSSML } from "../transpileToSSML";
import { transpileToHTML } from "../transpileToHTML";
import { mountEditableSSML } from "../domMutations";

// BELOW IS EXPECTED TO BE A VALID SSML STRING THAT RETURNS MEANINGFUL AUDIO FROM MICROSOFT TEXT TO SPEECH ENGINE ON AZURE.
// IF TESTS PASS, BUT UNEXPECTED RESULTS ARE COMING BACK FROM AZURE, CONSIDER REVISING THE VALIDITY OF THESE TEST STRINGS

const OPEN_SPEAK_TAG = `<speak xmlns="http://www.w3.org/2001/10/synthesis" version="1.0" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;

// xmlns:emo="http://www.w3.org/2009/10/emotionml"  

const ssml = `<voice name="en-US-AriaNeural"><mstts:express-as xml:mstts="http://www.w3.org/2001/mstts" style="Cheerful">"That’s remarkable! You’re a genius!"</mstts:express-as>Mom said to her son.</voice><voice name="en-US-JennyNeural">Customize output by <prosody rate="-40.00%"> slowing-down the speed rate.</prosody></voice><voice name="en-US-GuyNeural"><prosody volume="+40.00%">Add a break <break time="600ms"/> between words.</prosody></voice><voice name="en-GB-SoniaNeural">You can pronounce it <say-as interpret-as="spell">ASAP </say-as>or <sub alias="as soon as possible">ASAP</sub>.</voice>`;

const CLOSING_SPEAK_TAG = "</speak>";

describe("sanity", () => {
  test("is a quality of sane people", () => {
    let sane: boolean;
    sane = true;
    expect(sane).toBeTruthy();
  });
  test("is a quality of sane DOM objects", () => {
    const div = document.createElement("div");
    div.innerText = "sanity";
    expect(div.innerText).toBe("sanity");
  });
});

const parser = new DOMParser();
const serializer = new XMLSerializer();

let ssmlDoc: XMLDocument;
let HTML: DocumentFragment;
let HTMLSubtreeRoot: HTMLDivElement;

let derivedSSMLDoc: XMLDocument;
let reserialized: string;

beforeEach(() => {
  ssmlDoc = parser.parseFromString(
    OPEN_SPEAK_TAG + ssml + CLOSING_SPEAK_TAG,
    "text/xml"
  );
  HTML = transpileToHTML(ssmlDoc);
  HTMLSubtreeRoot = mountEditableSSML(HTML);
  derivedSSMLDoc = transpileToSSML(HTMLSubtreeRoot);
  reserialized = serializer.serializeToString(derivedSSMLDoc);
});

describe("the full transpilation cycle", () => {
  test("transpiler functions transform a valid SSML string to HTML and back again with perfect parity", () => {
    const fullSSMLString = OPEN_SPEAK_TAG + ssml + CLOSING_SPEAK_TAG;
    expect(reserialized).toEqual(fullSSMLString);
  });

  test("reserialized SSML is not polluted by HTML5 xmlns attributes", () => {
    expect(reserialized).toEqual(expect.not.stringContaining(
      `xmlns="http://www.w3.org/1999/xhtml"`
    ));
  })
});
