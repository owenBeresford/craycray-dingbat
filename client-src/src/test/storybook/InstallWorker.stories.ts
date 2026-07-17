import type { Meta, StoryObj } from "@storybook/vue3-vite";
// import { useArgs } from 'storybook/preview-api';
// import { setup,  } from "@storybook/vue3";
// import { provide } from 'vue';
import { expect, fn, within, waitFor, userEvent } from "storybook/test";

import { CacheWrapper, useCacheWrapper } from "../../workers/InstallWorker";
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED, TEST_LOCATION_URL } from "../../Constants";

function grp1() {
  // I think useless here
  let txt = useCacheWrapper();
  expect(typeof txt).toBe("object");
  //    assertType<Function>(CacheWrapper);
  //    expectTypeOf(txt).toExtend<CacheWrapper>();
}

async function grp2() {
  let txt = useCacheWrapper();
  let c = await globalThis.caches.open(APP_NAME + "_" + APP_VERSION);
  let l = await c.keys();
  l.forEach(async (a: Request, b: number) => {
    await c.delete(a.url);
  });
  window.localStorage.removeItem(INSTALLED);

  expect(await CacheWrapper.isInstalled()).toBe(false);
  expect(window.localStorage.getItem(INSTALLED)).toBe(null);
  expect(txt.check()).toBe(false);

  txt.install();
  let list = await c.keys();
  expect(Array.isArray(list)).toBe(true); // "Found installed asset files";
  expect(list.length).toBe(5); // "right number of asset files";
  expect(txt.check()).toBe(true);
  expect(window.localStorage.getItem(INSTALLED)).toBe("1");
}

const meta: Meta = {
  title: "in browser test for Installworkee",
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta;
export default meta;

export const runInstallationDESTRUCTIVELY: StoryObj = {
  render: () => ({
    template: `<iframe
          id="test-frame"
          src="${TEST_LOCATION_URL}"
          style="width:100%; height:600px; border:3px solid #ccc;"
        ></iframe>
    
    
    <div>{{ result }}</div>`,
    data() {
      try {
        grp1();
        return { result: "✔ All sync tests passed" };
      } catch (er: unknown) {
        return { result: "❌ Test failed: " + (er as Error).message };
      }
    },
    async mounted() {
      const frame: HTMLIFrameElement = document.getElementById("test-frame") as HTMLIFrameElement;
      try {
        const ops = frame.contentWindow;
        await grp2();

        this.result += "<br /> ✔ All async tests passed";
      } catch (err: unknown) {
        this.result += "<br /> ❌ Test failed: " + (err as Error).message;
      }
    },
  }),
};
