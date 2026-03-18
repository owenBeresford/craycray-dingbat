// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { DataFactory } from '../services/DataFactory';

describe("test on DataFactory ", () => {
	it("Can use DataFactory", () => {
 		let txt=await DataFactory();
 		expect(typeof txt ).toBe("object");
 		assertType<Function>(DataFactory);
 		expectTypeOf(txt).toExtend<ListCollection>(	);
	});

	it("Can use DataFactory", () => {
 		let txt=await DataFactory();
 		expect(typeof txt ).toBe("object");

		// async function DataFactory(): Promise<ListCollection>
 		console.log("IOIO XXX Networking objects, run dataFactory again, and show its different.");
 	});

});