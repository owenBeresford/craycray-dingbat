// It annoys me that I can't conditionally define this;
// Like... like I was using JS.
//declare var process: {
//  env: {
//    [key: string]: string;
//  }
//};

/**
 * extractId
 * Util to extract a List Id from an URL. 
 * according to the manuals I found; doing it like this is the approved solution.
 * this type whoffle is because someone said this could be an array. #leSigh
 * #TODO Maybe should live in util
 
 * @param {string | string[] | null} src
 * @public
 * @returns {number}
 */
export function extractId(src: string | string[] | null): number {
  if (src === null) {
    throw new Error("Illegal shopping list id " + src);
  }
  let cp: number;

  if (Array.isArray(src)) {
    cp = parseInt(src[0], 10);
  } else {
    cp = parseInt(src, 10);
  }
  if (cp < 1) {
    throw new Error("Illegal shopping list id " + JSON.stringify(src));
  }
  return cp - 1;
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
