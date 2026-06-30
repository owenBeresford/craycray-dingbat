import { assert, describe, it, expect, expectTypeOf, assertType } from "vitest";
import { LocalStorage } from "node-localstorage";

import { ListService } from "../../services/ListService";
import { StdList } from "../../services/AList";
import { createDataFactory } from "../../services/DataFactory";
import { TEST_LOCATION_URL } from "../../Constants";
import type { FactoryArtefact } from "../../services/DataFactory";
import { TestLocation } from "../MockLocation";

import type { ListStruct, InstanceListable, ListCollection } from "../../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";
import { fixture1, fixture2, fixture3, fixture4 } from "../../../../common/fixture-lists";

globalThis.localStorage = new LocalStorage("./public/scratch");
const TEST: TestLocation = new TestLocation(TEST_LOCATION_URL);
const PASSBACK = (a: number): void => {};

// the createDataFactory with args is tested via storybook tests, which is why it exists.
describe("I can use ListService", () => {
  // this ought to be run multiple times in different network settings
  // or maybe leave that to DataFactory test
  it("I can create it", (): void => {
    expect(typeof ListService).toBe("function");
    let tt: FactoryArtefact = createDataFactory(fixture1(), TEST, PASSBACK);
    expect(typeof tt).toBe("object");
    if (!tt.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }
    assertType<FactoryArtefact>(tt);
    assertType<ListCollection<string>>(tt.currentData);
  });

  // IOIO XX  add extra tests for the newer code

  it("I can create items", (): void => {
    const FACT: FactoryArtefact = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.count()).toBe(6);

    const FACT2: FactoryArtefact = createDataFactory(fixture3(), TEST, PASSBACK);
    if (!FACT2.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }
    const ls2: ListCollection<string> = FACT2.currentData;

    expect(ls2.create("item3")).toBe(3);
    expect(ls2.create("item4")).toBe(4);
    expect(ls2.count()).toBe(4);
  });

  // i'm skipping  count(): number;

  it("I can poll", async (): Promise<boolean> => {
    const FACT: FactoryArtefact = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }
    const ls: ListCollection<string> = FACT.currentData;
    expect(await ls.poll()).toBe(true);
    // something to enumerate other states
    return true;
  });

  it("I can delete", (): void => {
    const FACT: FactoryArtefact = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
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

  it("I can get", (): void => {
    const FACT = createDataFactory(fixture2(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
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

  it("I can put", (): void => {
    const FACT = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);

    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
    // can overwrite
    expect(ls.put(2, StdList.manual<string, StdList>("item2", 2))).toBe(true);
    // cannot PUT in a sparse index fashion, may APPEND
    expect(ls.put(1024, StdList.manual<string, StdList>("item2", 1024))).toBe(false);
  });

  it("I can list", (): void => {
    const FACT = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }

    const ls: ListCollection<string> = FACT.currentData;
    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.create("item3")).toBe(7);

    expect(ls.list()).toBeTruthy();
  });

  it("I can append ", (): void => {
    const FACT = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }
    const ls: ListCollection<string> = FACT.currentData;

    expect(ls.create("item1")).toBe(5);
    expect(ls.create("item2")).toBe(6);
    expect(ls.create("item3")).toBe(7);

    expect(ls.append(StdList.manual<string, StdList>("item2", 2))).toBe(true);
    expect(ls.append(StdList.manual<string, StdList>("item2", 2))).toBe(true);
  });

  it("I can listNames ", (): void => {
    const FACT = createDataFactory(fixture1(), TEST, PASSBACK);
    if (!FACT.currentData) {
      throw new Error("#toFix Fixture returned null?");
    }
    const ls: ListCollection<string> = FACT.currentData;

    expect(ls.create("test list A")).toBe(5);
    expect(ls.create("test list B")).toBe(6);
    expect(ls.create("test list C")).toBe(7);

    expect(ls.listNames()).toStrictEqual([
      "New Empty list",
      "list 1",
      "list 2",
      "list 3",
      "test list A",
      "test list B",
      "test list C",
    ]);
  });

  //  loadAllLists(): boolean ;
});
