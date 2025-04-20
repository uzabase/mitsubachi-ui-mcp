import { loadDefaultManifest } from "../src/manifest.js";
import {expect, describe, test } from  "vitest";

describe("Cosutom Element Manifest", async () => {
  test("sp-text-field-unitの定義がある", async () => {

    const sut = loadDefaultManifest();

    const elements = sut.customElements;

    expect(elements).toBeDefined();
  });


});


