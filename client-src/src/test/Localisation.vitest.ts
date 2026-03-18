// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import type { UItext } from '../types/Localisation';
import { UI_EN_GB, useUIText } from "../services/Localisation";

describe("test on Localisation", () => {
  it("Can use useFunction", () => {
    let txt = useUIText();
    expect(typeof txt).toBe("object");
    assertType<UItext>(txt);
    expectTypeOf(txt).toExtend<UItext>();
  });

  it("Can use UITextFactory.get", () => {
    let txt = useUIText();
    assertType<UItext>(txt);

    // this checks the class and default language
    // i will add at least 1 test case that checks for presense of letter U.
    assert.isTrue(txt.get("intro") === "Hello. My name is...", "XXX 1");
    assert.isTrue(txt.get("introWWWWW") === "FAIL introWWWWW", "XXX 2");
  });

  it("Can use UITextFactory.getTemplate", () => {
    let txt = useUIText();
    assertType<UItext>(txt);

    let tt = txt.getTemplate("firstUse");
    assert.isTrue(Array.isArray(tt) && tt.length > 1, "  XXX 3");
    assert.isTrue(typeof tt[0] === "string", " XXX 4");
    expect(txt.getTemplate("introWWWWW")).toEqual(["FAIL introWWWWW"]);
  });
});
