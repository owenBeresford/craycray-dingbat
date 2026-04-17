import { assert, describe, it, expect, expectTypeOf, assertType } from "vitest";
// import { LocalStorage } from "node-localstorage";

import { ListService } from "../../services/ListService";
import { AList } from "../../services/AList";
import { createDataFactory } from "../../services/DataFactory";
import type { FactoryArtefact } from "../../services/DataFactory";
import type { ListStruct, Listable, ListCollection } from "../../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../types/promises";

describe("I can use NetworkedListService", () => {
  // this ought to be run multiple times in different network settings
  // or maybe leave that to DataFactory test
  it("I can create it", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      expect(typeof ListService).toBe("function");
      let tt: FactoryArtefact = await createDataFactory(undefined);
      expect(typeof tt).toBe("object");
      assertType<FactoryArtefact>(tt);
      if (!tt.currentData) return;
      assertType<ListCollection>(tt.currentData);

      good(true);
    });
  });

  it("I can saveAllLists", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: FactoryArtefact = await createDataFactory(undefined);
      if (!ls.currentData) {
        return;
      }

      expect(ls.currentData.create("item1")).toBe(1);
      expect(ls.currentData.create("item2")).toBe(2);
      expect(ls.currentData.create("item3")).toBe(3);

      expect(globalThis.localStorage.length).toBe(0);
      expect(ls.currentData.saveAllLists()).toBe(true);
      expect(globalThis.localStorage.length).not.toBe(0);

      good(true);
    });
  });

  it("I can loadAllLists", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: FactoryArtefact = await createDataFactory(undefined);
      if (!ls.currentData) {
        return;
      }

      expect(ls.currentData.create("item1")).toBe(1);
      expect(ls.currentData.create("item2")).toBe(2);
      expect(ls.currentData.create("item3")).toBe(3);

      expect(globalThis.localStorage.length).toBe(0);
      expect(ls.currentData.loadAllLists()).toBe(true);
      expect(ls.currentData.count()).toBe(1);
      // IOIO

      good(true);
    });
  });

  it("I can poll", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: FactoryArtefact = await createDataFactory(undefined);
      if (!ls.currentData) {
        return;
      }

      expect(ls.currentData.create("item1")).toBe(1);
      expect(ls.currentData.create("item2")).toBe(2);
      expect(ls.currentData.create("item3")).toBe(3);

      expect(globalThis.localStorage.length).toBe(0);
      expect(ls.currentData.poll()).toBe(true);
      expect(ls.currentData.count()).toBe(1);
      // IOIO

      good(true);
    });
  });
});
