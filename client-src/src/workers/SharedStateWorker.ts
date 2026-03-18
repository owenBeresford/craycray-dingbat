// on activate message
// copy payload to local var, its the thing to save
// call poll minutely until it works
// on success send a post to the remote server
// postMessage back to the UI
// also on access to remote server, look at data kept there, refresh local state

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#about_thread_safety
//
import { RemoteStorage } from "../services/RemoteStorage";
import { BasicThreadable } from "../types/BasicThreadable";
import { SaveStruct, DelayCallbackType, DataPipeline } from "../types/Saveable";
import type { PromiseSucceed, PromiseReject } from '../types/promises'; 
import { createRemoteService } from '../Constants';

export function useSSW(loc:Location ):DataPipeline {
  return new SharedStateWorker(createRemoteService(loc), exponentialDelay );
}

// this is broadcast logic to push data to the server 
export class SharedStateWorker implements DataPipeline {
  private conn: RemoteStorage;
  public currentDelay: number;
  protected delay:DelayCallbackType;

  constructor(rs: RemoteStorage, delay: DelayCallbackType) {
    this.conn = rs;
    this.delay = delay;
    this.currentDelay = 30000;
    // there won't be vast numbers of this class made
    this.pushWhenAble.bind(this);
  }

  async pushWhenAble(json: Array<SaveStruct>): Promise<boolean> {
    const SELF = this;

    return new Promise(async (good:PromiseSucceed<boolean>, bad:PromiseReject) => {
      const ATTEMPT = async () => {
        let access = await SELF.conn.poll();
        if (access) {
          SELF.conn
            .saveState(json)
            .then((dat) => {
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

  async pullWhenAble(): Promise<Array<SaveStruct>> {
    const SELF = this;

    return  new Promise( async (good:PromiseSucceed<Array<SaveStruct>>, bad:PromiseReject) => {
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

export function linearDelay(state: DataPipeline): number {
  return state.currentDelay;
}

export function exponentialDelay(state: DataPipeline): number {
  state.currentDelay *= 1.3;
  return state.currentDelay;
}
