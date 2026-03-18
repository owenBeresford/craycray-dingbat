import { assert, describe, it, expect } from "vitest";

import { mapURL } from '../services/URLs';

describe("I can run URLs", () => {
  it("I can create it", () => {
    assert(mapURL, "this is an object");
    assert.isTrue(typeof mapURL === "function", `this is an object of correct type ${typeof mapURL}`);
  });

  it("I can map with it", () => {
    const ID = 1;
    const OTHER_ID = "1";
    const HACK_ID = "1.0";
    const FAKE_ID = "FANTASTIC";

    // nom:string, id:number|null
    assert.isTrue(mapURL("allList", ID) === "/list-all", "[1] this is valid");
    assert.isTrue(mapURL("allList", OTHER_ID) === "/list-all", "[2] this is NOT valid");
    assert.isTrue(mapURL("allList", null) === "/list-all", "[3] this is valid");

    assert.isTrue(mapURL("aList", ID) === "/list/1", "[4] this is valid");
    assert.isTrue(mapURL("aList", OTHER_ID) !== "/list/1", "[5] this is valid due to type checking");
    assert.isTrue(mapURL("aList", null) !== "/list/1", "[6] this is valid");

    assert.isTrue(mapURL(FAKE_ID, ID) === "", "[7] this is valid");
    assert.isTrue(mapURL(FAKE_ID, null) === "", "[8] this is valid");
  });
});
