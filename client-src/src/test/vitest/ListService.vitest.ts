import { assert, describe, it, expect, expectTypeOf, assertType } from "vitest";
import { LocalStorage } from "node-localstorage";

import { ListService } from "../../services/ListService";
import { StdList } from "../../services/AList";
import { createDataFactory } from "../../services/DataFactory";
import { TEST_LOCATION_URL } from "../../Constants";
import { TestLocation } from "../MockLocation";

import type { FactoryArtefact } from "../../services/DataFactory";
import type { ListStruct, InstanceListable, ListCollection } from "../../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";
import { fixture1, fixture2, fixture3, fixture4 } from "../../../../common/fixture-lists";

globalThis.localStorage = new LocalStorage("./public/scratch");
const PASSBACK = (a: number): void => {};

const TEST: TestLocation = new TestLocation(TEST_LOCATION_URL);
// the createDataFactory with args is tested via storybook tests, which is why it exists.
describe("I can use ListService", () => {
  // this ought to be run multiple times in different network settings
  // or maybe leave that to DataFactory test
  it("I can create it", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      expect(typeof ListService).toBe("function");
      let tt: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
      expect(typeof tt).toBe("object");
      if (!tt.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      assertType<FactoryArtefact>(tt);
      assertType<ListCollection<string>>(tt.currentData);

      good(true);
    });
  });

  it("I can create items", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      const ls: ListCollection<string> = FACT.currentData;

      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.count()).toBe(2);

      const FACT2: FactoryArtefact = await createDataFactory(fixture3(), TEST, PASSBACK);
      if (!FACT2.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      const ls2: ListCollection<string> = FACT2.currentData;

      expect(ls2.create("item3")).toBe(3);
      expect(ls2.create("item4")).toBe(4);
      expect(ls2.count()).toBe(4);
      good(true);
    });
  });

  // i'm skipping  count(): number;

  it("I can poll", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      const ls: ListCollection<string> = FACT.currentData;
      expect( await ls.poll()).toBe(true);
      // something to enumerate other states
      good(true);
    });
  });

  it("I can delete", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      const ls: ListCollection<string> = FACT.currentData;
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      //  console.log("WERWER ", JSON.stringify(ls.list().keys()));
      expect(ls.delete(1)).toBe(true);
      //  console.log("WERWER2", JSON.stringify(ls.list().keys()));
      expect(ls.count()).toBe(3);

      //  console.log("WERWER ", JSON.stringify(ls.list().keys()));
      expect(ls.delete(2)).toBe(true);
      //  console.log("WERWER2", JSON.stringify(ls.list().keys()));
      expect(ls.count()).toBe(3);

      good(true);
    });
  });

  it("I can get", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT = await createDataFactory(fixture2(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }

      const ls: ListCollection<string> = FACT.currentData;
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      let tmp: InstanceListable<string> | undefined = ls.get(2);
      expect(tmp instanceof StdList).toBe(true);
      tmp = ls.get(3);
      expect(tmp instanceof StdList).toBe(true);

      tmp = ls.get(144);
      expect(typeof tmp === "undefined").toBe(true);
      good(true);
    });
  });

  it("I can put", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }

      const ls: ListCollection<string> = FACT.currentData;
      expect(ls.create("item1")).toBe(1);

      expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
      // can overwrite
      expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);

      expect(ls.put(1024, StdList.manual<string, StdList>("item2", 1024))).toBe(true);
      good(true);
    });
  });

  it("I can list", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }

      const ls: ListCollection<string> = FACT.currentData;
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      expect(ls.list()).toBe(true);

      good(true);
    });
  });

  it("I can store ", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
      if (!FACT.currentData) {
        bad(new Error("#toFix Fixture returned null?"));
        return;
      }
      const ls: ListCollection<string> = FACT.currentData;

      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
      // can overwrite
      expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);

      expect(ls.put(1024, StdList.manual<string, StdList>("item2", 1024))).toBe(true);
      good(true);
    });
  });

  //  loadAllLists(): boolean ;
});
