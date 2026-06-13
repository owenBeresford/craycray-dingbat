import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";

import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { runExecProcessOnUrl } from "../../../common/cURL";
import type { SimpleResponse } from "../../../common/util";

// import supertest from "supertest";
// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1
// import { INestApplication } from "@nestjs/common";
// import { Test } from "@nestjs/testing";

describe("Client-side aaset URLs are valid...", (): void => {
  const PREFIX: string = "https://app.hiss:3001";
  const FILE_URLS: Array<string> = [
    PREFIX + "/",
    PREFIX + "/asset/manifest.json",
    PREFIX + "/asset/favicon.ico",
    PREFIX + "/asset/logo.png",
    PREFIX + "/asset/shopping.min.css",
    PREFIX + "/asset/shopping.es.min.mjs",
    PREFIX + "/asset/worker1.es.min.mjs",
  ];
  const APP_URLS: Array<string> = [
    PREFIX + "/",
    PREFIX + "/list-all",
    PREFIX + "/list/1",
    PREFIX + "/api/shared-state",
  ];
  const BAD_URLS: Array<string> = [
    PREFIX + "/dfsdfsfsdfs",
    PREFIX + "/list/gdgdfg/ddgdfgd/",
    PREFIX + "/dgdgd/asset/logo.png",
    PREFIX + "/asset/drtgdgdfgdfgdfg.png",
    PREFIX + "/list/-8",
    PREFIX + "/list/0",
  ];

  it("urls drilldown ", async (): Promise<boolean> => {
    for (let i = 0; i < FILE_URLS.length; i++) {
      let resp: SimpleResponse = await runExecProcessOnUrl(FILE_URLS[i], undefined);
      console.log(resp);
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

  it("urls drilldown 2 ", async (): Promise<boolean> => {
    for (let i = 0; i < APP_URLS.length; i++) {
      let resp: SimpleResponse = await runExecProcessOnUrl(APP_URLS[i], undefined);
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

  it("urls drilldown 3 ", async (): Promise<boolean> => {
    for (let i = 0; i < BAD_URLS.length; i++) {
      let resp: SimpleResponse = await runExecProcessOnUrl(BAD_URLS[i], undefined);
      if (BAD_URLS[i].match(/3001\/asset\//)) {
        expect(resp.ok).toBe(false);
        expect(resp.status).toBe(404);
      } else {
        expect(resp.status).toBe(218);
      }
    }
    return true;
  });
});
