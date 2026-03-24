import { transform2text, transform2list } from "./Storable";
import type { SaveStruct, Storable } from "../types/Saveable";
import type { DistantStorable, RemoteConfig } from "../types/RemoteTypes";
import type { PromiseSucceed, PromiseReject } from "../types/promises";
import { FETCH_TIMEOUT } from '../Constants';
// import type  { Request as RequestType, Response as ResponseType } from 'node-fetch';

type NullableTimeout = ReturnType<typeof global.setTimeout> | undefined;

/**
 * RemoteStorage
 * Service to message API servers, dealing with possible disabled Wifi.
 * This should be all the networking stuff; but none of the scheduling stuff
 
 * @public
 */
export class RemoteStorage implements Storable, DistantStorable {
  private url: string;
  private other: RemoteConfig;

  /**
   * constructor
   * 
   * @param {RemoteConfig} c
   * @public
   * @returns {RemoteStorage} 
   */
  public constructor(c: RemoteConfig) {
    this.url = c.url;
    this.other = { ...c };
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
  public async poll(): Promise<boolean> {
    let didTimeOut = false;
    const REQT: RequestInit = Object.assign(this.other, { method: "HEAD", body: null }) as RequestInit;
    const EEE = new Error("Request timed out");
    // EEE is named after the whine of over-used/ over-heated electrical equipment
    const SELF = this;

    return new Promise(async (good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let timeout: NullableTimeout = setTimeout(() => {
        didTimeOut = true;
        bad(EEE);
      }, FETCH_TIMEOUT);

      global
        .fetch(SELF.url, REQT)
        .then((resp: Response): void => {
          clearTimeout(timeout);
          timeout = undefined;
          if (!didTimeOut) {
            good(resp.status % 100 === 2);
          } else {
            bad(EEE);
          }
        })
        .catch((err: Error): void => {
          if (!didTimeOut) {
            bad(err);
          }
        })
        .finally((): void => {
          if (timeout) {
            clearTimeout(timeout);
          }
        });
    });
  }

  /**
   * saveState
   * Send current list of lists to the API server
 
   * @param {Array<SaveStruct>} dat
   * @public
   * @returns {Promise<boolean>}
   */
  public async saveState(dat: Array<SaveStruct>): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const REQT: RequestInit = Object.assign(this.other, { method: "POST", body: transform2text(dat) }) as RequestInit;

      global
        .fetch(this.url, REQT)
        .catch((err: Error) => {
          bad(err);
        })
        .then((dat: Response | void) => {
          if (dat) {
            // this section is just JS
            if (!dat.ok) {
              return bad(new Error("Server sent an error http status " + dat.status));
            }

            dat
              .text()
              .then(function (txt: string) {
                const txt1 = JSON.parse(txt);
                if ("statusCode" in txt1 && txt1.statusCode > 299) {
                  // this branch here should not be used; as all the responses have a proper
                  // HTTP status code
                  return bad(new Error("Server sent an error http status " + txt1.statusCode));
                } else {
                  return good(true);
                }
              })
              .catch((ee: Error) => {
                return bad(new Error("Server sent an error http status " + ee));
              });
          } else {
            bad(new Error("Valid HTTP, but null response"));
          }
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
      const REQT: RequestInit = Object.assign(this.other, { method: "GET", body: null }) as RequestInit;
      global
        .fetch(this.url, REQT)
        .catch((err: Error) => {
          console.warn("FAILED TO LOAD STATE", err);
          return bad(new Error("No data was found"));
        })
        .then((dat: Response | void) => {
          if (!dat) {
            return bad(new Error("Valid HTTP, but got nothing back"));
          }
          if (!dat.ok) {
            return bad(new Error("Server sent an error http status " + dat.status));
          }
          return dat.text().then(function (text: string) {
            good(transform2list(text));
          });
        });
    });
  }

	// There is no value in the following API points at the mo
	// so made private
  saveProperty(): boolean {
    // saveProperty(nom:string, val:string):boolean {
    return true;
  }

  loadProperty(): string {
    // loadProperty(nom:string):string {
    return "no impl";
  }

}

