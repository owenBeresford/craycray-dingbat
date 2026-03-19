import type { SaveStruct } from "../types/Saveable";
import { PMQUE_TIMER, PMQUE_ATTEMPTS, MSG_THREAD } from "../Constants";
// import { WorkerHandle } from '../types/Workable';
import type { ShippingStruct, ActionEnum } from "../types/Messagable";
import type { BasicThreadable } from "../types/BasicThreadable";
import type { DistantStorable } from "../types/RemoteTypes";
import { transform2list, packMsg } from "./Storable";
import type { PromiseSucceed, PromiseReject } from "../types/promises";

type Timer = number;

/**
 * useMsgDistrib
 * a util to create this service
 
 * @public
 * @returns { DistantStorable}
 */
export function useMsgDistrib(): DistantStorable {
  return new MessageDistribution();
}

/**
 * MessageDistribution 
 * Class to marshal state between the net-worker thread, and this UI thread 
// Sends/recvs messages to the other worker thread that talks to the server
 *
 * @public
 */
export class MessageDistribution implements DistantStorable, BasicThreadable {
  private state: Array<SaveStruct>;
  //	private worker:WorkerHandle;
  private worker: Worker | null;
  private errMsgs: Array<string>;
  private running: boolean;
  protected goodSource: Readonly<string>;

  /**
   * constructor
   * Con'tor, mostly setting default values
 
   * @public
   * @returns {MessageDistribution}
   */
  public constructor() {
    this.running = true;
    this.errMsgs = [];
    this.worker = null;
    this.state = [];
    this.receipt.bind(this);
    this.goodSource = location.protocol + "//" + location.hostname + ":" + location.port;
  }

  public async forkThread(): Promise<boolean> {
    try {
      if (typeof global.Worker === "object") {
        this.worker = await new Worker(MSG_THREAD, { credentials: "same-origin", name: "NUDGE", type: "module" });
      }
      if (!this.worker) {
        throw Error("84564234234266 I'm sooo confuuuuzed error (see code) ");
      }

      this.worker.onmessage = this.receipt.bind(this);
      this.running = true;
      return true;
    } catch (ee) {
      console.warn("Thread: " + typeof ee + " " + ee, "\n", this.goodSource);
      return false;
    }
  }

  public reapThread(): boolean {
    if (!this.running) {
      console.warn("No Thread to kill");
      return false;
    }

    if (this.worker) {
      this.worker.terminate();
    }
    this.worker = null;
    this.running = false;
    return true;
  }

  protected receipt(ev: MessageEvent): void {
    console.log(
      "TEST recieved MSG to " + ev.origin + " from " + ev.source,
      ev.data.action,
      ev.data.data,
      "isolated",
      typeof crossOriginIsolated,
      crossOriginIsolated
    );
    if (ev.origin !== this.goodSource) {
      console.warn("Recv msg from un-authorised source " + ev.origin);
      return;
    }

    if (!ev.data.action) {
      console.warn("Received bad message; not processed ", ev.data);
      return;
    }
    let used = false;
    if (ev.data.action === ("load-payload" as ActionEnum)) {
      // maybe IOIO TODO a smarter/stronger type conversion.  I control sender and receiver
      this.state = transform2list(ev.data.data) as Array<SaveStruct>;
      if (this.state.length === 0) {
        console.warn("Loaded an empty dataset from worker thread.");
      }
      used = true;
    }
    if (ev.data.action === ("error-payload" as ActionEnum) && ev.data.data.length > 0) {
      this.errMsgs.push(ev.data.data as string);
      used = true;
    }
    if (ev.data.action === ("status-payload" as ActionEnum)) {
      console.log("TEST **Add more code here**\n[ STATUS REPORT ]=", ev.data.data);
      used = true;
    }
    if (!used) {
      console.warn("Received bad message; not processed ", ev.data);
    }
  }

  public poll(): Promise<boolean> {
    // has good odds of being positive
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      return good(this.running);
    });
  }

  public getErrors(): Array<string> {
    return [...this.errMsgs];
  }

  public saveState(dat: Array<SaveStruct>): Promise<boolean> {
    console.log("TEST sending MSG from the UI to the worker");
    if (!this.worker) {
      console.assert(this.worker != null, "986634563523, Worker thread should be active now");
      return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
        return bad(new Error("986634563523, Worker thread should be active now"));
      });
    }
    const LOCAL: ShippingStruct = packMsg("save-payload", dat);

    this.worker.postMessage(LOCAL);
    // promise for API compat; message has been forwarded to thread...
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      return good(true);
    });
  }

  public async loadState(): Promise<Array<SaveStruct>> {
    const LOCAL: ShippingStruct = packMsg("load-request", []);
    if (!this.worker) {
      console.assert(this.worker != null, "9456234352333, Worker thread should be active now");
      return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
        return bad(new Error("9456234352333, Worker thread should be active now"));
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const SELF = this;
    let attempts = 0;
    this.worker.postMessage(LOCAL);
    let hndl: Timer | null = null;
    const ATTEMPT = async (good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject): Promise<void> => {
      if (SELF.state.length) {
        if (hndl) {
          clearTimeout(hndl);
          hndl = null;
        }
        good(SELF.state);
      } else {
        attempts++;
        if (attempts > PMQUE_ATTEMPTS) {
          console.warn("No response from worker thread in " + PMQUE_ATTEMPTS + "*" + PMQUE_TIMER + "ms.  Aborting ");
          if (hndl) {
            clearTimeout(hndl);
            hndl = null;
          }
          bad(new Error("No response from worker thread in " + PMQUE_ATTEMPTS + "*" + PMQUE_TIMER + "ms.  Aborting "));
        } else {
          hndl = await +setTimeout(ATTEMPT, PMQUE_TIMER);
        }
      }
    };

    return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      hndl = +setTimeout(() => {
        return ATTEMPT(good, bad);
      }, PMQUE_TIMER);
    });
  }

  // saveProperty(nom:string, dat:string):boolean
  private saveProperty(): boolean {
    return false;
  }

  // loadProperty(nom:string):string
  private loadProperty(): string {
    return "Not impl";
  }
}
