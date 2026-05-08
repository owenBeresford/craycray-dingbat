import type { DataPipeline } from "../types/Saveable";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { ShippingStruct, ActionEnum } from "../../../common/types/Messagable";
// import type { DistantStorable } from "../types/RemoteTypes";
import { WORKER_NAME } from "../Constants";
// import { createRemoteService } from "../Constants";
import { useSSW } from "./SharedStateWorker";
import { transform2text, transform2list, packMsg } from "../services/Storable";


export {};
declare const self: DedicatedWorkerGlobalScope;

//if (! globalThis.Worker ) {
  // I think this error report is too late, here.  BUT, if it is absent, still whine about it
//  throw new Error("Runtime doesn't support Workers, FAIL, ABORT.");
//}

const STATE: DataPipeline = useSSW(self.location);
// "self" refers to current thread, this should only be run after forking.
// this module is a Worker object, and runs as a second thread in the browser.
// The UI thread drives MessageDistribution
const goodSource: Readonly<string> = self.location.protocol + "//" + self.location.hostname + ":" + self.location.port;
if (_LOGGING_) { // test only logging
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
    "WORKER THREAD received MSG sent to " + ev.srcElement.name,
     (ev.data as ShippingStruct).action,
    (ev.data as ShippingStruct).data,
    "isolated",
    "COI:", crossOriginIsolated,
   );
 
  if(ev.srcElement.name !==WORKER_NAME ) {
    console.warn("Recv msg from un-authorised source " + ev.origin  );
    return;
  }

  const payload: ShippingStruct = ev.data as ShippingStruct;
  let isDone = false;

  if (("save-payload" as ActionEnum) === payload.action) {
    await STATE.pushWhenAble( transform2list(payload.data));
    let tt2: ShippingStruct = packMsg("save-payload", {wrote:payload.data.length, duration:-1}); 
    self.postMessage( transform2text(tt2), undefined);
    isDone = true;
  }
  if (("load-request" as ActionEnum) === payload.action) {
    let tt1: Array<SaveStruct> = await STATE.pullWhenAble();
    let tt2: ShippingStruct = packMsg("ret-payload", tt1); 
    self.postMessage( transform2text(tt2), undefined);
    isDone = true;
  }
  if (("status-request" as ActionEnum) === payload.action) {
    if (_LOGGING_) {
      console.log("CODE under TEST got message ", JSON.stringify(payload));
    }
    self.postMessage(transform2text([{ status: "running" as ActionEnum }]), undefined);
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
if (_LOGGING_) {
  console.log("CODE under TEST end module ", typeof self);
}
/* taken from snap/chromium/common/chromium/WasmTtsEngine/20260305.1/bindings_main.js
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
    worker.onmessage = e => { }
  });
*/
