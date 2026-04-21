/**
 * isMobile
 * Simple guess about current HW platform

 * @public
 * @returns {boolean}
 */
export function isMobile(): boolean {
  try {
    return window.matchMedia("(any-pointer:coarse)").matches ? true: false;
  } catch (e) {
    return true;
  }
}

/**
 * delay
 * a method for testing that pretends to be thread.sleep()

 * @param {number} ms
 * @public
 * @returns {Promise<void>}
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((good, bad) => setTimeout(good, ms));
}

/**
 * windowSize
 * Compute current window size

 * @see [https://stackoverflow.com/a/28241682 ]
 * @public
 * @returns {Array<number>}
 */
export function windowSize(): Array<number> {
  try {
    const width: number = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const height: number = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return [width, height];
  } catch (e: unknown) {
    return [1000, 1000];
  }
}

/**
 * rad2deg
 * As name says, convert angle unit type

 * @param {number} i
 * @public
 * @returns {number}
 */
export function rad2deg(i: number): number {
  return (i * 180) / Math.PI;
}

/**
 * deg2rad
 * As name says, convert angle unit type
// AFAIK, unused

 * @param {number} i
 * @public
 * @returns {number}
 */
export function deg2rad(i: number): number {
  throw new Error("Implement me!!!");
}

/**
 * wrap_getMyIP
 * Generate correct base URL for app
// until the https is deployed; this is safer as /

 * @public
 * @returns {string}
 */
export function wrap_getMyIP(): string {
  if (location.protocol === "https:") {
    return "https://" + location.host + "/";
  } else {
    return "/";
  }
}

/**
 * clearSelection
 * Clear user text selections, browser only

 * @see [https://stackoverflow.com/a/65445789]
 * @public
 * @returns {void}
 */
export function clearSelection(): void {
  if (typeof process === "object") {
    // Node doesnt have selection as no screen Object
    return;
  }

  if (typeof window.getSelection === "function") {
    // https://developer.mozilla.org/en-US/docs/Web/API/Selection
    const élément: Selection | null = window.getSelection();
    if (élément) {
      élément.removeAllRanges();
    }
  } else {
    console.error("Cannot use window.getSelection or document.selection; what browser is this? ");
  }
}

export type Fetch = (u: string, o: RequestInit) => Promise<Response>;
export type Fetchable = Fetch | null;

export interface SimpleResponse {
  body: object | string;
  headers: Headers;
  ok: boolean;
  status:number;
}

/**
 * runFetch
 * A simple wrapper current fetch()
 * IMPURE when I add logging
 * This behaves as a VERY SIMPLE middle-ware.
 * @param {string|URL} url
 * @param {boolean} trap ~ return null rather than an exception
 * @param {boolean} ldebug
 * @public
 * @throws {Error} = predictably, in case of network issue
 * @returns {Promise<SimpleResponse>}
 */
export async function runFetch(
  url: string,
  trap: boolean,
  extra:RequestInit | undefined
): Promise<SimpleResponse> {
  const f: Fetch = fetch;
  const returnBad = (trap: boolean, err: Error, stat:number): SimpleResponse => {
    if (trap) {
      return {
        body: "nothing",
        headers: {} as Headers,
        ok: false,
        status:stat,
      } as SimpleResponse;
    } else {
      throw err;
    }
  };
  if( typeof extra === "undefined" ) { extra={} as RequestInit; }

  try {
    const trans: Response = await f(url, ({
      credentials: "same-origin",
    } & extra ) as RequestInit) as Response;
    if (!trans.ok) {
      return returnBad(trap, new Error("ERROR getting asset " + url), trans.status);
    }
    if (trans.status === 404) {
      throw new Error("got HTTP 404");
    }

    let payload = "";
    if (
      ((trans.headers as Headers).get("content-type") as string)
        .toLowerCase()
        .startsWith("application/json")
    ) {
      payload = await trans.json();
    } else {
      payload = await trans.text();
    }

    return {
      body: payload,
      headers: trans.headers,
      ok: true,
      status:trans.status,
    } as SimpleResponse;
  } catch (e) {
    return returnBad(
      trap,
      new Error("ERROR getting asset " + url + " " + e.toString()),
     trans.status
    );
  }
}

