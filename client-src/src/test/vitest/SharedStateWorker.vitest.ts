// import 'reflect-metadata';
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { SharedStateWorker, useSSW } from "../../workers/SharedStateWorker";
import type { SaveStruct, DelayCallbackType, DataPipeline } from "../../types/Saveable";
import { TestLocation } from "../MockLocation";

describe("test on SharedStateWorker ", () => {
  it("Can create SharedStateWorker ", () => {
    let txt = useSSW(location);
    expect(typeof txt).toBe("object");

    assertType<DataPipeline>(txt);
    expectTypeOf(txt).toExtend<DataPipeline>();
  });

  it("Can use SharedStateWorker ", async () => {
    let txt = useSSW(location);
    expect(typeof txt).toBe("object");

    let dat = [
      {
        name: "list1 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 1,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
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
    // should fail as count of items is wrong
    expect(await txt.pushWhenAble(dat)).equal(true);
  });

  it("Can use SharedStateWorker ", async () => {
    let txt = useSSW(location);
    expect(typeof txt).toBe("object");

    let dat = [
      {
        name: "list1 ",
        created: new Date().getTime(),
        edited: new Date().getTime(),
        count: 3,
        id: 1,
        list: ["thing 1", "thing 2", "thing 3"],
      },
    ];
    expect(await txt.pullWhenAble()).equal(dat);
  });

  it("Can use SharedStateWorker ", async () => {
    const url = "";
    let txt = useSSW(new TestLocation(url));
    expect(typeof txt).toBe("object");
    // IOIO start thread first
    let dat = []; // IOIO
    expect(await txt.pushWhenAble(dat)).equal(true);

    dat = [];
    expect(await txt.pushWhenAble(dat)).equal(true);
  });
});
