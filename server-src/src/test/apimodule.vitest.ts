import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";

// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1
import { GoneException } from "@nestjs/common/exceptions";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { delay, runFetch } from "../../../common/util";
import { ShoppingBE } from "../shopping/ShoppingBE";
import { ShoppingService } from "../shopping/ShoppingService";
import { SaveStruct } from "../../../common/types/SaveStruct";
// import type { TestDataSchema } from "../../client-src/src/types/ListCollection";
// import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { fixture1, fixture2, transform2SaveStruct } from "../../../common/fixture-lists";

describe("I can use API module", () => {
  const TARGET: string = "https://app.hiss:3001/api/shared-state";

  it("can GET the API", async () => {
    const res: SimpleResponse = runFetch(TARGET, true, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).greaterThan(1);
  });

  it("can POST the API", async () => {
    // made data from fixture...
    let res: SimpleResponse = await runFetch(TARGET, true, { method: "post", body: transform2SaveStruct(fixture1()) });
    expect(res.ok);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    try {
      let obj = JSON.parse(new String(res.body).trim());
      expect(obj.statusCode).toBe(204);
    } catch (e) {
      expect(false).toBe(true);
    }
    // i think, yes doesnt match above, yes, this is great.   "1scriptingLang to rule them", but they chose JS. #leSigh
  });

  it("more complex API session [1]", async () => {
    // made data from fixture...
    let res: SimpleResponse = await runFetch(TARGET, true, { method: "post", body: transform2SaveStruct(fixture1()) });
    expect(res.ok);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    try {
      if (typeof res.body === "string") {
        throw Error("Expected JSON object");
      } else {
        let obj = JSON.parse(new String(res.body).trim());
        expect(obj.statusCode).toBe(204);
      }
    } catch (e) {
      console.log("Test quit early saying " + (e as Error).message);
      expect(false).toBe(true);
    }

    ret: SimpleResponse = runFetch(TARGET, true, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).toBe(3);

    res: SimpleResponse = await runFetch(TARGET, true, { method: "post", body: transform2SaveStruct(fixture3()) });
    expect(res.ok);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    try {
      if (typeof res.body === "string") {
        throw Error("Expected JSON object");
      } else {
        let obj = JSON.parse(new String(res.body).trim());
        expect(obj.statusCode).toBe(204);
      }
    } catch (e: unknown) {
      console.log("Test quit early saying " + (e as Error).message);
      expect(false).toBe(true);
    }

    ret: SimpleResponse = runFetch(TARGET, true, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).toBe(4);
  });

  it("vitest of skip DEMO TEST 1111", { skip: true }, async (): Promise<boolean> => {
    return new Promise(async (a, b) => {
      await delay(1_000);
      a(true);
    });
  });
});
