import SSMLWorkDiv from "../SSMLWorkDiv.js";
import sampleStrings from "./sampleStrings"


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
beforeEach(() => {
  ssmlWorkDiv = new SSMLWorkDiv(body, sampleStrings.standard);
})
afterEach(() => {
  if (body.firstElementChild) {
    const prevInstance = body.firstElementChild;
    body.removeChild(prevInstance);
  }
});

describe("the full transpilation cycle", () => {
  test("transpiler functions transform a valid SSML string to HTML and back again with perfect parity", () => {
    
    const reserialized = ssmlWorkDiv.emitSSMLString();
    expect(reserialized).toEqual(
      SSMLWorkDiv.OPEN_SPEAK_TAG + sampleStrings.standard + SSMLWorkDiv.CLOSE_SPEAK_TAG
    );
  });

  test("reserialized SSML is not polluted by HTML5 xmlns attributes", () => {
    const reserialized = ssmlWorkDiv.emitSSMLString();
    expect(reserialized).toEqual(
      expect.not.stringContaining(`xmlns="http://www.w3.org/1999/xhtml"`)
    );
  });
});

describe("event listeners", () => {
  test("ON HOVER: display relevant inline tag information within scope of a text node", () => {
    
  })
})


