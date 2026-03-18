import { assert, describe, it, expect, expectTypeOf } from "vitest";
import { vuex } from "vuex";
import { STORE, KEY, OnlyForTesting, useStore } from "../services/Store";

const { mapForHelp } = OnlyForTesting;

describe("I can open Store", () => {
  it("I can create it", () => { 
    assert.isOk(STORE, "this is an object");
    assert.isTrue(typeof STORE === "object", `this is an object of correct type ${typeof STORE}`);
    expectTypeOf(STORE).toExtend<Store<ShopState>>();
    //    Assert(STORE instanceof Store, 'this is an object of correct type ');
  });

  it("The mapForHelp() seems to work", () => {
    STORE.commit("setPath", "/list-all");
    assert.isTrue(mapForHelp(STORE) === "list-all", "API mapper test1 PASS");
    STORE.commit("setPath", "/");
    assert.isTrue(mapForHelp(STORE) === "list-all", "API mapper test2 PASS");
    STORE.commit("setPath", "/list");
    assert.isTrue(mapForHelp(STORE) === "list-id", "API mapper test3 PASS " + mapForHelp(STORE)());
    STORE.commit("setPath", "/menu");
    assert.isTrue(mapForHelp(STORE) === "menu", "API mapper test4 PASS");
    STORE.commit("setPath", "/sdfsdfsdf");
    assert.isTrue(mapForHelp(STORE) === undefined, "API mapper test5 PASS " + mapForHelp(STORE)());
  });
});

