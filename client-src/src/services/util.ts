// It annoys me that I can't conditionally define this;
// Like... like I was using JS.
//declare var process: {
//  env: {
//    [key: string]: string;
//  }
//};

/**
 * isMobile
 * Simple guess about current HW platform
 
 * @public
 * @returns {boolean}
 */
export function isMobile(): boolean {
  try {
    return window.matchMedia("(any-pointer:coarse)").matches ? false : true;
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
 
 * @see [https://stackoverflow.com/a/28241682]
 * @public
 * @returns {Array<number>}
 */
export function windowSize(): Array<number> {
  try {
    const width: number = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const height: number = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return [width, height];
  } catch (e) {
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
 * @returns {string]
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
    const tmp: Selection | null = window.getSelection();
    if (tmp) {
      tmp.removeAllRanges();
    }
  } else {
    console.error("Cannot use window.getSelection or document.selection; what browser is this? ");
  }
}

let ID_OFFSET = 0;
// assuming only one copy of this file is compiled, this should lead to globally unique ids
export function nextId(): string {
  ID_OFFSET++;
  return "obj" + ID_OFFSET;
}
export function resetId(): string {
  ID_OFFSET = 0;
  return "obj" + ID_OFFSET;
}

export function pollId(): string {
  return "obj" + ID_OFFSET;
}
