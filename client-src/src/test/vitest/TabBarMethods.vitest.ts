import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";
import { ref } from "vue";
import type { MethodOptions } from "vue";
// https://github.com/meant4/vitestvuerouter/
//

import { useRoute, createRouter } from "vue-router";
import type { RouteLocationNormalizedLoadedGeneric, RouterHistory } from "vue-router";
import type { HistoryState, RouteLocationAsPathGeneric, LocationQueryRaw } from "vue-router";

// https://medium.com/@vasanthancomrads/unit-testing-vue-3-components-with-vitest-and-testing-library-part-3-985d9c3585c8
// https://patrickstuart.com/2025/09/16/unit-testing-vue-components-with-vitest-tips-and-tricks

import type { CBTYPE, Motionable } from "../../types/Motionable";
import type { COMPLETE_STORE } from "../../services/Store";
import type { ExternalMethods, CBType, TabBarCtx } from "../../types/Actionables";

import { BaseActions } from "../../services/BaseActions";
import { createDataFactory } from "../../services/DataFactory";
import { useCacheWrapper } from "../../workers/InstallWorker";
import { useStore } from "../../services/Store";
import { fixture1, fixture2, fixture3, fixture4 } from "../../../../common/fixture-lists";
import { TEST_LOCATION_URL } from "../../Constants";
import { TestLocation } from "../MockLocation";
import { useTabActions, TabActions, noop } from "../../services/TabActions";

// https://stackoverflow.com/questions/74209044/vue-router-mock-with-vue-test-utils-vitest
vi.hoisted(() => {
  vi.resetModules();
});
const PASSBACK = (a: number): void => {};
//https://github.com/vitest-dev/vitest/issues/1918

function createMockRoute1(
  overrides: Partial<RouteLocationNormalizedLoadedGeneric> = {}
): RouteLocationNormalizedLoadedGeneric {
  return {
    path: "/list-all",
    fullPath: "/list-all",
    name: "list-everything",
    params: {},
    query: {},
    hash: "",
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides,
  };
}

function createMockRoute2(
  overrides: Partial<RouteLocationNormalizedLoadedGeneric> = {}
): RouteLocationNormalizedLoadedGeneric {
  return {
    path: "/list/:index",
    fullPath: "/list/:index",
    name: "a-list",
    params: { index: "1" },
    query: {},
    hash: "",
    matched: [],
    meta: {},
    redirectedFrom: undefined,
    ...overrides,
  };
}

// const useRouteMock =
vi.mock(import("vue-router"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRoute: () => createMockRoute1,
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
    createRouter: () => ({
      push: vi.fn(),
    }),
    //  createRouter: vi.fn(),  createRoutes: vi.fn(),
  };
});
const StaticRoutes = createRouter({
  routes: [
    {
      path: "/list-all",
      name: "list-everything",
      component: { template: "TEST COMPONENT (no interactions)" },
    },
  ],
  history: {} as RouterHistory,
});

// thi stes is to show that te module packs correctly.
// The actions and side effects ought to be tested in a more complete stack fashion, so if anything needs HTTPS etc, this is tested

describe("test on TabActions", () => {
  const DATA = createDataFactory(fixture1(), new TestLocation(TEST_LOCATION_URL), PASSBACK);

  it("Can use useFunction", async () => {
    let txt: TabActions = (await useTabActions(
      useStore(),
      DATA,
      useCacheWrapper(),
      useRoute(),
      StaticRoutes
    )) as TabActions;
    expect(typeof txt).toBe("object");
    assertType<TabActions>(txt);
    expectTypeOf(txt).toExtend<BaseActions<TabBarCtx>>();
  });

  it("Can use mount (reviw on return type, as its soft/a runtime thing, not a class)", async () => {
    //    StaticRoutes.currentRoute.value.path= '/list/:index';
    //    StaticRoutes.currentRoute.value.fullPath= '/list/:index';
    //    StaticRoutes.currentRoute.value.name= "a-list";
    //    StaticRoutes.currentRoute.value.params= {index:"1" };

    let txt = await useTabActions(useStore(), DATA, useCacheWrapper(), useRoute(), StaticRoutes);
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

    let obj = txt.mount({ visibleRef, getInputRef, CBRef, storeRef, menuStateRef } satisfies TabBarCtx, txt);
    expect(typeof obj).toBe("object");

    assertType<MethodOptions>(obj);
    //    expectTypeOf(obj).toExtend<BaseActions>();
    expect(Object.keys(obj)).toStrictEqual(funcList);

    for (let i in funcList) {
      expect(typeof obj[funcList[i]]).toBe("function");
      expect(obj[funcList[i]].name.startsWith("bound ")).toBe(true);
    }
  });

  it("Can use mount 2", async () => {
    /*
    StaticRoutes.currentRoute.value.path= '/list/:index';
    StaticRoutes.currentRoute.value.fullPath= '/list/:index';
    StaticRoutes.currentRoute.value.name= "a-list";
    StaticRoutes.currentRoute.value.params= {index:"2" };
    */
    let txt = await useTabActions(useStore(), DATA, useCacheWrapper(), useRoute(), StaticRoutes);
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

    let obj = txt.mount({ visibleRef, getInputRef, CBRef, storeRef, menuStateRef } satisfies TabBarCtx, txt);
    expect(typeof obj).toBe("object");

    assertType<MethodOptions>(obj);
    //    expectTypeOf(obj).toExtend<BaseActions>();
    expect(Object.keys(obj)).toStrictEqual(funcList);

    for (let i in funcList) {
      expect(typeof obj[funcList[i]]).toBe("function");
      expect(obj[funcList[i]].name.startsWith("bound ")).toBe(true);
    }
  });
});

// vim: nospell syn=typescript
