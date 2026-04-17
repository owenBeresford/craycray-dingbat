// on activate message
// copy payload to local var, its the thing to save
// call poll minutely until it works
// on success send a post to the remote server
// postMessage back to the UI
// also on access to remote server, look at data kept there, refresh local state

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#about_thread_safety
//
import type { RemoteStorage } from "../services/RemoteStorage";
import type {  DelayCallbackType, DataPipeline } from "../types/Saveable";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { createRemoteService } from "../Constants";
// import type { BasicThreadable } from "../types/BasicThreadable";

/**
 * useSSW
 * A util to create this service
 
 * @param {Location} loc
 * @public
 * @returns {DataPipeline}
 */
export function useSSW(loc: Location | WorkerLocation): DataPipeline {
  return new SharedStateWorker(createRemoteService(loc), exponentialDelay);
}

/**
 * SharedStateWorker
 * This is broadcast logic to push data to the server
 *
 * @public
 */
export class SharedStateWorker implements DataPipeline {
  private conn: RemoteStorage;
  public currentDelay: number;
  protected delay: DelayCallbackType;

  /**
   * constructor
   * Plain con'tor, nothing noteworthy
 
   * @param {RemoteStorage} rs
   * @param {DelayCallbackType} delay
   * @public
   * @returns {SharedStateWorker}
   */
  public constructor(rs: RemoteStorage, delay: DelayCallbackType) {
    this.conn = rs;
    this.delay = delay;
    this.currentDelay = 30_000;
    // there won't be vast numbers of this class made
    this.pushWhenAble.bind(this);
  }

  /**
   * pushWhenAble
   * initiate uploading data (async, phone maybe offnet)
 
   * @param {Array<SaveStruct>} json
   * @public
   * @returns {Promise<boolean>}
   */
  public async pushWhenAble(json: Array<SaveStruct>): Promise<boolean> {
    const SELF = this;

    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const ATTEMPT = async (): Promise<void> => {
        let access = await SELF.conn.poll();
        if (access) {
          SELF.conn
            .saveState(json)
            .then((dat: boolean): boolean => {
              if (_LOGGING_) {
                console.log("save said " + dat);
              }
              good(true);
              return true;
            })
            .catch((err: unknown): void => {
              console.error("Am connected to wifi; cannot save data ??\nImprove error handler here.");
              bad(err as Error);
            });
        } else {
          // I think I need to replace this section
          setTimeout(ATTEMPT, SELF.delay(SELF));
        }
      };
      await ATTEMPT();
    });
  }

  /**
   * pullWhenAble
   * initaite downloading data (async, phone maybe offnet)
 
   * @public
   * @returns {Promise<Array<SaveStruct>>}
   */
  public async pullWhenAble(): Promise<Array<SaveStruct>> {
    const SELF = this;

    return new Promise(async (good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      const ATTEMPT = async (): Promise<void> => {
        let access = await SELF.conn.poll();
        if (access) {
          SELF.conn
            .loadState()
            .then((out: Array<SaveStruct>) => {
              return good(out);
            })
            .catch((err: unknown) => {
              // #leSigh
              return bad(err as Error);
            });
        } else {
          // I think I need to replace this section
          setTimeout(ATTEMPT, SELF.delay(SELF));
        }
      };
      await ATTEMPT();
    });
  }
}

/**
 * linearDelay
 * A separated function to compute the delay duration, which is used for networking retries.
 * I have currently made them separate in-case I need to expand to 10 implementations.
 * This would be a good place to be a C++ "friend function".
 
 * @param {DataPipeline} state
 * @public
 * @returns {number}
 */
export function linearDelay(state: DataPipeline): number {
  return state.currentDelay;
}

/**
 * exponentialDelay
 * A separated function to compute the delay duration, which is used for networking retries
 * I have currently made them separate in-case I need to expand to 10 implementations.
 * This would be a good place to be a C++ "friend function".
 
 * @param {DataPipeline} state
 * @public
 * @returns {number}
 */
export function exponentialDelay(state: DataPipeline): number {
  state.currentDelay *= 1.3;
  return state.currentDelay;
}
