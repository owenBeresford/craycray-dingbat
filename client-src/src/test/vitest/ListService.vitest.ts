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

  it("I can create items", async ({ skip }): Promise<void> => {
    const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }
    const ls: ListCollection<string> = FACT.currentData;

    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.count()).toBe(6);

    const FACT2: FactoryArtefact = await createDataFactory(fixture3(), TEST, PASSBACK);
    if (!FACT2.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }
    const ls2: ListCollection<string> = FACT2.currentData;

    expect(ls2.create("item3")).toBe(3);
    expect(ls2.create("item4")).toBe(4);
    expect(ls2.count()).toBe(4);
  });
  // i'm skipping  count(): number;

  it("I can poll", async ({ skip }): Promise<void> => {
    const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }
    const ls: ListCollection<string> = FACT.currentData;
    expect(await ls.poll()).toBe(true);
    // TODO something to enumerate other states
  });

  it("I can delete", async ({ skip }): Promise<void> => {
    const FACT: FactoryArtefact = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }
    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.create("item3")).toBe(7);

    expect(ls.delete(1)).toBe(true);
    expect(ls.count()).toBe(6);

    expect(ls.delete(2)).toBe(true);
    expect(ls.count()).toBe(5);
  });

  it("I can get", async ({ skip }): Promise<void> => {
    const FACT = await createDataFactory(fixture2(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.create("item3")).toBe(7);

    let tmp: InstanceListable<string> | undefined = ls.get(2);
    expect(tmp instanceof StdList).toBe(true);
    tmp = ls.get(3);
    expect(tmp instanceof StdList).toBe(true);

    tmp = ls.get(144);
    expect(typeof tmp === "undefined").toBe(true);
  });

  it("I can put", async ({ skip }): Promise<void> => {
    const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);

    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
    // can overwrite
    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
    // can NOT set with gaps
    expect(ls.put(1024, StdList.manual<string, StdList>("item2", 1024))).toBe(false);

    expect(ls.put(-1, StdList.manual<string, StdList>("item2", -1))).toBe(false);
  });

  it("I can list", async ({ skip }): Promise<void> => {
    const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.list()).not.toBe(false);
  });

  it("I can store ", async ({ skip }): Promise<void> => {
    const FACT = await createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      // unneeded if statemnent purely for TS validation
      skip(!FACT.currentData);
      return;
    }
    const ls: ListCollection<string> = FACT.currentData;

    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.create("item3")).toBe(7);

    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
    // can overwrite
    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);

    expect(ls.put(1024, StdList.manual<string, StdList>("item2", 1024))).toBe(false);
  });

  //  loadAllLists(): boolean ;
  // saveAllLists ...
});
