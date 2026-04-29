import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";

import type { PromiseSucceed, PromiseReject } from "../../common/types/promises";
import { runFetch } from "../../../common/util";

// import supertest from "supertest";
// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1
// import { INestApplication } from "@nestjs/common";
// import { Test } from "@nestjs/testing";

describe("Client-side aaset URLs are valid...", (): void => {
  const PREFIX: string = "https://app.hiss:3001";
  const URLS: Array<string> = [
    PREFIX + "/",
    PREFIX + "/asset/manifest.json",
    PREFIX + "/asset/favicon.ico",
    PREFIX + "/asset/logo.png",
    PREFIX + "/asset/shopping.min.css",
    PREFIX + "/asset/shopping.es.min.mjs",
    PREFIX + "/asset/worker1.es.min.mjs",
  ];

  it("urls drilldown ", async (): Promise<boolean> => {
    for (let i = 0; i < URLS.length; i++) {
      let resp: SimpleResponse = await runFetch(URLS[i], false, undefined);
      expect(resp.ok).toBe(true);
      expect(typeof resp.headers.get("content-type")).toBe("string");
      expect(resp.headers.get("content-type").length).toBeGreaterThan(5);
      if (typeof resp.body === "string") {
        expect(resp.body.length).toBeGreaterThan(5);
      } else {
        expect(Object.keys(resp.body).length).toBeGreaterThan(2);
      }
    }
    return true;
  });
});
