// import 'reflect-metadata';
import { defineWebWorkers } from "@vitest/web-worker/pure";
import {
  assert,
  describe,
  expect,
  vi,
  it,
  expectTypeOf,
  assertType,
} from "vitest";
import { ShippingStruct, ActionEnum } from "../../types/Messagable";
import { transform2list, packMsg } from "../../services/Storable";

import * as StateSync from "../../workers/StateSyncing";

defineWebWorkers({ clone: "none" });

describe("test on StateSync ", () => {
  /*	
	it("Can use StateSync", () => {
 		console.log("this should be a statesync", StateSync);
 		console.dir(StateSync);

 		let txt= StateSync();
 		expect(typeof txt ).toBe("object");
 	//	assertType<Function>(DataFactory);
 	//	expectTypeOf(txt).toExtend<ListCollection>(	);
	});
*/
  it("Can run StateSync", async () => {
    const w = await new Worker(
      new URL("../workers/StateSyncing", import.meta.url),
      { type: "module" }
    );
    console.log("TEST made thread " + process.pid);
    await new Promise(async (good, bad) => {
      let NEXT_ACTION = "running";

      // w.onmessage = function(ev:MessageEvent):void {
      w.onmessage = function (ev) {
        console.log("TEST recv message");
        expect(ev.action).toBe(NEXT_ACTION);
        NEXT_ACTION = "err"; // IOIO XXX expand test to check other states
        good(1);
      };
      //			w.postMessage(packMsg("status-request" as ActionEnum, {} as ShippingStruct ));
      w.postMessage(packMsg("status-request", {}), undefined);
      console.log("TEST send message");

      // yada other states
      w.terminate();
      console.log("TEST complete");
    });
  }, 10_000);
});
