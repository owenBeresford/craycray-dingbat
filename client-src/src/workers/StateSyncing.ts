import { SaveStruct, DelayCallbackType, DataPipeline } from "../types/Saveable";
import { DistantStorable } from "../types/RemoteTypes";
import { ShippingStruct, ActionEnum } from "../types/Messagable";
import { PMQUE_TIMER, PMQUE_ATTEMPTS, MSG_DESTINATION, MSG_THREAD, createRemoteService } from "../Constants";
import { SharedStateWorker, exponentialDelay } from "./SharedStateWorker";
import { transform2text, transform2list, packMsg } from "../services/Storable";

export {};
declare const self: DedicatedWorkerGlobalScope;

if (global.Worker) {  
// I think this error report is too late, here.  BUT, if it is absent, still whine about it
  throw new Error("Runtime doesn't support Workers, FAIL, ABORT.");
}
const STATE:DataPipeline = new SharedStateWorker(createRemoteService(self.location), exponentialDelay );
// "self" refers to current thread, this should only be run after forking.
// this module is a Worker object, and runs as a second thread in the browser.
// The UI thread drives MessageDistribution
const goodSource:Readonly<string>=self.location.protocol+"//"+self.location.hostname+":"+self.location.port;
console.log("CODE under TEST started "+process.pid, goodSource);  
self.onmessage = function (ev:MessageEvent): void {
  console.log(
    "TEST2 received MSG to " + ev.origin + " from " + ev.source,
    ev.data.action,
    ev.data.data,
    "isolated",
    typeof crossOriginIsolated,
    crossOriginIsolated
  );
  if (ev.origin !== goodSource) {
      console.warn("Recv msg from un-authorised source "+ev.origin);
      return;
  }
  
  const payload: ShippingStruct = ev.data;
  let isDone = false;

  if (("save-payload" as ActionEnum) === payload.action) {
    STATE.pushWhenAble(transform2list(payload.data));
    isDone = true;
  }
  if (("load-request" as ActionEnum) === payload.action) {
    STATE.pullWhenAble().then((dat:Array<SaveStruct>) => {
      self.postMessage(transform2text(dat), undefined);
    });
    isDone = true;
  }
  if (("status-request" as ActionEnum) === payload.action) {
console.log("CODE under TEST got message ", payload);     
    self.postMessage(transform2text([{ status: "running" as ActionEnum  }]), undefined );
    // in other platforms, I would include session hashes, so these events can be graphed over a long timescale, 
    // I do not see this adds value here.
    isDone = true;
  }

  if (!isDone) {
    console.warn("WORKER: at the worker illegal action! " + payload.action);
    return;
  }
};

self.onmessageerror = (e:unknown) => {
  console.warn("WORKER: got bad message " + e);
};

console.log("CODE under TEST end module ", typeof self ); 

/* taken from snap/chromium/common/chromium/WasmTtsEngine/20260305.1/bindings_main.js
 loadWasmModuleToWorker: worker => new Promise(onFinishedLoading => {
    worker.onmessage = e => { }
  });
*/
