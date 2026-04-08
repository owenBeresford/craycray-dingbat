// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { createDataFactory } from "../../services/DataFactory";
import type { FactoryArtefact } from "../../services/DataFactory";

describe("test on DataFactory ", () => {
  it("Can use DataFactory", async () => {
    let txt = await createDataFactory(undefined);
    expect(typeof txt).toBe("object");
    assertType<Function>(createDataFactory);
    expectTypeOf(txt).toExtend<FactoryArtefact>();
  });

  it("Can use DataFactory", async () => {
    let txt = await createDataFactory(undefined);
    expect(typeof txt).toBe("object");

    // async function DataFactory(): Promise<ListCollection>
    console.log("IOIO XXX Networking objects, run dataFactory again, and show its different.");
  });
});

