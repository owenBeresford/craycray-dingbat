import { PMQUE_TIMER, PMQUE_ATTEMPTS, MSG_THREAD, WORKER_NAME, MSG_THREAD_SB } from "../Constants";
import { AbstractSelfNameClass } from "../../../common/AbstractSelfNameClass";
// import { WorkerHandle } from '../types/Workable';

import { transform2list, packMsg } from "./Storable";
import { useLog } from "./LogStack";
import type { DistantStorable } from "../../../common/types/RemoteTypes";
import type { ShippingStruct, ActionEnum } from "../../../common/types/Messagable";
import type { BasicThreadable } from "../types/BasicThreadable";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import type { NullableSysTimerType } from "../../../common/types/Timer";
import type { MSG_RETURN_SAVE, MSG_RETURN_ERROR, SaveStruct } from "../../../common/types/SaveStruct";

/**
 * useMsgDistrib
 * a util to create this service

 * @public
 * @returns { DistantStorable}
 */
export function useMsgDistrib(): DistantStorable {
  return new MessageDistribution();
}

const LOG = useLog();

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
  /* An accessible variable to classes know their name after minification */
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
        let workerUrl = MSG_THREAD;
        if (globalThis.__STORYBOOK_MODULE_TEST__) {
          workerUrl = MSG_THREAD_SB;
        }
        // eslint says not to await on this...??
        this.worker = new Worker(workerUrl, { credentials: "same-origin", name: WORKER_NAME, type: "module" });
      }
      if (!this.worker) {
        throw Error("84564234234266 I'm sooo confuuuuzed error (see code) ");
      }

      this.worker.onmessage = this.receipt.bind(this);

      this.worker.onerror = (ev: ErrorEvent): void => {
        return this.errorTrap(ev);
      };
      if (this.worker.onmessageerror) {
        this.worker.onmessageerror = (ev: MessageEvent<any>): void => {
          return this.errorTrap(ev);
        };
      } else {
        this.worker.addEventListener("messageerror", (ev: MessageEvent<any>): void => {
          return this.errorTrap(ev);
        });
      }

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

  protected errorTrap(ev: MessageEvent<any> | ErrorEvent): void {
    this.errMsgs.push("Worker->onError handler (see console for more details) ");
    LOG.addRaw("Worker->onError handler (see console for more details) ", "debug");
    console.debug("error handler sees", ev);
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
    let expédition: ShippingStruct = {} as ShippingStruct;
    try {
      expédition = JSON.parse(ev.data) as ShippingStruct;
    } catch (e: unknown) {
      console.warn("93464234y3453 MessageDistribution Fail to received valid JSON?? ", (e as Error).message);
      return;
    }
    console.debug("BROWSER recieved MSG sent to " + WORKER_NAME, expédition.action, expédition.data);

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
      let tmp: MSG_RETURN_ERROR = expédition.data as unknown as MSG_RETURN_ERROR;
      this.errMsgs.push(tmp.error as string);
      used = true;
    }
    if (expédition.action === ("ret-payload" as ActionEnum) && expédition.data.length > 0) {
      this.state = transform2list(expédition.data) as Array<SaveStruct>;
      if (this.state.length === 0) {
        console.warn("Loaded an empty dataset from worker thread.");
        this.errMsgs.push("No lists found, processed an empty response from network!");
      }
      used = true;
    }
    if (expédition.action === ("save-payload" as ActionEnum)) {
      let tmp: MSG_RETURN_SAVE = expédition.data as unknown as MSG_RETURN_SAVE;
      if (tmp.wrote <= 100) {
        console.warn("Failed to writre very much data in the thread.", expédition);
        this.errMsgs.push("Previous save request failed (consult a dev, need server maintenance)");
      }
      used = true;
    }

    if (expédition.action === ("status-payload" as ActionEnum)) {
      this.errMsgs.push("Status msg reported " + expédition.data);
      used = true;
    }
    if (!used) {
      console.warn("Received bad message; not processed ", expédition, expédition.action);
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
      console.debug("TEST sending MSG from the UI to the worker");
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
    let poignée: NullableSysTimerType = undefined;
    const ATTEMPT = async (good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject): Promise<void> => {
      if (SELF.state.length) {
        if (poignée) {
          clearTimeout(poignée);
          poignée = undefined;
        }
        good(SELF.state);
      } else {
        tentatives++;
        if (tentatives > PMQUE_ATTEMPTS) {
          console.warn(
            "782345762347345 No response from worker thread in " +
              PMQUE_ATTEMPTS +
              "*" +
              PMQUE_TIMER +
              "ms.  Aborting ",
            this.worker
          );
          if (poignée) {
            clearTimeout(poignée);
            poignée = undefined;
          }
          bad(
            new Error(
              "234723427435 No response from worker thread in " + PMQUE_ATTEMPTS + "*" + PMQUE_TIMER + "ms.  Aborting "
            )
          );
        } else {
          poignée = setTimeout(() => {
            return ATTEMPT(good, bad);
          }, PMQUE_TIMER);
        }
      }
    };

    return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      poignée = setTimeout(() => {
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
