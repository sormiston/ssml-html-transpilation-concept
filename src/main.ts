import { transpileToHTML } from "./transpileToHTML.js";
import { transpileToSSML } from "./transpileToSSML.js";
import { mountEditableSSML } from "./domMutations.js";

const OPEN_SPEAK_TAG = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">`;
// xmlns: emo = "http://www.w3.org/2009/10/emotionml";
const CLOSING_SPEAK_TAG = "</speak>";


// xmlns: emo = "http://www.w3.org/2009/10/emotionml";
// REPRESENTS DATA FROM BACKEND, TEXT WITH SOME SSML DONE

const ssml = `<voice name="en-US-AriaNeural"><mstts:express-as style="Cheerful">"That’s remarkable! You’re a genius!"</mstts:express-as>Mom said to her son.</voice><voice name="en-US-JennyNeural">Customize output by <prosody rate="-40.00%"> slowing-down the speed rate.</prosody></voice><voice name="en-US-GuyNeural" ><prosody volume="+40.00%">Add a break <break time="600ms" /> between words.</prosody></voice><voice name="en-GB-SoniaNeural">You can pronounce it <say-as interpret-as="spell">ASAP </say-as>or <sub alias="as soon as possible">ASAP</sub>.</voice>`;

// const ssml = `<voice name="en-US-JennyNeural"><prosody rate="14%" pitch="10%">You can replace this text with any text you wish. You can either write in this text box or paste your own text here.
// Try different languages and voices. Change the speed and the pitch of the voice. You can even tweak the SSML (Speech Synthesis Markup Language) to control how the different sections of the text sound. Click on SSML above to give it a try!
// Enjoy using Text to Speech!</prosody></voice>`;

// PARSING + TRANSPILATION (SSML >> HTML)
const parser = new DOMParser();
let ssmlDoc: XMLDocument = parser.parseFromString(
  OPEN_SPEAK_TAG + ssml + CLOSING_SPEAK_TAG,
  "text/xml"
);

// let ssmlDocProof: XMLDocument = parser.parseFromString(
//   OPEN_SPEAK_TAG + ssml + CLOSING_SPEAK_TAG,
//   "text/xml"
// );

const fragment = transpileToHTML(ssmlDoc);

mountEditableSSML(fragment, "#toHTML");
const serializer = new XMLSerializer();

// DEMO STUFF -- EVENT LISTENING?
function applyClickListener() {
  const div = document.querySelector("#toHTML");
  div?.addEventListener("click", (e) => console.log(e.target));
}
applyClickListener();

const button = document.querySelector("#print-ssml");
button?.addEventListener("click", () => {
  const speakTree = document.getElementById("toHTML");
  let derivedSSMLDoc;
  if (speakTree instanceof HTMLElement) {
    console.log(speakTree)
    console.log(speakTree.cloneNode(true))
    derivedSSMLDoc = transpileToSSML(speakTree.cloneNode(true) as HTMLElement);
  } else {
    throw new Error("something went wrong");
  }
  
  console.log("copy");
  console.dir(derivedSSMLDoc);
  // let ssmlString = OPEN_SPEAK_TAG
  // for (let i = 0; i < derivedSSMLDoc.length; i++) {
  //    let str = serializer.serializeToString(derivedSSMLDoc[i]);
  //    ssmlString = ssmlString + str;
  // }
  // ssmlString = ssmlString + CLOSING_SPEAK_TAG

  console.log(serializer.serializeToString(derivedSSMLDoc.documentElement));
});
