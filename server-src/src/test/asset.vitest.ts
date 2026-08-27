import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";

import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { runExecProcessOnUrl } from "../../../common/cURL";
import type { SimpleResponse } from "../../../common/util";
import {  TEST_LOCATION_URL } from "../Constants";


// import supertest from "supertest";
// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1
// import { INestApplication } from "@nestjs/common";
// import { Test } from "@nestjs/testing";

describe("Client-side aaset URLs are valid...", (): void => {
  const FILE_URLS: Array<string> = [
    TEST_LOCATION_URL + "/",
    TEST_LOCATION_URL + "/asset/manifest.json",
    TEST_LOCATION_URL + "/asset/favicon.ico",
    TEST_LOCATION_URL + "/asset/logo.png",
    TEST_LOCATION_URL + "/asset/shopping.min.css",
    TEST_LOCATION_URL + "/asset/shopping.es.min.mjs",
    TEST_LOCATION_URL + "/asset/worker1.es.min.mjs",
  ];
  const APP_URLS: Array<string> = [
    TEST_LOCATION_URL + "/",
    TEST_LOCATION_URL + "/list-all",
    TEST_LOCATION_URL + "/list/1",
    TEST_LOCATION_URL + "/api/shared-state",
  ];
  const BAD_URLS: Array<string> = [
    TEST_LOCATION_URL + "/dfsdfsfsdfs",
    TEST_LOCATION_URL + "/list/gdgdfg/ddgdfgd/",
    TEST_LOCATION_URL + "/dgdgd/asset/logo.png",
    TEST_LOCATION_URL + "/asset/drtgdgdfgdfgdfg.png",
    TEST_LOCATION_URL + "/list/-8",
    TEST_LOCATION_URL + "/list/0",
  ];

  it("urls drilldown ", async (): Promise<boolean> => {
    for (let i = 0; i < FILE_URLS.length; i++) {
      let resp: SimpleResponse = await runExecProcessOnUrl(FILE_URLS[i], undefined);
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
