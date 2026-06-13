import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";
// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1

import { delay } from "../../../common/util";
import { runExecProcessOnUrl } from "../../../common/cURL";
import { ShoppingBE } from "../shopping/ShoppingBE";
import { ShoppingService } from "../shopping/ShoppingService";
import { SaveStruct } from "../../../common/types/SaveStruct";
import { fixture1, fixture2, fixture3, transform2SaveStruct } from "../../../common/fixture-lists";
import type { SimpleResponse } from "../../../common/util";

describe("I can use API module", () => {
  const TARGET: string = "https://app.hiss:3001/api/shared-state";

  it("can GET the API", async () => {
    const res: SimpleResponse = await runExecProcessOnUrl(TARGET, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).greaterThan(1);
  });

  it("can POST the API", async () => {
    // made data from fixture...
    let res: SimpleResponse = await runExecProcessOnUrl(TARGET, {
      method: "POST",
      body: JSON.stringify(transform2SaveStruct(fixture1())),
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
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
    let res: SimpleResponse = await runExecProcessOnUrl(TARGET, {
      method: "POST",
      body: JSON.stringify(transform2SaveStruct(fixture1())),
      headers: { "Content-Type": "application/json; charset=utf-8", Accept: "application/json; charset=utf-8" },
    });
    expect(res.ok);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    try {
      if (typeof res.body != "string") {
        throw Error("Expected JSON object");
      } else {
        let obj = JSON.parse(new String(res.body).trim());
        expect(obj.statusCode).toBe(204);
      }
    } catch (e: unknown) {
      console.log("[FIRST] Test quit early saying " + (e as Error).message);
      expect(false).toBe(true);
    }

    res = await runExecProcessOnUrl(TARGET, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    // assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).toBeGreaterThan(3);

    res = await runExecProcessOnUrl(TARGET, {
      method: "post",
      body: JSON.stringify(transform2SaveStruct(fixture3())),
      headers: { "Content-Type": "application/json; charset=utf-8", Accept: "application/json; charset=utf-8" },
    });
    expect(res.ok);
    expect(res.status).toBe(201);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    try {
      if (typeof res.body != "string") {
        throw Error("Expected JSON object");
      } else {
        let obj = JSON.parse(new String(res.body).trim());
        expect(obj.statusCode).toBe(204);
      }
    } catch (e: unknown) {
      console.log("[SECOND] Test quit early saying " + (e as Error).message);
      expect(false).toBe(true);
    }

    res = await runExecProcessOnUrl(TARGET, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    assertType<Array<SaveStruct>>(res.body);
    expect(res.body.length).toBeGreaterThan(4);
  });

  // IOIO XXX add a wonky object to POST, to show error state is sensible

  it("vitest of skip DEMO TEST 1111", { skip: true }, async (): Promise<boolean> => {
    return new Promise(async (a, b) => {
      await delay(1_000);
      a(true);
    });
  });
});
