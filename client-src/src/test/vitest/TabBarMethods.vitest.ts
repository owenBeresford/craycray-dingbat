// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";
import type { MethodOptions } from "vue";
import { useRoute } from "vue-router";
// https://medium.com/@vasanthancomrads/unit-testing-vue-3-components-with-vitest-and-testing-library-part-3-985d9c3585c8
// https://patrickstuart.com/2025/09/16/unit-testing-vue-components-with-vitest-tips-and-tricks

import type { CBTYPE, Motionable } from "../../types/Motionable";
import { useTabActions, TabActions, noop } from "../../services/TabActions";
import { BaseActions } from "../../services/BaseActions";
import { ListData } from "../../services/DataFactory";
import { useCacheWrapper } from "../../workers/InstallWorker";
import { useStore } from "../../services/Store";
import type { COMPLETE_STORE } from "../../services/Store";
import type { ExternalMethods, CBType } from "../../types/Actionables";

describe("test on TabActions", () => {
  it("Can use useFunction", async () => {
    let txt: TabActions = (await useTabActions(useStore(), ListData, useCacheWrapper(), useRoute())) as TabActions;
    expect(typeof txt).toBe("object");
    assertType<TabActions>(txt);
    expectTypeOf(txt).toExtend<BaseActions>();
  });

  it("Can use mount (reviw on retuen type, as its soft/a runtime thing, not a class)", async () => {
    let txt = await useTabActions(useStore(), ListData, useCacheWrapper(), useRoute());
    expect(typeof txt).toBe("object");
    const visibleRef = ref<boolean>(false);
    const getInputRef = ref<string>("");
    const CBRef = ref<CBType>(noop);
    const storeRef = ref<COMPLETE_STORE>(useStore());
    const menuStateRef = ref<boolean>(false);
    const funcList = [
      "onInterstitial",
      "onInstall",
      "onUnique",
      "onDuplicate",
      "onSave",
      "onRevert",
      "onMenu",
      "onSearch",
      "onName",
    ];

    let obj = txt.mount({ visibleRef, getInputRef, CBRef, storeRef, menuStateRef }, txt);
    expect(typeof obj).toBe("object");

    assertType<MethodOptions>(obj);
    //    expectTypeOf(obj).toExtend<BaseActions>();
    expect(Object.keys(obj)).toBe(funcList);

    for (let i in funcList) {
      expect(typeof obj[funcList[i]]).toBe("function");
      console.log("WERWERWE ", obj[funcList[i]].name);
      expect(obj[funcList[i]].name.startsWith("bound ")).toBe(true);
    }

    expect(Object.keys(obj)).toBe(funcList);
  });
});

// vim: nospell syn=typescript
