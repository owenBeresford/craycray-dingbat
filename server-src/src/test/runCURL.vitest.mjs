import {
  assert,
  describe,
  it,
  expect,
  assertType,
  beforeAll,
  afterAll,
} from "vitest";

import { delay } from "../../../common/util";
import { runExecProcessOnUrl } from "../../../common/cURL";

describe("I can compile external script handling", () => {
  const TARGET = "https://app.hiss:3001/api/shared-state";

  it("can run an URL via cURL", async () => {
    const res = await runExecProcessOnUrl(TARGET, undefined);
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    expect(res.body.length).greaterThan(1);
  });

  it("can run EMPTY POST an URL via cURL", async () => {
    const res = await runExecProcessOnUrl(TARGET, {
      method: "POST",
      body: "[]",
      headers:{"Content-Type":"application/json; charset=utf-8"},
    });
    expect(res.ok);
    expect(res.status).toBe(500);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    expect(res.body.length).greaterThan(1);
  });

  it("can run POST an URL via cURL", async () => {
    const res = await runExecProcessOnUrl(TARGET, {
      method: "POST",
      body: '[{"name":"list 3","created":1787476684330,"edited":1787476684330,"count":10,"id":1,"list":["thing 0","thing 1","thing 2","thing 3","thing 4","thing 5","thing 6","thing 7","thing 8","thing 9","thing 10","thing 11","thing 12","thing 13","thing 14","thing 15","thing 16","thing 17","thing 18","thing 19","thing 0","thing 1","thing 2","thing 3","thing 4","thing 5","thing 6","thing 7","thing 8","thing 9","thing 10","thing 11","thing 12","thing 13","thing 14","thing 15","thing 16","thing 17","thing 18","thing 19","thing 0","thing 1","thing 2","thing 3","thing 4","thing 5","thing 6","thing 7","thing 8","thing 9","thing 10","thing 11","thing 12","thing 13","thing 14","thing 15","thing 16","thing 17","thing 18","thing 19"]},{"name":"list 2","created":1787476684295,"edited":1787476684295,"count":3,"id":2,"list":["thing 1","thing 2","thing 3"]},{"name":"list 3","created":1787476684295,"edited":1787476684295,"count":10,"id":3,"list":["thing 1","thing 2","thing 3","thing 4","thing 5","thing 6","thing 7","thing 8","thing 9"]}]',
      headers:{"Content-Type":"application/json; charset=utf-8"},
    });
console.log( "SDFSDF ", TARGET, "a real body", res);
    expect(res.ok);
    expect( Math.round(res.status/100) ).toBe(2);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    expect(res.body.length).greaterThan(1);
  });


});
