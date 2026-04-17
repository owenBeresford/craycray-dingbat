import { assert, describe, it, expect } from "vitest";
import { LocalStorage } from "node-localstorage";

import { APP_NAME } from "../../Constants";
import { LocalCopy } from "../../services/LocalCopy";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";

globalThis.localStorage = new LocalStorage("./public/scratch");

describe("I can use LocalCopy", () => {
  it("I can create it", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      expect(typeof LocalCopy).toBe("function");
      good(true);
    });
  });
  const ORIG = [
    { name: "WWWW1", created: 12345678, edited: 23456789, count: 4, id: 1, list: ["aa", "bb", "cc", "dd"] },
    { name: "WWWW2", created: 12345678, edited: 23456789, count: 4, id: 2, list: ["aa", "bb", "cc", "dd", "ee"] },
  ];

  it("I can load from localStorage", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let tt = new LocalCopy();
      localStorage.setItem(APP_NAME, JSON.stringify(ORIG));
      const START = new Date();

      tt.loadState()
        .then((dat) => {
          const STOP = new Date();
          expect(dat).toStrictEqual(ORIG);
          expect(STOP.getTime()).toBeLessThan(START.getTime() + 250);
          good(true);
        })
        .catch((e) => {
          console.error("unit test crashed ", e);
          bad(e);
        });
    });
  });

  it("I can save to localStorage", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let tt = new LocalCopy();
      localStorage.removeItem(APP_NAME);
      const START = new Date();

      tt.saveState(ORIG)
        .then((dat) => {
          const STOP = new Date();

          let ret = localStorage.getItem(APP_NAME) || "[]";
          ret = JSON.parse(ret);
          expect(ret).toStrictEqual(ORIG);
          expect(STOP.getTime()).toBeLessThan(START.getTime() + 250);
          expect(dat).toBe(true);
          good(true);
        })
        .catch((e) => {
          console.error("unit test crashed ", e);
          bad(e);
        });
    });
  });
});
