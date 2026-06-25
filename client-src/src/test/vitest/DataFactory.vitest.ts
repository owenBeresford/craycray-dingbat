import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import type { _LOGGING_ } from "../../../../common/types/env";
import { createDataFactory } from "../../services/DataFactory";
import { simple_fixture1, simple_fixture2, transform2SaveStruct } from "../../../../common/fixture-lists";
import { ListService } from "../../services/ListService";
import { EMPTY_LIST, StdList } from "../../services/AList";
import { TEST_LOCATION_URL } from "../../Constants";
import type { FactoryArtefact } from "../../services/DataFactory";
import type { ListCollection } from "../../types/ListCollection";
import { TestLocation } from "../MockLocation";

describe("test on DataFactory ", () => {
  const PASSBACK= (a:number):void=>{};

  it("Can use DataFactory", async () => {
    assertType<Function>(createDataFactory);
    const TEST: TestLocation = new TestLocation(TEST_LOCATION_URL);
    let OBJ = await createDataFactory(simple_fixture1(), TEST, PASSBACK);
    expect(typeof OBJ).toBe("object");
    expectTypeOf(OBJ).toExtend<FactoryArtefact>();

    assertType<(a: ListCollection<string>) => void>(OBJ.updateData);
    assertType<(loc: Location | TestLocation) => void>(OBJ.initData);

    // async function DataFactory(): Promise<ListCollection<string>>
    console.log(
      "IOIO XXX Edit Networking objects, and run dataFactory again, and show its different. I guess Function.name assists"
    );
  });

  it("Can use Update capacity", async () => {
    const TEST: TestLocation = new TestLocation(TEST_LOCATION_URL);
    const OBJ = await createDataFactory(simple_fixture1(), TEST, PASSBACK);
    expectTypeOf(OBJ).toExtend<FactoryArtefact>();
    expect(OBJ.currentData).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)?.nom).toBe("list 1");
    // leSigh, the below doesn't compile.
    //  assertType<ListCollection<string>>(OBJ.currentData);
    const REPLACE1 = new ListService(PASSBACK);
    // WARN this trashes the empty data state

    REPLACE1.put(1, StdList.importTest(simple_fixture2()[0]));

    OBJ.updateData(REPLACE1);
    expect(OBJ.currentData).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)).not.toBe(undefined);
    expect(OBJ.currentData?.get(1)?.nom).toBe("list 2");
  });
});
