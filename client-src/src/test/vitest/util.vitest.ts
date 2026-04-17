import { assert, describe, it, expect } from "vitest";
// import { LocalStorage } from "node-localstorage";

// only functions that make sense outside of a browser are in this test
import { rad2deg, wrap_getMyIP, nextId, resetId, pollId } from "../../services/util";
import { TestLocation } from "../MockLocation";
// import type { MockLocation } from './MockLocation';
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";

describe("I can use the flat util functions", () => {
  it("run rad2deg", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      assert.equal(rad2deg(-1), -57.29577951308232, "Fix test");
      assert.equal(rad2deg(0), 0, "Fix test");
      assert.equal(rad2deg(1), 57.29577951308232, "Fix test");
      assert.equal(rad2deg(Math.PI), 180, "Fix test");
      good(true);
    });
  });

  it("run wrap_getMyIP", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      const url1 = "https://find-and-update.company-information.service.gov.uk/company/158487222";
      const url2 = "https://www.ebay.co.uk/itm/335829529206?_trksid=p2332490&rr=c101196&q=m2219";
      const url3 = "//www.ebay.co.uk/itm/335829529206?_trksid=p2332490.c101196.m2219";
      const url4 = "http://192.168.0.0/resource/covering-letter-generator";

      globalThis.location = new TestLocation(url1);
      assert.equal(wrap_getMyIP(), "https://find-and-update.company-information.service.gov.uk/");

      globalThis.location = new TestLocation(url2);
      assert.equal(wrap_getMyIP(), "https://www.ebay.co.uk/");

      globalThis.location = new TestLocation(url3);
      assert.equal(wrap_getMyIP(), "/");

      globalThis.location = new TestLocation(url4);
      assert.equal(wrap_getMyIP(), "/");
      good(true);
    });
  });

  it("run the counters", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      assert.equal(nextId(), "obj1", "first id");
      assert.equal(nextId(), "obj2", "first id A");
      assert.equal(nextId(), "obj3", "first id B");
      assert.equal(nextId(), "obj4", "first id C");
      assert.equal(nextId(), "obj5", "first id D");
      resetId();
      assert.equal(nextId(), "obj1", "reset id");
      assert.equal(pollId(), "obj1", "poll id");
      assert.equal(pollId(), "obj1", "poll id");
      assert.equal(pollId(), "obj1", "poll id");
      assert.equal(pollId(), "obj1", "poll id");
      good(true);
    });
  });
});
