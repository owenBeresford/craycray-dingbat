import { assert, describe, it, expect } from "vitest";
import { fetch } from "cross-fetch";

import { RemoteConfig, DistantStorable } from "../types/RemoteTypes";
import { RemoteStorage } from "../services/RemoteStorage";

describe("I can create RemoteStorage", () => {
  it("I can create it", async () => {
    return new Promise((good, bad) => {
      assert(RemoteStorage, "this is an object");
      assertType <
        DistantStorable >
        (RemoteStorage, "this is an object of correct type ");
      //    assert.isTrue(RemoteStorage instanceof DistantStorable, 'this is an object of correct type ');
      good();
    });
  });

  it("I can GET data", async () => {
    return new Promise((good, bad) => {
      let conf = {
        url: "http://192.168.0.35:3001/api/shared-state",
        timeout: 1000,
        mode: "same-origin", // no-cors, *cors, same-origin
        method: "GET",
        //	headers: Record<string, string>, //  'Content-Type': 'application/json'
        //	credentials:string;
      };
      let rr = new RemoteStorage(conf, fetch);
      let d1 = new Date();

      rr.loadState()
        .then((dat) => {
          assert.isTrue(Array.isArray(dat), "Need an array");
          assert(dat.length, "Need an array with content");
          for (let i = 0; i < dat.length; i++) {
            assert.equal(
              dat[i].name && dat[i].name.length > 2,
              " item at " + i + " has a name"
            );
            assert.equal(dat[i].id, " item at " + i + " has an id");
            assert.deepEqual(
              Object.keys(dat[i]),
              ["name", "created", "edited", "count", "id", "list"],
              "All necessary keys are present"
            );
          }
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          good();
        })
        .catch((e) => {
          assert.isTrue(false, "class returned error " + e);
          bad(e);
        });
    });
  });

  it("I can POST data", async () => {
    return new Promise((good, bad) => {
      let conf = {
        url: "http://192.168.0.35:3001/api/shared-state",
        timeout: 1000,
        mode: "same-origin", // no-cors, *cors, same-origin
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        //	headers: Record<string, string>, //  'Content-Type': 'application/json'
        //	credentials:string;
      };
      let rr = new RemoteStorage(conf, fetch);
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

      rr.saveState(data)
        .then((dat) => {
          assert.isOk(dat, "This should be true");
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          good();
        })
        .catch((e) => {
          assert.isTrue(false, "class returned error " + e);
          bad(e);
        });
    });
  });

  it("I can POST data, BAD URL", async () => {
    return new Promise((good, bad) => {
      let conf = {
        url: "http://192.168.0.35:3001/sdfsdf+sdfsdfsdfs+fsdf_sd",
        timeout: 1000,
        mode: "same-origin", // no-cors, *cors, same-origin
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        //	headers: Record<string, string>, //  'Content-Type': 'application/json'
        //	credentials:string;
      };
      let rr = new RemoteStorage(conf, fetch);
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

      rr.saveState(data)
        .then((dat) => {
          console.log("Post bad data response", dat);
          assert.isOk(dat, "This should be true");
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          good();
        })
        .catch((e) => {
          console.log("ERR API ERR HANDLER");
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          console.log("ERR API ERR HANDLER2");
          assert.fail(1 === 3, "Test class returned error " + e);
          console.log("ERR API ERR HANDLER3");
          bad(false); // never run, due to above failure
        })
        .finally(() => {
          console.log("finally for the bad URL ");
        });
    });
  });

  it("I can POST data, BAD headers", async (done) => {
    return new Promise((good, bad) => {
      let conf = {
        url: "http://192.168.0.35:3001/api/shared-state",
        timeout: 1000,
        mode: "same-origin", // no-cors, *cors, same-origin
        method: "POST",
        headers: { "Content-Type": "CABBAGE", Accept: "application/json" },
        //	headers: Record<string, string>, //  'Content-Type': 'application/json'
        //	credentials:string;
      };
      let rr = new RemoteStorage(conf, fetch);
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

      rr.saveState(data)
        .then((dat) => {
          console.log("Post bad data response", dat);
          assert.isOk(dat, "This should be true");
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          good();
        })
        .catch((e) => {
          console.log("ERR API ERR HANDLER");
          assert.isTrue(
            new Date() - d1 < 1100,
            "to download data from the local server must take less than 1 s"
          );
          assert.isTrue(false, "Test class returned error " + e);
          bad(false);
        })
        .finally(() => {
          console.log("finally for the bad headers ");
          //        done(false);
        });
    });
  });
});
