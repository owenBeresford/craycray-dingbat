// on activate message
// copy payload to local var, its the thing to save
// call poll minutely until it works
// on success send a post to the remote server
// postMessage back to the UI
// also on access to remote server, look at data kept there, refresh local state

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#about_thread_safety
//
import type { RemoteStorage } from "../services/RemoteStorage";
// import type { BasicThreadable } from "../types/BasicThreadable";
import type { SaveStruct, DelayCallbackType, DataPipeline } from "../types/Saveable";
import type { PromiseSucceed, PromiseReject } from "../types/promises";
import { createRemoteService } from "../Constants";

/**
 * useSSW
 * a util to create this service
 
 * @param {Location} loc
 * @public
 * @returns {DataPipeline}
 */
export function useSSW(loc: Location): DataPipeline {
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
   * @return {SharedStateWorker}
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
   * initaite uploading data (async, phone maybe offnet)
 
   * @param {Array<SaveStruct>} json
   * @public
   * @return {Promise<boolean>}
   */
  public async pushWhenAble(json: Array<SaveStruct>): Promise<boolean> {
    const SELF = this;

    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      const ATTEMPT = async () => {
        let access = await SELF.conn.poll();
        if (access) {
          SELF.conn
            .saveState(json)
            .then((dat: any) => {
              console.log("save said " + dat);
              good(true);
            })
            .catch((err) => {
              console.error("Am connected to wifi; cannot save data ??\nImprove error handler here.");
              return bad(err);
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
   * @return {Promise<Array<SaveStruct>>}
   */
  public async pullWhenAble(): Promise<Array<SaveStruct>> {
    const SELF = this;

    return new Promise(async (good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject): void => {
      const ATTEMPT = async () => {
        let access = await SELF.conn.poll();
        if (access) {
          SELF.conn
            .loadState()
            .then((out: Array<SaveStruct>) => {
              return good(out);
            })
            .catch((err) => {
              return bad(err);
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

// these callbacks could be attached to the above object,
// I have currently made them seperate incase I need to expand to 10 implmentations
// this would be a good place to ba C++ "friend function"
// they should all match
//    function(state: DataPipeline): number 

export function linearDelay(state: DataPipeline): number {
  return state.currentDelay;
}

export function exponentialDelay(state: DataPipeline): number {
  state.currentDelay *= 1.3;
  return state.currentDelay;
}
