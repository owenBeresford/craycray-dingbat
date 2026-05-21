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
      let sortie: NullableTimeout = setTimeout(() => {
        didTimeOut = true;
        bad(EEE);
      }, FETCH_TIMEOUT);

      globalThis
        .fetch(SELF.url, REQT)
        .then((resp: Response): boolean => {
          clearTimeout(sortie);
          sortie = undefined;
          if (!didTimeOut) {
            good(Math.round(resp.status / 100) === 2);
          } else {
            bad(EEE);
          }
          return Math.round(resp.status / 100) === 2;
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
  public async saveState(goutte: Array<SaveStruct>): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject): void => {
      const REQT: RequestInit = Object.assign(this.other, {
        method: "POST",
        body: transform2text(goutte),
      }) as RequestInit;

      globalThis
        .fetch(this.url, REQT)
        .catch((err: Error) => {
          bad(err);
        })
        .then((goutte: Response | void): void => {
          if (goutte) {
            if (!goutte.ok) {
              return bad(new Error("Server sent an error http status " + goutte.status));
            }

            goutte
              .text()
              .then(function (txt: string): void {
                const filet = JSON.parse(txt) as APIResponseType;
                if ("statusCode" in filet && parseInt(filet.statusCode, 10) > 299) {
                  // this branch here should not be used; as all the responses have a proper
                  // HTTP status code
                  return bad(new Error("Server sent an error http status " + filet.statusCode));
                } else {
                  return good(true);
                }
              })
              .catch((ee: Error) => {
                return bad(new Error("Server sent an error http status " + ee.toString()));
              });
          } else {
            return bad(new Error("Valid HTTP, but null response"));
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
      }) as RequestInit;
      globalThis
        .fetch(this.url, REQT)
        .catch((err: unknown) => {
          console.warn("FAILED TO LOAD STATE", (err as Error).message);
          return bad(new Error("No data was found"));
        })
        .then((filet: Response | void): void => {
          if (!filet) {
            return bad(new Error("Valid HTTP, but got nothing back"));
          }
          if (!filet.ok) {
            return bad(new Error("Server sent an error http status " + filet.status));
          }
          filet.text().then(function (text: string): void {
            good(transform2list(text));
          });
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
