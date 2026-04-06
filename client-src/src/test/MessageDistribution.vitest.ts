// import 'reflect-metadata';
// chatbot wanted this, its not actually needed, so I commented it :-)
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { MessageDistribution, useMsgDistrib } from "../services/MessageDistribution";
import type { DistantStorable } from "../types/RemoteTypes";
import type { BasicThreadable } from "../types/BasicThreadable";
import type { SaveStruct } from "../types/Saveable";

describe("test on MesageDistribution ", () => {
  it("Can use useMsgDistrib", () => {
    let txt = useMsgDistrib();
    expect(typeof txt).toBe("object");
    assertType<DistantStorable>(txt);
    expectTypeOf(txt).toExtend<DistantStorable>();
  });

  it("Can use MessageDistribution poll() + reap()", async () => {
    let obj: BasicThreadable = useMsgDistrib() as unknown as BasicThreadable;
    assertType<BasicThreadable>(obj);
    expect(await obj.poll()).toBe(true);
    expect(await obj.reapThread()).toBe(true);
    expect(await obj.poll()).toBe(false);
  });

  it("Can use MessageDistribution saveState()", async () => {
    let obj = useMsgDistrib();
    expect(obj instanceof MessageDistribution).toBe(true);

    const msg1 = {
      name: "empty list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 1,
      id: 1,

      list: [],
    } as SaveStruct;
    expect(await obj.saveState([msg1])).toBe(true);

    const msg2 = {
      name: "normal list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 5,
      id: 1,

      list: ["asda adasda asdad ", "brgdrgdbsdgd sb bsef ", "cwserfsf cjkihiklhj ", "dwerwer ", "etyiutyut eytuiyuiy"],
    } as SaveStruct;
    expect(await obj.saveState([msg2])).toBe(true);

    const msg3 = {
      name: "too long list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 2,
      id: 1,

      list: [
        "Werw ertert ert earterte erte rte erte ertert ertete erte ertet erter tete ertert ertert ertert et ".repeat(
          50
        ),
      ],
    } as SaveStruct;
    expect(await obj.saveState([msg3])).toBe(true);

    /*     // i can't get this to compile, so skipped.
  		const msg4= {
  name: "partial data (probably test condition only)",
  edited: (new Date()).getTime(),
  count: 1,
  id: 1,

  list: [],
		} as SaveStruct;
 		expect(await obj.saveState([msg4 ])).toBe(false);
*/

    expect(await obj.saveState([msg1, msg2, msg3])).toBe(true);
  });

  it("Can use MessageDistribution loadState()", async () => {
    let obj = useMsgDistrib();
    expect(obj instanceof MessageDistribution).toBe(true);

    const DAT = await obj.loadState();
    expect(typeof DAT).toBe("object");
    expectTypeOf(DAT).toExtend<Array<SaveStruct>>();
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  it("Can use MessageDistribution ", async () => {
    let obj: BasicThreadable = useMsgDistrib() as unknown as BasicThreadable;
    assertType<BasicThreadable>(obj);
    (obj as unknown as MessageDistribution).forkThread();

    expect(await obj.poll()).toBe(true);
    expect(await obj.reapThread()).toBe(true);
    expect(await obj.poll()).toBe(false);
  });

  it("Can use MessageDistribution saveState (2)", async () => {
    let obj = useMsgDistrib();
    expect(obj instanceof MessageDistribution).toBe(true);
    (obj as unknown as MessageDistribution).forkThread();

    const msg1 = {
      name: "empty list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 1,
      id: 1,

      list: [],
    } as SaveStruct;
    expect(await obj.saveState([msg1])).toBe(true);

    const msg2 = {
      name: "normal list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 5,
      id: 1,

      list: ["asda adasda asdad ", "brgdrgdbsdgd sb bsef ", "cwserfsf cjkihiklhj ", "dwerwer ", "etyiutyut eytuiyuiy"],
    } as SaveStruct;
    expect(await obj.saveState([msg2])).toBe(true);

    const msg3 = {
      name: "too long list",
      created: new Date().getTime(),
      edited: new Date().getTime(),
      count: 2,
      id: 1,

      list: [
        "Werw ertert ert earterte erte rte erte ertert ertete erte ertet erter tete ertert ertert ertert et ".repeat(
          50
        ),
      ],
    } as SaveStruct;
    expect(await obj.saveState([msg3])).toBe(true);

    /*     // i can't get this to compile, to skipped.
      const msg4= {
  name: "partial data (probably test condition only)",
  edited: (new Date()).getTime(),
  count: 1,
  id: 1,

  list: [],
    } as SaveStruct;
    expect(await obj.saveState([msg4 ])).toBe(false);
*/

    expect(await obj.saveState([msg1, msg2, msg3])).toBe(true);
  });

  it("Can use MessageDistribution loadState (2)", () => {
    let obj = useMsgDistrib();
    expect(obj instanceof MessageDistribution).toBe(true);
    (obj as unknown as MessageDistribution).forkThread();

    const DAT = await obj.loadState();
    expect(typeof DAT).toBe("object");
    expectTypeOf(DAT).toExtend<Array<SaveStruct>>();
  });
});
