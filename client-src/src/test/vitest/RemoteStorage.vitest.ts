import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";


import { RemoteStorage } from "../../services/RemoteStorage";
import { createRemoteService } from "../../Constants";
import { MockLocation, TestLocation } from "../MockLocation";

import type { RemoteConfig } from "../../../../common/types/RemoteTypes";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";
import { runExecProcessOnUrl } from "../../../../common/cURL";


describe("test on RemoteStorage ", () => {
  it("Can create RemoteStorage ", () => {
    // smoke test function, to show code compiles and import paths are correct
    const LOC = new TestLocation("https://api.github.com/users/octocat");
    let d3: RemoteConfig = {
      url: LOC.href,
      timeout: 500,
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      method: "GET",
      credentials: "same-origin",
    };

    const OBJ = new RemoteStorage(d3);
    expect(typeof OBJ).toBe("object");
    assertType<RemoteStorage>(OBJ);
  });

  it("Can poll() ", async (): Promise<void> => {
    let LOC = new TestLocation("https://api.github.com/users/octocat");
    let d3: RemoteConfig = {
      url: LOC.href,
      timeout: 500,
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      method: "GET",
      agent:runExecProcessOnUrl,
      credentials: "same-origin",
    };

    let OBJ = new RemoteStorage(d3);
    let d1 = new Date();
    expect(await OBJ.poll()).toBe(true);
    let d2 = new Date();
    expect(d2.getTime() - d1.getTime()).toBeGreaterThan(10); // ms
    expect(d2.getTime() - d1.getTime()).toBeLessThan(3_001); // ms
  });

  it("Can poll() 2", async (): Promise<void> => {
    let d2: Date, d1: Date;
    try {
      // a clearly fake and unroutable domain
      let LOC = new TestLocation("https://api.github.PANTS.PANTS/users/octocat");
      let d3 = {
        url: LOC.href,
        timeout: 500,
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        method: "GET",
        agent:runExecProcessOnUrl,
        credentials: "same-origin",
      };

      let OBJ = new RemoteStorage(d3);
      d1 = new Date();
      expect(await OBJ.poll()).toBe(false);
      d2 = new Date();
      // expect(d2.getTime() - d1.getTime() ).toBeGreaterThan( 10); // ms
      expect(d2.getTime() - d1.getTime()).toBeLessThan(3_001); // ms
    } catch (e: unknown) {
      assert.isOk(true, "I expect to not be able to route to a TLD of PANTS.PANTS");
    }
  });

  it("Can poll() 3", async (): Promise<void> => {
    // real domain, fake path
    // I am annoying.  My code will mask out /api for latyer API points.   This is /v10/api, so it hits the wildcard.
    let LOC = new TestLocation("https://app.hiss:3001/v10/api/new-shiny-feature");
    let d3 = {
      url: LOC.href,
      timeout: 500,
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      method: "GET",
      agent:runExecProcessOnUrl,
      credentials: "same-origin",
    };

    let OBJ = new RemoteStorage(d3);
    let d1 = new Date();
    expect(await OBJ.poll()).toBe(true);  // hits wildcard
    let d2 = new Date();
    expect(d2.getTime() - d1.getTime()).toBeGreaterThan(10); // ms
    expect(d2.getTime() - d1.getTime()).toBeLessThan(3_001); // ms    
  });

  it("Can poll() 4", async (): Promise<void> => {
    // real domain, fake path
     let LOC = new TestLocation("https://app.hiss:3001/api/new-shiny-feature");
    let d3 = {
      url: LOC.href,
      timeout: 500,
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      method: "GET",
      agent:runExecProcessOnUrl,
      credentials: "same-origin",
    };

    let OBJ = new RemoteStorage(d3);
    let d1 = new Date();
    expect(await OBJ.poll()).toBe(false);  // hits wildcard
    let d2 = new Date();
    expect(d2.getTime() - d1.getTime()).toBeGreaterThan(10); // ms
    expect(d2.getTime() - d1.getTime()).toBeLessThan(3_001); // ms

  });



  it("I can GET data", async (): Promise<void> => {
    let conf = {
      url: "https://app.hiss:3001/api/shared-state",
      timeout: 1_000,
      mode: "no-cors", // no-cors, *cors, same-origin
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      agent:runExecProcessOnUrl,
      credentials: "",
    };
    let rr = new RemoteStorage(conf);
    let d1 = new Date();

    await rr
      .loadState()
      .then((dat) => {
        assert.isTrue(Array.isArray(dat), "Need an array");
        assert(dat.length, "Need an array with content");
        for (let i = 0; i < dat.length; i++) {
          assert.isOk(dat[i].name && dat[i].name.length > 2, " item at " + i + " has a name");
          assert.isOk(dat[i].id, " item at " + i + " has an id");

          assert.deepEqual(
            Object.keys(dat[i]),
            ["name", "created", "edited", "count", "id", "list"],
            "All necessary keys are present"
          );
        }
        assert.isTrue(
          new Date().getTime() - d1.getTime() < 1100,
          "to download data from the local server must take less than 1 s"
        );
      })
      .catch((e: unknown) => {
        assert.isOk(false, "class returned error " + (e as Error).message);
      });
  });

  it("I can POST data", async (): Promise<void> => {
    let conf = {
      url: "https://app.hiss:3001/api/shared-state",
      timeout: 1000,
      mode: "no-cors", // no-cors, *cors, same-origin
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      agent:runExecProcessOnUrl,
      credentials: "",
    };
    let rr = new RemoteStorage(conf);
    let d1 = new Date();
    let data = [
      {
        name: "AAA1",
        created: 1654685752265,
        edited: 1654682155265,
        count: 5,
        id: 1,
        list: ["aa1", "bb1", "cc1", "dd", "ee"],
      },
      {
        name: "BBB1",
        created: 1654685749265,
        edited: 1654682095265,
        count: 6,
        id: 2,
        list: ["aa2", "bb2", "cc2", "dd", "ee", "ff"],
      },
    ];

    await rr
      .saveState(data)
      .then((dat) => {
        assert.isOk(dat, "This should be true");
        assert.isTrue(
          (new Date().getTime() - d1.getTime()) < 1100,
          "to download data from the local server must take less than 1 s"
        );
      })
      .catch((e: unknown) => {
        assert.isOk(false, "class returned error " + (e as Error).message);
      });
  });

  it("I can POST data, BAD URL", async (): Promise<void> => {
    let conf = {
      url: "https://app.hiss:3001/sdfsdf+sdfsdfsdfs+fsdf_sd",
      timeout: 1000,
      mode: "no-cors", // no-cors, *cors, same-origin
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      agent:runExecProcessOnUrl,
      credentials: "",
    };
    let rr = new RemoteStorage(conf);
    let d1 = new Date();
    let data = [
      {
        name: "AAA1",
        created: 1654685752265,
        edited: 1654682155265,
        count: 5,
        id: 1,
        list: ["aa1", "bb1", "cc1", "dd", "ee"],
      },
      {
        name: "BBB1",
        created: 1654685749265,
        edited: 1654682095265,
        count: 6,
        id: 2,
        list: ["aa2", "bb2", "cc2", "dd", "ee", "ff"],
      },
    ];

    await rr
      .saveState(data)
      .then((dat) => {
        console.log("Post bad data response", dat);
        assert.isOk(dat, "This should be true");
        assert.isTrue(
          new Date().getTime() - d1.getTime() < 1100,
          "to download data from the local server must take less than 1 s"
        );
      })
      .catch((e: unknown) => {
        assert.isTrue(
          new Date().getTime() - d1.getTime() < 1100,
          "to download data from the local server must take less than 1 s"
        );
        assert.fail((e as Error).message, "Server sent an error http status 404", "Test class returned error " + (e as Error).message, "===");
      })
      .finally(() => {
        console.log("finally for the bad URL ");
      });
  });

  it("I can POST data, BAD headers", async (): Promise<void> => {
    let conf = {
      url: "https://app.hiss:3001/api/shared-state",
      timeout: 1000,
      mode: "same-origin", // no-cors, *cors, same-origin
      method: "POST",
      headers: { "Content-Type": "CABBAGE", Accept: "application/json" },
      credentials: "",
      agent:runExecProcessOnUrl,
    };
    let rr = new RemoteStorage(conf);
    let d1 = new Date();
    let data = [
      {
        name: "AAA1",
        created: 1654685752265,
        edited: 1654682155265,
        count: 5,
        id: 1,
        list: ["aa1", "bb1", "cc1", "dd", "ee"],
      },
      {
        name: "BBB1",
        created: 1654685749265,
        edited: 1654682095265,
        count: 6,
        id: 2,
        list: ["aa2", "bb2", "cc2", "dd", "ee", "ff"],
      },
    ];

    await rr
      .saveState(data)
      .then((dat) => {
        assert.isNotOk(dat, "A error is sent");
        assert.isTrue(
          new Date().getTime() - d1.getTime() < 1100,
          "to download data from the local server must take less than 1 s"
        );
      })
      .catch((e: unknown) => {
        console.log("ERR API ERR HANDLER");
        assert.isTrue(
          new Date().getTime() - d1.getTime() < 1100,
          "to download data from the local server must take less than 1 s"
        );
        assert.isTrue(false, "Test class returned error " + (e as Error).message);
      })
      .finally(() => {
        console.log("finally for the bad headers ");
      });
  });
});
