import type { SaveStruct } from './types/SaveStruct';
import { toHex as monkeyPatch_toHex } from '../server-src/node_modules/es-arraybuffer-base64/Uint8Array.prototype.toHex';
import type { PromiseSucceed, PromiseReject } from "./types/promises";

/**
 * isMobile
 * Simple guess about current HW platform

 * @public
 * @returns {boolean}
 */
export function isMobile(): boolean {
  try {
    return globalThis.matchMedia("(any-pointer:coarse)").matches ? true: false;
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
  if (globalThis.location.protocol === "https:") {
    return "https://" + globalThis.location.host + "/";
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

  if (typeof globalThis.getSelection === "function") {
    // https://developer.mozilla.org/en-US/docs/Web/API/Selection
    const élément: Selection | null = globalThis.getSelection();
    if (élément) {
      élément.removeAllRanges();
    }
  } else {
    console.error("Cannot use window.getSelection or document.selection; what browser is this? ");
  }
}

if(!( globalThis.crypto || globalThis.crypto.subtle) ) {
  throw new Error("JS runtime doesn't allow access to crypt/ hash functions.  Cannot proceed");
}

if(!('toHex' in Uint8Array.prototype)) {
  Uint8Array.prototype.toHex=monkeyPatch_toHex;
}

/**
 * hashState
 * Create a predictable hash of blob of data to support idempotency and duplicate collapse.
   // this is 1handed hashing, not cmp capacity

 * @param {Array<SaveStruct>} dat
 * @param {Readonly<string>="SHA-256"} hash - the algorithm to apply, in 'spec naming notation'
 * @public
 * @returns {string} - hex encoded
 */
export async function hashState(dat:Array<SaveStruct>, hash:Readonly<string>="SHA-256"):Promise<string>{
  let step1:string= JSON.stringify(dat);
      //step2:  this step should be obsolete/ irrelevant, but is critical failure if absent
  let step2 = new TextEncoder().encode(step1);
  let step3 = await globalThis.crypto.subtle.digest(hash, step2);
  return new Uint8Array(step3).toHex();
}


export type Fetch = (u: string, o: RequestInit) => Promise<Response>;
export type Fetchable = Fetch | null;

export interface SimpleResponse {
  body: object | string;
  headers: Headers;
  ok: boolean;
  status:number;
}

export interface FileExecFlags {
  cwd?:string|URL; 
  env?:Object;
  encoding?:string ;
  timeout?:number ; // ms
  maxBuffer?:number ;
  killSignal?:string|number ;
  uid?:number; 
  gid?:number;
  windowsHide?:boolean ;
  windowsVerbatimArguments?:boolean ;
  shell?:boolean|string ;
  signal?:AbortSignal;
};

interface RunExecReturn {
    reqt:Record<string, string>;
    resp:Record<string, string>;
};


// https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback
export async function runExecProcessOnUrl(
    url: string,
    extra:RequestInit | undefined
        ):Promise<SimpleResponse> {
  var execFile:Function;
  if (typeof process !== "object") {
    throw new Error("Runtime: runExecProcessOnUrl() should only be used inside Node");  // a browser
  } else {
    if(! execFile ) {
      let tmp=await import('node:child_process');
      execFile = tmp.execFile;
    }
  }

  return new Promise(async (good: PromiseSucceed<SimpleResponse>, bad: PromiseReject) => {
// stderr has headers
  // stdout has response body
  const CB=(error:Error, stdout:string| Buffer, stderr: string|Buffer ):void => {
    if(error) {
      console.error("cURL failed:", error.message);
      return bad(error);
    }
    if(stdout instanceof Buffer) {
      stdout=stdout.toString();
    }
    if(stderr instanceof Buffer) {
      stderr=stderr.toString();
    }

    let headers=parseHeaders(stderr);
    let h2=new Headers();
    for(let i in headers.resp ) {
      h2.append( i, headers.resp[i] );
    }

    let exit:SimpleResponse= {
        body: stdout.trim(),
        headers: h2,
        ok: Math.floor( parseInt(headers.resp['status'], 10) /100) === 2,
        status: parseInt(headers.resp['status'], 10 ),
      } as SimpleResponse;
    return good(exit);
  };

  function parseHeaders(str:string):RunExecReturn {
    let bits:Array<string>=str.split("\n");
    let out={reqt:{}, resp:{} } as RunExecReturn;
    
    for(let i=0; i<bits.length; i++ ) {
      switch(bits[i][0]) {
      case '>': {
        let annoying= parseHeader2(bits[i]);
        out.reqt[annoying[0]]=annoying[1];
        break;
        }
      case '<': {
        let annoying= parseHeader2(bits[i]);
        out.resp[annoying[0]]=annoying[1];
        break;
      }
      default: break;
    }
    }
    return out;
  }

  // > GET /api/shared-state HTTP/2
  // < HTTP/2 200
  function parseHeader2(str:string):Array<string> {
    str=str.trim();
    str=str.substring(1, str.length);
    str=str.trim();
    if( str.indexOf(':')===-1 ) {
      if( str.indexOf("HTTP/")===0 ) {
        return [ "status", str.substring( str.indexOf(' ')+1, str.length ) ];

      } else {
        return [ "method", str.substring(0, str.indexOf(' ') ) ];
      }
      
    } else {
      return [ 
      str.substring(0, str.indexOf(':')).trim(), 
      str.substring( str.indexOf(':')+2, str.length).trim(),
      ];
    }
  }

  let args:Array<string>=[
      "-v", "-k", "-m1", url,  
  ];
  if(extra && ( "method" in extra) && extra['method']) {
    args.push( "-X"+extra['method'].toUpperCase() );
  }
  if(extra &&( "body" in extra) && extra['body']) {
    args.push( "-d");
    args.push( extra['body'] );
  }
  if(extra && ("headers" in extra) ) {
    for(let i in extra.headers ) {
      args.push( "-H"+i+":"+extra.headers[i] );
    }
  }
  const options:FileExecFlags = { windowsHide:true, shell:false };
  execFile("/usr/bin/curl", args, options, CB);
  });
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
  const f: Fetch = globalThis.fetch;
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
  let trans: Response ={} as Response;
  try {
    let head:RequestInit=Object.assign({}, extra, { credentials: "same-origin", } );
    trans = await f(url, head ) as Response;
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
  } catch (e:unknown) {
// console.log("outer error formatter in my fetch", e);
    return returnBad(
      trap,
      new Error("ERROR getting asset " + url + " " + (e as Error).message),
      (trans?trans.status:500 )
    );
  }
}

