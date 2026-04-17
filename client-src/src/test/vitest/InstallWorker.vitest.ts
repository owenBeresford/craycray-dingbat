// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { CacheWrapper, useCacheWrapper } from "../../workers/InstallWorker";
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED } from "../../Constants";

// WARN: this test is destructive !!

describe("test on InstallWorker ", () => {
  it("Can load InstallWorker", () => {
    let txt = useCacheWrapper();
    expect(typeof txt).toBe("object");
    assertType<Function>(CacheWrapper);
    expectTypeOf(txt).toExtend<CacheWrapper>();
  });

  it("Can use InstallWorker", async () => {
    let txt = useCacheWrapper();
    let c = await globalThis.caches.open(APP_NAME + "_" + APP_VERSION);
    let l = await c.keys();
    l.forEach(async (a: Request, b: number) => {
      await c.delete(a.url);
    });

    txt.install();
    let list = await c.keys();
    assert.isTrue(Array.isArray(list), "Found installed asset files");
    assert.isTrue(list.length === 5, "right number of asset files");

    expect(txt.check()).toBe(true);
  });
});
