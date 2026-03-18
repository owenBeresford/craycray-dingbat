// It annoys me that I can't conditionally define this;
// Like... like I was using JS.
//declare var process: {
//  env: {
//    [key: string]: string;
//  }
//};

export function isMobile(): string {
  try {
    return window.matchMedia("(any-pointer:coarse)").matches ? "hide" : "";
  } catch (e) {
    return "";
  }
}

// https://stackoverflow.com/a/28241682
export function windowSize(): Array<number> {
  try {
    const width: number = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

    const height: number = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    return [width, height];
  } catch (e) {
    return [1000, 1000];
  }
}

export function rad2deg(i: number): number {
  return (i * 180) / Math.PI;
}

// AFAIK, unused
export function deg2rad(i: number): number {
  throw new Error("Implement me!!!");
}

// until the https is deployed; this is safer as /
export function wrap_getMyIP(): string {
  if (location.protocol === "https:") {
    return "https://" + location.host + "/";
  } else {
    return "/";
  }
}

// https://stackoverflow.com/a/65445789
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

export type GuessEvent = TouchEvent | KeyboardEvent | MouseEvent;
export type StrictArray = Array<string>;

let ID_OFFSET = 0;
// assuming only one copy of this file is compiled, this should lead to globally uniqiue ids
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
