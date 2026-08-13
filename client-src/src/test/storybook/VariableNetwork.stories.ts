import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, waitFor, userEvent } from "storybook/test";
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED, TEST_LOCATION_URL } from "../../Constants";
import { NetworkedListService } from "../../services/NetworkedListService";
import { MessageDistribution, useMsgDistrib } from "../../services/MessageDistribution";
import { RegulatedNetworking } from "../../../../common/cURL";
import { RemoteStorage } from "../../services/RemoteStorage";
import { TestLocation } from "../MockLocation";

import { useLocal } from "../../services/LocalCopy";
import type { SimpleResponse } from "../../../../common/util";
import type { RemoteConfig } from "../../../../common/types/RemoteTypes";
import { delay } from "../../../../common/util";

const meta: Meta = {
  title: "Variable networking",
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta;
export default meta;

export const ReadDataWithVaryingNetwork: StoryObj = {
  render: () => ({
    template: `    
    <div>{{ result }}</div>`,
    data() {
      return { result: "?? Test not started" };
    },
    async mounted() {
      const frame: HTMLIFrameElement = document.getElementById("test-frame") as HTMLIFrameElement;
      try {
        await testBody();
        this.result = " ✔ All current async network tests passed ✔";
      } catch (err: unknown) {
        this.result = " ❌ A Test case failed: " + (err as Error).message;
      }
    },
  }),
};

async function testBody() {
  // simpliest data loading on this stack.

  let defaultResp: SimpleResponse = {
    body: "static response",
    headers: new Headers(),
    ok: false,
    //  @see https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
    status: 503,
  } as SimpleResponse;
  const NET: RegulatedNetworking = new RegulatedNetworking(defaultResp);

  const LOC = new TestLocation(TEST_LOCATION_URL + "/api/shared-state");
  let d3: RemoteConfig = {
    url: LOC.href,
    timeout: 500,
    headers: { "Content-Type": "application/json" },
    mode: "cors",
    method: "GET",
    credentials: "same-origin",
    agent: async (url: string, extra: RequestInit | undefined): Promise<SimpleResponse> => {
      return NET.runExecProcessOnUrl(url, extra);
    },
  } as RemoteConfig;

  let i1 = new RemoteStorage(d3);
  const OBJ1: NetworkedListService = new NetworkedListService(i1, useLocal(), () => {}, [
    Symbol("fing1"),
    Symbol("fing2"),
  ]);

  // action now starts.
  let d1 = new Date(),
    d2;
  expect(await OBJ1.poll()).toBe(true);
  d2 = new Date();
  console.log("#80 poll takes ", d2.getTime() - d1.getTime());

  expect(d2.getTime() - d1.getTime()).toBeLessThan(1000);
  d1 = new Date();
  expect(await OBJ1.loadAllLists()).toBe(true);
  d2 = new Date();
  console.log("#86 loaded data ", d2.getTime() - d1.getTime());
  expect(d2.getTime() - d1.getTime()).toBeLessThan(1500);
  expect(OBJ1.count()).toBe(4); // IOIO XXX The "empty list" is still present at the mo
  let tt = OBJ1.list();
  console.log("#90 downloaded list of data:", tt);
  expect(Array.isArray(tt)).toBe(true);
  // look at loaded values

  NET.setNetworkState(false);
  d1 = new Date();
  expect(await OBJ1.poll()).toBe(false);
  d2 = new Date();
  console.log("#97 poll after disconnect ", d2.getTime() - d1.getTime());
  expect(d2.getTime() - d1.getTime()).toBeLessThan(300);

  // empty list?
  d1 = new Date();
  // there is no network at this step, shown by the aboce poll()
  expect(await OBJ1.loadAllLists()).toBe(false);
  d2 = new Date();
  console.log("#106 loaded data ", d2.getTime() - d1.getTime());
  expect(d2.getTime() - d1.getTime()).toBeLessThan(1500);

  NET.setNetworkState(true);

  d1 = new Date();
  expect(await OBJ1.poll()).toBe(true);
  d2 = new Date();
  console.log("#114 poll after reconnect ", d2.getTime() - d1.getTime());
  expect(d2.getTime() - d1.getTime()).toBeLessThan(500);

  d1 = new Date();
  expect(await OBJ1.loadAllLists()).toBe(true);
  d2 = new Date();
  console.log("#120 loaded data ", d2.getTime() - d1.getTime());
  expect(d2.getTime() - d1.getTime()).toBeLessThan(1500);

  // somehow migrate network conmnection
  // IOIO XXX I think add behaviour if poll() retval isn't as expected
}
