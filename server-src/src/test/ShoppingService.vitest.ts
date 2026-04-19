import { assert, describe, it, expect, assertType } from "vitest";
import { GoneException } from "@nestjs/common/exceptions";

import { ShoppingService } from "../shopping/ShoppingService";
import { fixture1, fixture2, transform2SaveStruct } from "../../../common/fixture-lists";
// import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { TestDataSchema } from "../../../common/types/TestDataSchema";

describe("I can use ShoppingService", () => {
  it("I can create it", () => {
    const OBJ = new ShoppingService();
    assertType<ShoppingService>(OBJ);
    assert(typeof OBJ === "object", `this is an object of correct type ${typeof OBJ}`);
  });

  it("The load() seems to work", async (): Promise<void> => {
    const OBJ = new ShoppingService();

    await OBJ.load().then((dat: string): void => {
      // this has no param or anything
      assert(typeof dat === "string" && dat.length > 100, "The load function has returned data");
      try {
        let ret2 = JSON.parse(dat);
        expect(ret2 !== null).toBe(false);
        expect(Array.isArray(ret2)).toBe(true);
      } catch (e: unknown) {
        assert(false, "The string from load() cannot be parsed as JSON without error " + (e as Error).message);
      }
    });

    // need to add a fixture file as a further test
  });

  it("The save() seems to work", async (): Promise<void> => {
    const OBJ = new ShoppingService();
    let src: Array<SaveStruct> = transform2SaveStruct(fixture1());

    await OBJ.save(src).then((dat) => {
      assert(typeof dat === "string" && dat.length > 30, "The save function has returned data");
      try {
        let ret2 = JSON.parse(dat);
        expect(ret2.statusCode).toBe(204);
      } catch (e: unknown) {
        assert(false, "The string from save() cannot be parsed as JSON without error " + (e as Error).message);
      }
    });
  });

  it("The merge() seems to work", async (): Promise<void> => {
    const OBJ = new ShoppingService();
    let src1: Array<SaveStruct> = transform2SaveStruct(fixture1());
    let src2: Array<SaveStruct> = transform2SaveStruct(fixture2());

    let ret = OBJ.merge(src1, src2);
    assertType<Array<SaveStruct>>(ret);
    // This test will show is it crashes,
    // BUT I havent tested the logic
  });

  it("The merge() seems to work", async (): Promise<void> => {
    const OBJ = new ShoppingService();
    let src1: Array<SaveStruct> = transform2SaveStruct(fixture1());

    let ret = OBJ.typeAssert(src1);
    assertType<Array<SaveStruct>>(ret);
    // This test will show is it crashes,
    // BUT I havent tested the logic

    ret = OBJ.typeAssert([]);
    assertType<Array<SaveStruct>>(ret);

    ret = OBJ.typeAssert([{}]);
    assertType<Array<SaveStruct>>(ret);
  });

  // inner(), and actual;save() are tested via save(), and is only branching to emit error states
});
