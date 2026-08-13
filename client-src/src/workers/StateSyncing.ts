import type { DataPipeline } from "../types/Saveable";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { ShippingStruct, ActionEnum } from "../../../common/types/Messagable";
import { WORKER_NAME, TEST_LOCATION_URL } from "../Constants";
import { useSSW } from "./SharedStateWorker";
import { transform2text, transform2list, packMsg } from "../services/Storable";
import { TestLocation } from "../test/MockLocation";
import type { MSG_RETURN_SAVE, MSG_RETURN_ERROR, MSG_RETURN_STATUS } from "../../../common/types/SaveStruct";

export {};
declare const self: DedicatedWorkerGlobalScope;

const STATE: DataPipeline = useSSW(new TestLocation(TEST_LOCATION_URL));
// "self" refers to current thread, this should only be run after forking.
// this module is a Worker object, and runs as a second thread in the browser.
// The UI thread drives MessageDistribution
const goodSource: Readonly<string> = self.location.protocol + "//" + self.location.hostname + ":" + self.location.port;
if (import.meta.env.VITEST) {
  console.log("CODE under TEST started " + process.pid, goodSource);
}

/**
 * self.onmessage
 * An event handler

 * @param {MessageEvent} ev
 * @protected
 * @returns {void}
 */
self.onmessage = async function (ev: MessageEvent): Promise<void> {
  console.log(
    "WORKER THREAD received MSG sent to ",
    ev,
    (ev.data as ShippingStruct).action,
    (ev.data as ShippingStruct).data,
    "isolated",
    "COI:",
    crossOriginIsolated
  );

  const payload: ShippingStruct = ev.data as ShippingStruct;
  let isDone = false;

  if (("save-payload" as ActionEnum) === payload.action) {
    try {
      await STATE.pushWhenAble(transform2list(payload.data));

      let tt2: ShippingStruct = packMsg("save-payload" as ActionEnum, {
        wrote: payload.data.length,
        duration: -1,
      } as MSG_RETURN_SAVE);
      self.postMessage(transform2text(tt2), undefined);
    } catch (e: unknown) {
      let tt2: ShippingStruct = packMsg("error-payload" as ActionEnum, {
        wrote: payload.data.length,
        error: (e as Error).message,
      } as MSG_RETURN_ERROR);
      self.postMessage(transform2text(tt2), undefined);
    }
    isDone = true;
  }
  if (("load-request" as ActionEnum) === payload.action) {
    try {
      let tt1: Array<SaveStruct> = await STATE.pullWhenAble();
      let tt2: ShippingStruct = packMsg("ret-payload" as ActionEnum, tt1);
      self.postMessage(transform2text(tt2), undefined);
    } catch (e: unknown) {
      let tt2: ShippingStruct = packMsg("error-payload" as ActionEnum, { wrote: 0, error: (e as Error).message } as MSG_RETURN_ERROR);
      self.postMessage(transform2text(tt2), undefined);
    }

    isDone = true;
  }
  if (("status-request" as ActionEnum) === payload.action) {
    if (import.meta.env.VITEST) {
      console.log("CODE under TEST got message ", JSON.stringify(payload));
    }
    let tt2: ShippingStruct = packMsg("status-payload" as ActionEnum, {
      duration: -1,
      status: "running" as ActionEnum,
    } as MSG_RETURN_STATUS);
    self.postMessage(transform2text(tt2), undefined);
    // in other platforms, I would include session hashes, so these events can be graphed over a long timescale,
    // I do not see this adds value here.
    isDone = true;
  }

  if (!isDone) {
    console.warn("WORKER: at the worker illegal action! " + payload.action);
    return;
  }
};

/**
 * self.onmessageerror
 * An event handler

 * @param {unknown} e - normal Error object, but TS states it must be unknoewn, guess compat with VB3 or something #leSigh.
 * @protected
 * @returns {void}
 */
self.onmessageerror = (e: unknown): void => {
  console.warn("WORKER: got bad message ", e as Error);
};

if (import.meta.env.VITEST) {
  console.log("CODE under TEST end module ", typeof self, process.pid);
}

/* taken from snap/chromium/common/chromium/WasmTtsEngine/20260305.1/bindings_main.js
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
    worker.onmessage = e => { }
  });
*/
