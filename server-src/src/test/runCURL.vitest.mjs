import {
  assert,
  describe,
  it,
  expect,
  assertType,
  beforeAll,
  afterAll,
} from "vitest";

import { delay, runFetch } from "../../../common/util";
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

  it("can run POST an URL via cURL", async () => {
    const res = await runExecProcessOnUrl(TARGET, {
      method: "POST",
      body: "[]",
    });
    expect(res.ok);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toMatch(/json/);
    expect(res.body.length).greaterThan(1);
  });
});
