import { assert, describe, it, expect, expectTypeOf } from "vitest";
import type { Store } from "vuex";
import { STORE, OnlyForTesting, useStore } from "../../services/Store";
import type { COMPLETE_STORE } from "../../services/Store";
import type { ShopState } from "../../types/ShopState";

const { mapForHelp } = OnlyForTesting;

describe("I can open Store", () => {
  it("I can create it", () => {
    assert.isOk(STORE, "this is an object");
    assert.isTrue(typeof STORE === "object", `this is an object of correct type ${typeof STORE}`);
    expectTypeOf(STORE).toExtend<COMPLETE_STORE>();
    //    Assert(STORE instanceof Store, 'this is an object of correct type ');
  });

  it("The mapForHelp() seems to work", () => {
    STORE.commit("setPath", "/list-all");
    assert.isTrue(mapForHelp(STORE, "/list-all") === "list-all", "API mapper test1 PASS");
    STORE.commit("setPath", "/");
    assert.isTrue(mapForHelp(STORE, "/") === "list-all", "API mapper test2 PASS");
    STORE.commit("setPath", "/list");
    assert.isTrue(mapForHelp(STORE, "/list") === "list-id", "API mapper test3 PASS " + mapForHelp(STORE, "/list"));
    STORE.commit("setPath", "/menu");
    assert.isTrue(mapForHelp(STORE, "/menu") === "menu", "API mapper test4 PASS");
    STORE.commit("setPath", "/sdfsdfsdf");
    assert.isTrue(
      mapForHelp(STORE, "/sdfsdfsdf") === undefined,
      "API mapper test5 PASS " + mapForHelp(STORE, "/sdfsdfsdf")
    );
  });
});
