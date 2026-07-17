import type { Meta, StoryObj } from "@storybook/vue3-vite";
// import { useArgs } from 'storybook/preview-api';
// import { setup,  } from "@storybook/vue3";
// import { provide } from 'vue';
import { expect, fn, within, waitFor, userEvent } from "storybook/test";

import { MessageDistribution, useMsgDistrib } from "../../services/MessageDistribution";
import type { DistantStorable } from "../../../../common/types/RemoteTypes";
import type { BasicThreadable } from "../../types/BasicThreadable";
import type { SaveStruct } from "../../../../common/types/SaveStruct";

function grp1() {
  let txt = useMsgDistrib();
  expect(typeof txt).toBe("object");
}

async function grp2() {
  let obj = useMsgDistrib();
  expect(obj instanceof MessageDistribution).toBe(true);
  expect((obj as unknown as MessageDistribution).forkThread()).toBe(true);

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
      "Werw ertert ert earterte erte rte erte ertert ertete erte ertet erter tete ertert ertert ertert et ".repeat(50),
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
}

async function grp3() {
  let obj = useMsgDistrib();
  expect(obj instanceof MessageDistribution).toBe(true);
  expect((obj as unknown as MessageDistribution).forkThread()).toBe(true);

  const DAT = await obj.loadState();
  expect(typeof DAT).toBe("object");
  //    expectTypeOf(DAT).toExtend<Array<SaveStruct>>();
}

async function grp4() {
  let obj = useMsgDistrib() as unknown as BasicThreadable;
  expect((obj as unknown as MessageDistribution).forkThread()).toBe(true);

  expect(await obj.poll()).toBe(true);
  expect(await obj.reapThread()).toBe(true);
  expect(await obj.poll()).toBe(false);
}

async function grp5() {
  let obj = useMsgDistrib();
  expect(obj instanceof MessageDistribution).toBe(true);
  expect((obj as unknown as MessageDistribution).forkThread()).toBe(true);

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
      "Werw ertert ert earterte erte rte erte ertert ertete erte ertet erter tete ertert ertert ertert et ".repeat(50),
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
}

async function grp6() {
  let obj = useMsgDistrib();
  expect(obj instanceof MessageDistribution).toBe(true);
  expect((obj as unknown as MessageDistribution).forkThread()).toBe(true);

  const DAT = await obj.loadState();
  expect(typeof DAT).toBe("object");
//  expectTypeOf(DAT).toExtend<Array<SaveStruct>>();
}

const meta: Meta = {
  title: "in browser test for MessageDistrubution",
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta;
export default meta;

export const runCommunication: StoryObj = {
  render: () => ({
    template: `<div>{{ result }}</div>`,
    data() {
      try {
        grp1();
        return { result: "✔ All sync tests passed" };
      } catch (er: unknown) {
        return { result: "❌ Test failed: " + (er as Error).message };
      }
    },
    async mounted() {
      try {
        await grp2();
        await grp3();
        await grp4();
        await grp5();
        await grp6();

        this.result += "<br /> ✔ All async tests passed";
      } catch (err: unknown) {
        this.result += "<br /> ❌ Test failed: " + (err as Error).message;
      }
    },
  }),
};
