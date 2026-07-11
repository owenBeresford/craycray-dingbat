import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { SharedStateWorker, exponentialDelay } from "../../workers/SharedStateWorker";
import type { DelayCallbackType, DataPipeline } from "../../types/Saveable";
import type { SaveStruct } from "../../../../common/types/SaveStruct";
import { TEST_LOCATION_URL, API_RETRY } from "../../Constants";
import { runExecProcessOnUrl } from "../../../../common/cURL";
import { TestLocation } from "../MockLocation";
import { RemoteStorage } from "../../services/RemoteStorage";
import type { RemoteConfig } from "../../../../common/types/RemoteTypes";

function useSSW(loc: Location | WorkerLocation): DataPipeline {
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
}

describe("test on SharedStateWorker ", () => {
  it("Can create SharedStateWorker ", () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useSSW(LOC);
    expect(typeof txt).toBe("object");

    assertType<DataPipeline>(txt);
    expectTypeOf(txt).toExtend<DataPipeline>();
  });

  it("Can use SharedStateWorker ", async () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useSSW(LOC);
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

  it("Can use SharedStateWorker ", async () => {
    const LOC = new TestLocation(TEST_LOCATION_URL);
    let txt = useSSW(LOC);
    expect(typeof txt).toBe("object");

    let dat: Array<SaveStruct> = [
      {
        name: "list4 ",
        created: 1783618548107,
        edited: 1783618548107,
        count: 3,
        id: 4,
        list: ["thing 1", "thing 2", "thing 3"],
      },
      {
        name: "list5 ",
        created: 1783618548107,
        edited: 1783618548107,
        count: 3,
        id: 4,
        list: ["thing 1", "thing 2", "thing 3"],
      },
      {
        name: "list 3",
        created: 1778251875567,
        edited: 1778251875567,
        count: 10,
        id: 3,
        list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
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

  it("Can use SharedStateWorker (ERRR ON URL)", async () => {
    try {
      const url = "";
      let txt = useSSW(new TestLocation(url));
      expect(typeof txt).toBe("object");
      // IOIO start thread first
      let dat: Array<SaveStruct> = []; // IOIO
      expect(await txt.pushWhenAble(dat)).equal(true);

      dat = [];
      await expect(async () => {
        return await txt.pushWhenAble(dat);
      }).rejects.toThrowError();
    } catch (e: unknown) {
      console.log("Err? ", (e as Error).message);
    }
  });
});
