// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { CacheWrapper, useCacheWrapper } from '../workers/useCacheWrapper';
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED } from "../Constants";

// WARN: this test is destructive !!

describe("test on InstallWorker ", () => {
	it("Can load InstallWorker", () => {
 		let txt:CacheWrapper=useCacheWrapper();
 		expect(typeof txt ).toBe("object");
 		assertType<Function>(CacheWrapper);
 		expectTypeOf(txt).toExtend<CacheWrapper>();
	});

	it("Can use InstallWorker", async () => {
 		let txt:CacheWrapper=useCacheWrapper();
 		 let c:Cache=await global.caches.open(APP_NAME + "_" + APP_VERSION);
 		 let l:Array<Request> =await c.keys();
 		 l.foreach(async (a, b) => { await c.delete(a.url); });

 		 txt.install();
 		 let list= c.keys();
 		 assert.isTrue( Array.isArray(list), "Found installed asset files");
 		 assert.isTrue( list.length === 5, "right number of asset files");

 		expect( txt.check()).toBe(true);
 	});

 });
