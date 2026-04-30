// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { createDataFactory } from "../../services/DataFactory";
import { simple_fixture1, simple_fixture2 } from "../../../../common/fixture-lists";
import { ListService } from "../../services/ListService";
import { AList } from "../../services/AList";
import type { FactoryArtefact } from "../../services/DataFactory";
import type { ListCollection } from "../../types/ListCollection";

describe("test on DataFactory ", () => {
  it("Can use DataFactory", async () => {
    assertType<Function>(createDataFactory);
    let OBJ = await createDataFactory(undefined);
    expect(typeof OBJ).toBe("object");
    expectTypeOf(OBJ).toExtend<FactoryArtefact>();

    assertType<(a: ListCollection) => void>(OBJ.updateData);
    assertType<() => void>(OBJ.initData);

    // async function DataFactory(): Promise<ListCollection>
    console.log(
      "IOIO XXX Edit Networking objects, and run dataFactory again, and show its different. I guess Function.name assists"
    );
  });

  it("Can use Update capacity", async () => {
    const OBJ = await createDataFactory(simple_fixture1());
    expectTypeOf(OBJ).toExtend<FactoryArtefact>();
    expect(OBJ.currentData).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)?.nom).toBe("list 1");
    // leSigh, the below doesn't compile.
    //  assertType<ListCollection>(OBJ.currentData);
    const REPLACE1 = new ListService();
    REPLACE1.put(1, AList.importTest(simple_fixture2()[0]));

    OBJ.updateData(REPLACE1);
    expect(OBJ.currentData).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)?.nom).toBe("list 2");
  });
});
