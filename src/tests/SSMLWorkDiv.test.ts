import SSMLWorkDiv from "../SSMLWorkDiv.js";

const ssml = `<voice name="en-US-AriaNeural"><mstts:express-as xml:mstts="http://www.w3.org/2001/mstts" style="Cheerful">"That’s remarkable! You’re a genius!"</mstts:express-as>Mom said to her son.</voice><voice name="en-US-JennyNeural">Customize output by <prosody rate="-40.00%"> slowing-down the speed rate.</prosody></voice><voice name="en-US-GuyNeural"><prosody volume="+40.00%">Add a break <break time="600ms"/> between words.</prosody></voice><voice name="en-GB-SoniaNeural">You can pronounce it <say-as interpret-as="spell">ASAP </say-as>or <sub alias="as soon as possible">ASAP</sub>.</voice>`;


describe("sanity", () => {
  test("is a quality of sane javascript", () => {
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

let ssmlWorkDiv: any;
const body = document.createElement("body");
afterEach(() => {
  if (body.firstElementChild) {
    const prevInstance = body.firstElementChild;
    body.removeChild(prevInstance);
  }
});

describe("the full transpilation cycle", () => {
  test("transpiler functions transform a valid SSML string to HTML and back again with perfect parity", () => {
    ssmlWorkDiv = new SSMLWorkDiv(body, ssml);
    const reserialized = ssmlWorkDiv.emitSSMLString();
    expect(reserialized).toEqual(
      SSMLWorkDiv.OPEN_SPEAK_TAG + ssml + SSMLWorkDiv.CLOSE_SPEAK_TAG
    );
  });

  test("reserialized SSML is not polluted by HTML5 xmlns attributes", () => {
    ssmlWorkDiv = new SSMLWorkDiv(body, ssml);
    const reserialized = ssmlWorkDiv.emitSSMLString();
    expect(reserialized).toEqual(
      expect.not.stringContaining(`xmlns="http://www.w3.org/1999/xhtml"`)
    );
  });
});


