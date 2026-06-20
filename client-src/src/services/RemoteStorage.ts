import { transform2text, transform2list } from "./Storable";
import type { Storable } from "../types/Saveable";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { DistantStorable, RemoteConfig, APIResponseType } from "../../../common/types/RemoteTypes";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import { FETCH_TIMEOUT } from "../Constants";

type NullableTimeout = ReturnType<typeof globalThis.setTimeout> | undefined;

/**
 * RemoteStorage
 * Service to message API servers, dealing with possible disabled Wifi.
 * This should be all the networking stuff; but none of the scheduling stuff
 * This class has no use* function as createRemoteService is the use function

 * @public
 */
export class RemoteStorage implements Storable, DistantStorable {
  private url: string;
  private other: RemoteConfig;
  private cease: boolean;
  protected agent: any;

  /**
   * constructor
   *
   * @param {RemoteConfig} c
   * @public
   * @returns {RemoteStorage}
   */
  public constructor(c: RemoteConfig) {
    this.url = c.url;
    this.cease = false;
    this.agent = c.agent ?? globalThis.fetch.bind(globalThis);
    this.other = { ...c };
    delete this.other.url; 
  }

  public terminateSoon(): void {
    this.cease = true;
  }

  /**
 * poll
 * Test availability of remote API
  // try a OPTIONS or HEAD to see if available, short timeout
 * @see [https://davidwalsh.name/fetch-timeout]
 *
 * @public
 * @returns Promise<boolean>
 */
  public poll(): Promise<boolean> {
    let didTimeOut = false;
    const REQT: RequestInit = Object.assign(this.other, { method: "HEAD", body: null }) as RequestInit;
    const EEE = new Error("572357653453653 Request timed out for " + this.url);
    // EEE is named after the whine of over-used/ over-heated electrical equipment
   // const SELF = this;
    if (this.cease) {
      return Promise.resolve(false);
    }

    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let sortie: NullableTimeout = setTimeout(() => {
        didTimeOut = true;
        bad(EEE);
      }, FETCH_TIMEOUT);

      this.agent(this.url, REQT)
        .then((filet: Response): boolean => {
          clearTimeout(sortie);
          sortie = undefined;
          if (!didTimeOut) {
            good(Math.round(filet.status / 100) === 2);
          } else {
            bad(EEE);
          }
          return Math.round(filet.status / 100) === 2;
        })
        .catch((err: Error): void => {
          if (!didTimeOut) {
            bad(err);
          }
        })
        .finally((): void => {
          if (sortie) {
            clearTimeout(sortie);
          }
        });
    });
  }

  /**
   * saveState
   * Send current list of lists to the API server

   * @param {Array<SaveStruct>} goutte
   * @public
   * @returns {Promise<boolean>}
   */
  public saveState(goutte: Array<SaveStruct>): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      const REQT: RequestInit = Object.assign(this.other, {
        method: "POST",
        body: transform2text(goutte),
      }) as RequestInit;
      if (this.cease) {
        return good(false);
      }

      this.agent(this.url, REQT)
        .catch((err: Error) => {
          bad(err);
        })
        .then(async (goutte: Response | void): Promise<void> => {
          if (goutte) {
            if (!goutte.ok) {
              return bad(new Error("8456423234242 Server sent an error http status " + goutte.status));
            }
            let ret = "";
            if (goutte.body) {
              ret = goutte.body.toString();
            } else {
              ret = await goutte.text();
            }
            try {
              const filet: APIResponseType = JSON.parse(ret) as APIResponseType;
              if ("statusCode" in filet && parseInt(filet.statusCode, 10) > 299) {
                // this branch here should not be used; as all the responses have a proper
                // HTTP status code
                return bad(new Error("56678324536456 Server sent an error http status " + filet.statusCode));
              } else {
                return good(true);
              }
            } catch (ee: unknown) {
              // I can leak the stack trace, this is just a local API.
              return bad(ee as Error);
            }
          } else {
            return bad(new Error("223423423233434 Valid HTTP, but null response"));
          }
          // return "value for eslint.";
        });
    });
  }

  /**
   * loadState
   * Request current list of lists from remote API
  // call will happen just after page/ app open, so probably on network

   * @public
   * @returns {Promise<Array<SaveStruct>>}
   */
  public async loadState(): Promise<Array<SaveStruct>> {
    return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      const REQT: RequestInit = Object.assign(this.other, {
        method: "GET",
        body: null,
        mode: "no-cors",
        credentials: "same-origin",
      }) as RequestInit;
      if (this.cease) {
        return good([] as Array<SaveStruct>);
      }

      this.agent(this.url, REQT)
        .catch((err: unknown) => {
          console.warn("Failed to load state", (err as Error).message);
          return bad(new Error("8356456234352 No data was found"));
        })
        .then(async (filet: Response | void): Promise<void> => {
          if (!filet) {
            return bad(new Error("73456834535634 Valid HTTP, but got nothing back"));
          }
          if (!filet.ok) {
            return bad(new Error("776834534563522 Server sent an error http status " + filet.status));
          }

          let tmp = "";
          if (filet.body) {
            // this will happen in unit tests
            tmp = filet.body.toString();
          } else if (filet.json && (filet.headers.get("Content-Type" ) as string).startsWith("application/json") ) {
            tmp= await filet.json().then(function (text: string): void {
              good(transform2list(text));
            });
          } else if (filet.text) {
            // this will happen in browser stack
            tmp = await filet.text().then(function (text: string): void {
              good(transform2list(text));
            });
          }
       
         });
    });
  }

  // There is no value in the following API points at the mo
  // so made private
  public saveProperty(): boolean {
    // saveProperty(nom:string, val:string):boolean {
    return true;
  }

  public loadProperty(): string {
    // loadProperty(nom:string):string {
    return "no impl";
  }
}

