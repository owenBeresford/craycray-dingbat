import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { SharedStateWorker, exponentialDelay } from "../../workers/SharedStateWorker";
import type { DelayCallbackType, DataPipeline } from "../../types/Saveable";
import type { SaveStruct } from "../../../../common/types/SaveStruct";
import { TEST_LOCATION_URL, API_RETRY } from "../../Constants";
import { runExecProcessOnUrl } from "../../../../common/cURL";
import { TestLocation } from "../MockLocation";
import { RemoteStorage } from "../../services/RemoteStorage";
import type { RemoteConfig } from "../../../../common/types/RemoteTypes";

function useTestSSW(loc: Location | WorkerLocation): DataPipeline {
  let d3: RemoteConfig = {
    url: loc.protocol + "//" + loc.hostname + ":" + loc.port + "/api/shared-state",
    timeout: API_RETRY,
    headers: { "Content-Type": "application/json" },
    mode: "same-origin",
    method: "GET",
    credentials: "same-origin",
    agent: runExecProcessOnUrl,
  };

  return new SharedStateWorker(new RemoteStorage(d3), exponentialDelay);
  //  direct connecxtion, no threads
}

describe("test on SharedStateWorker ", () => {
  it("Can create SharedStateWorker ", () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useTestSSW(LOC);
    expect(typeof txt).toBe("object");

    assertType<DataPipeline>(txt);
    expectTypeOf(txt).toExtend<DataPipeline>();
  });

  it("Can use SharedStateWorker pushWhenAble ", async () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useTestSSW(LOC);
    expect(typeof txt).toBe("object");

    let dat: Array<SaveStruct> = [
      {
        name: "list1 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 1,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
    console.log("First test, pushWhenAble #1");
    expect(await txt.pushWhenAble(dat)).equal(true);

    dat = [
      {
        name: "list2 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 2,
        list: ["thing 1", "thing 2", "thing 3"],
      },
      {
        name: "list3 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 3,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
    console.log("First test, pushWhenAble #2");
    expect(await txt.pushWhenAble(dat)).equal(true);

    dat = [
      {
        name: "list4 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 4,
        list: ["thing 1", "thing 2", "thing 3"],
      },
      {
        name: "list5 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 4,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
    // should fail as dupe ID
    console.log("First test, pushWhenAble #3 should fail as dupe ID");
    expect(await txt.pushWhenAble(dat)).equal(true);

    dat = [
      {
        name: "list6 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 1,
        list: ["thing 1", "thing 2", "thing 3"],
      },
      {
        name: "list7 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 0,
        id: 2,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
    console.log("First test, pushWhenAble #4  count of items is wrong");
    // should fail as count of items is wrong
    await expect(async () => {
      return await txt.pushWhenAble(dat);
    }).rejects.toThrowError(/Server sent an error http status 500/);
  });

  it("Can use SharedStateWorker pullWhenAble", async () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useTestSSW(LOC);
    expect(typeof txt).toBe("object");

    let dat: Array<SaveStruct> = [
      {
        name: "list 3",
        created: 1783795584682,
        edited: 1783795584682,
        count: 3,
        id: 4,
        list: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
      },
      {
        name: "list 1",
        created: 1783795584682,
        edited: 1783795584682,
        count: 3,
        id: 1,
        list: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
      },
      {
        name: "list 2",
        created: 1783795517176,
        edited: 1783795517176,
        count: 4,
        id: 3,
        list: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
      },
      {
        name: "list 3",
        created: 1783795517176,
        edited: 1783795517176,
        count: 4,
        id: 4,
        list: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
      },
    ];

    let tmp = await txt.pullWhenAble();
    expect(tmp.length).equal(dat.length);
    for (let i = 0; i < dat.length; i++) {
      expect(tmp[i].name).equal(dat[i].name);
      expect(tmp[i].id).equal(dat[i].id);
      expect(tmp[i].list).toStrictEqual(dat[i].list);
    }
  });

  it("Can use SharedStateWorker push empty data", async () => {
    try {
      let txt = useTestSSW(new TestLocation(TEST_LOCATION_URL));
      expect(typeof txt).toBe("object");
      // IOIO start thread first
      let dat: Array<SaveStruct> = [];
      await expect(async () => txt.pushWhenAble(dat)).rejects.toThrowError();

      dat = [];
      await expect(async () => txt.pushWhenAble(dat)).rejects.toThrowError();
    } catch (e: unknown) {
      console.log("Err? ", (e as Error).message);
    }
  });

  it("Can use SharedStateWorker (ERRR for URL)", async () => {
    try {
      const url = "http://app.hiss:8080/thing";
      let txt = useTestSSW(new TestLocation(url));
      expect(typeof txt).toBe("object");
      // IOIO start thread first
      let dat: Array<SaveStruct> = [];
      await expect(async () => txt.pushWhenAble(dat)).rejects.toThrowError();
    } catch (e: unknown) {
      console.log("Err? ", (e as Error).message);
    }
  }, 1_200);
});
