import { assert, describe, it, expect, expectTypeOf, assertType } from "vitest";
import { LocalStorage } from "node-localstorage";

import { APP_NAME } from "../Constants";
import { ListService } from "../services/ListService";
import {  AList } from "../services/AList";
import { DataFactory } from "../services/DataFactory";
import type { ListStruct, Listable, ListCollection } from '../types/ListCollection';
import type { PromiseSucceed, PromiseReject } from "../types/promises";

global.localStorage = new LocalStorage("./build/scratch");

describe("I can use ListService", () => {
  // this ought to be run multiple times in different network settings
  // or maybe leave that to DataFactory test
  it("I can create it", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      expect(typeof ListService).toBe("function");
      let tt: ListCollection = await DataFactory();
      expect(typeof tt).toBe("function");
      assertType<ListCollection>(tt);
      good(true);
    });
  });

  it("I can create items", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.count()).toBe(2);

      const ls2: ListCollection = await DataFactory();
      expect(ls2.create("item3")).toBe(3);
      expect(ls2.create("item4")).toBe(4);
      expect(ls2.count()).toBe(4);
      good(true);
    });
  });

  // i'm skipping  count(): number;

  it("I can poll", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.poll()).toBe(true);
      // something to enumerate other states
      good(true);
    });
  });

  it("I can delete", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      console.log("WERWER ", JSON.stringify(ls.catalog.keys()));
      expect(ls.delete(1)).toBe(true);
      console.log("WERWER2", JSON.stringify(ls.catalog.keys()));
      expect(ls.count()).toBe(3);

      console.log("WERWER ", JSON.stringify(ls.catalog.keys()));
      expect(ls.delete(2)).toBe(true);
      console.log("WERWER2", JSON.stringify(ls.catalog.keys()));
      expect(ls.count()).toBe(3);

      good(true);
    });
  });

  it("I can get", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      let tmp: AList | undefined = ls.get(2);
      expect(tmp instanceof AList).toBe(true);
      tmp = ls.get(2);
      expect(tmp instanceof AList).toBe(true);

      tmp = ls.get(144);
      expect(typeof tmp === "undefined").toBe(true);
      good(true);
    });
  });

  it("I can put", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);

      expect(ls.put(2, AList.manual("item2", 2))).toBe(true);
      // can overwrite
      expect(ls.put(2, AList.manual("item2", 2))).toBe(true);

      expect(ls.put(1024, AList.manual("item2", 1024))).toBe(true);
      good(true);
    });
  });

  it("I can list", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      expect(ls.list()).toBe(true);

      good(true);
    });
  });

  it("I can store ", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      expect(ls.put(2, AList.manual("item2", 2))).toBe(true);
      // can overwrite
      expect(ls.put(2, AList.manual("item2", 2))).toBe(true);

      expect(ls.put(1024, AList.manual("item2", 1024))).toBe(true);
      good(true);
    });
  });

  it("I can saveAllLists", (): Promise<boolean> => {
    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ls: ListCollection = await DataFactory();
      expect(ls.create("item1")).toBe(1);
      expect(ls.create("item2")).toBe(2);
      expect(ls.create("item3")).toBe(3);

      expect(global.localStorage.length).toBe(0);
      expect(ls.saveAllLists()).toBe(true);
      expect(global.localStorage.length).not.toBe(0);
      console.dir(global.localStorage.key);

      good(true);
    });
  });

  //  loadAllLists(): boolean ;
});
