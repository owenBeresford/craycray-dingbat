import { assert, describe, it, expect, assertType, beforeAll, afterAll } from "vitest";

import type { PromiseSucceed, PromiseReject } from '../../common/types/promises';
import { runFetch } from '../../common/util';

// import supertest from "supertest";
// https://scribe.rip/@azizzouaghia/setting-up-basic-api-testing-with-supertest-cucumber-jest-and-typescript-8c6a23c045a1
// import { INestApplication } from "@nestjs/common";
// import { Test } from "@nestjs/testing";


describe("Client-side aaset URLs are valid...", ():void => {
    const PREFIX:string="https://192.168.1.218:3001";
    const URLS:Array<string>=[
  PREFIX + "/index.html",
  PREFIX + "/manifest.json",
  PREFIX + "/favicon.ico",
  PREFIX + "/logo.png",
  PREFIX + "/shopping.min.css",
  PREFIX + "/shopping.min.mjs",
  PREFIX + "/worker1.min.mjs",
      ];

  it("urls drilldown ", async (): Promise<boolean> => {
    return new Promise(async (a:PromiseSucceed, b:PromiseReject):void => {
        for(let i=0; i<URLS.length; i++ ) {
            let resp:SimpleResponse=await runFetch(URLS[i], true, undefined);
            expect( resp.ok).toBe(true);
            expect( typeof resp.headers.get("content-type") ).toBe( "string");
            expect( resp.headers.get("content-type").length ).toBeGreaterThan(5);
            expect( resp.body.length).toBeGreaterThan(5);
        }
        a( true);
    });
  });
});



