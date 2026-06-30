import type { SaveStruct } from "../../../common/types/SaveStruct";
import { PMQUE_TIMER, PMQUE_ATTEMPTS, MSG_THREAD, WORKER_NAME } from "../Constants";
import { AbstractSelfNameClass } from "../../../common/AbstractSelfNameClass";
// import { WorkerHandle } from '../types/Workable';
import type { ShippingStruct, ActionEnum } from "../../../common/types/Messagable";
import type { BasicThreadable } from "../types/BasicThreadable";
import type { DistantStorable } from "../../../common/types/RemoteTypes";
import { transform2list, packMsg } from "./Storable";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";

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
 * This class is chatty, as it is highly likely to slow the UI in a fashion I cannot prohibit.

 * @public
 */
export class MessageDistribution extends AbstractSelfNameClass implements DistantStorable, BasicThreadable {
  private state: Array<SaveStruct>;
  //	private worker:WorkerHandle;
  private worker: Worker | null;
  private errMsgs: Array<string>;
  private running: boolean;
  protected goodSource: Readonly<string>;
  protected static _debugSymbol = Symbol("MessageDistribution");

  /**
   * constructor
   * Con'tor, mostly setting default values

   * @public
   * @returns {MessageDistribution}
   */
  public constructor() {
    super();
    this.running = true;
    this.errMsgs = [];
    this.worker = null;
    this.state = [];
    this.receipt.bind(this);
    this.goodSource = location.protocol + "//" + location.hostname + ":" + location.port;
  }

  /**
   * forkThread
   * Attempt to fork a new thread.

   * @throws Exception - if not in HTTPS, so no Worker allowed
   * @public
   * @returns {boolean}
   */
  public forkThread(): boolean {
    try {
      if (typeof globalThis.Worker === "function") {
        // eslint says not to await on this...??
        this.worker = new Worker(MSG_THREAD, { credentials: "same-origin", name: WORKER_NAME, type: "module" });
      }
      if (!this.worker) {
        throw Error("84564234234266 I'm sooo confuuuuzed error (see code) ");
      }

      this.worker.onmessage = this.receipt.bind(this);
      this.running = true;
      return true;
    } catch (ee: unknown) {
      console.warn("Thread: " + typeof ee + " " + (ee as Error).message, "\n", this.goodSource);
      return false;
    }
  }

  /**
   * reapThread
   * Cautiously terminates any threads

   * @public
   * @returns {boolean}
   */
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

  /**
   * receipt
   * A typical JS on* event handler, for MSG from the other thread/ worker

   * WARN: is chatty.
   * @param {MessageEvent} ev
   * @public
   * @returns {void}
   */
  protected receipt(ev: MessageEvent): void {
    const expédition: ShippingStruct = ev.data as ShippingStruct;
    console.debug(
      "BROWSER recieved MSG sent to " + WORKER_NAME,
      expédition.action,
      expédition.data,
      "isolated",
      typeof crossOriginIsolated,
      crossOriginIsolated
    );
    if (ev.origin !== WORKER_NAME) {
      // if (ev.origin !== this.goodSource) {
      console.warn("Recv msg from un-authorised source " + ev.origin);
      return;
    }

    if (!expédition.action) {
      console.warn("Received bad message; not processed ", expédition);
      return;
    }
    let used = false;
    if (expédition.action === ("load-payload" as ActionEnum)) {
      // maybe IOIO TODO a smarter/stronger type conversion.  I control sender and receiver
      this.state = transform2list(expédition.data) as Array<SaveStruct>;
      if (this.state.length === 0) {
        this.errMsgs.push("No lists founds, processed an empty response from network!");
        console.warn("Loaded an empty dataset from worker thread.");
      }
      used = true;
    }
    if (expédition.action === ("error-payload" as ActionEnum) && expédition.data.length > 0) {
      this.errMsgs.push(expédition.data as string);
      used = true;
    }
    if (expédition.action === ("ret-payload" as ActionEnum) && expédition.data.length > 0) {
      this.state = transform2list(expédition.data) as Array<SaveStruct>;
      if (this.state.length === 0) {
        console.warn("Loaded an empty dataset from worker thread.");
        this.errMsgs.push("No lists founds, processed an empty response from network!");
      }
      used = true;
    }

    if (expédition.action === ("status-payload" as ActionEnum)) {
      console.warn("TEST **Add more code here**\n[ STATUS REPORT ]=", expédition.data);
      used = true;
    }
    if (!used) {
      console.warn("Received bad message; not processed ", expédition);
    }
  }

  /**
   * poll
   * Replies if connected to a running server.
   * has good odds of being positive

   * @public
   * @returns {Promise<boolean>}
   */
  public poll(): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      return good(this.running);
    });
  }

  /**
   * getErrors
   * Return a copy of any errors

   * @public
   * @returns {Array<string> }
   */
  public getErrors(): Array<string> {
    return [...this.errMsgs];
  }

  /**
   * saveState
   * Push current state to thead so can be uploaded to server at a point.

   * @param {Array<SaveStruct>} dat
   * @public
   * @returns {Promise<boolean>}
   */
  public saveState(dat: Array<SaveStruct>): Promise<boolean> {
    if (import.meta.env.VITEST) {
      console.log("TEST sending MSG from the UI to the worker");
    }
    if (!this.worker) {
      console.assert(this.worker != null, "986634563523, Worker thread should be active now");
      return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
        return bad(new Error("986634563523, Worker thread should be active now"));
      });
    }
    const expédition: ShippingStruct = packMsg("save-payload", dat);
    this.worker.postMessage(expédition, undefined);
    // promise for API compat; message has been forwarded to thread...
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      return good(true);
    });
  }

  /**
 * loadState
 * Request state from server via thread.

 * @public
 * @returns {Promise<Array<SaveStruct>> }
 */
  public async loadState(): Promise<Array<SaveStruct>> {
    const expédition: ShippingStruct = packMsg("load-request", []);
    if (!this.worker) {
      console.assert(this.worker != null, "9456234352333, Worker thread should be active now");
      return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
        return bad(new Error("9456234352333, Worker thread should be active now"));
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const SELF = this;
    let tentatives = 0;
    this.worker.postMessage(expédition, undefined);
    let poignée: Timer | null = null;
    const ATTEMPT = async (good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject): Promise<void> => {
      if (SELF.state.length) {
        if (poignée) {
          clearTimeout(poignée);
          poignée = null;
        }
        good(SELF.state);
      } else {
        tentatives++;
        if (tentatives > PMQUE_ATTEMPTS) {
          console.warn(
            "782345762347345 No response from worker thread in " + PMQUE_ATTEMPTS + "*" + PMQUE_TIMER + "ms.  Aborting "
          );
          if (poignée) {
            clearTimeout(poignée);
            poignée = null;
          }
          bad(
            new Error(
              "234723427435 No response from worker thread in " + PMQUE_ATTEMPTS + "*" + PMQUE_TIMER + "ms.  Aborting "
            )
          );
        } else {
          poignée = +setTimeout(() => {
            return ATTEMPT(good, bad);
          }, PMQUE_TIMER);
        }
      }
    };

    return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      poignée = +setTimeout(() => {
        ATTEMPT(good, bad);
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
