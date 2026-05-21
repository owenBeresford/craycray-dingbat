import type { SaveStruct } from "./types/SaveStruct";
import { toHex as monkeyPatch_toHex } from "../server-src/node_modules/es-arraybuffer-base64/Uint8Array.prototype.toHex";
import type { PromiseSucceed, PromiseReject } from "./types/promises";
import type { SimpleResponse } from "./util";

// I extracted Struct to make the code easier, so I had named fields.
export interface FileExecFlags {
  cwd?: string | URL;
  env?: Object;
  encoding?: string;
  timeout?: number; // ms
  maxBuffer?: number;
  killSignal?: string | number;
  uid?: number;
  gid?: number;
  windowsHide?: boolean;
  windowsVerbatimArguments?: boolean;
  shell?: boolean | string;
  signal?: AbortSignal;
}

interface RunExecReturn {
  reqt: Record<string, string>;
  resp: Record<string, string>;
}

/**
 * runExecProcessOnUrl
 * A util to run a HTTP2 compat client to be able to test the API correctly.
 
 * @param {string} url
 * @param {RequestInit | undefined} extra
 * @see [https://nodejs.org/api/child_process.html#child_processexecfilefile-args-options-callback ]
 * @public
 * @returns {Promise<SimpleResponse>}
 */
export async function runExecProcessOnUrl(url: string, extra: RequestInit | undefined): Promise<SimpleResponse> {
  var execFile: Function;
  if (typeof process !== "object") {
    throw new Error("Runtime: runExecProcessOnUrl() should only be used inside Node"); // a browser
  } else {
    if (typeof execFile == "undefined") {
      let tmp = await import("node:child_process");
      execFile = tmp.execFile;
    }
  }

  return new Promise(async (good: PromiseSucceed<SimpleResponse>, bad: PromiseReject) => {
    // stderr has headers
    // stdout has response body
    const CB = (error: Error, stdout: string, stderr: string): void => {
      if (error) {
        console.error("cURL failed:", error.message);
        return bad(error);
      }

      let annoying1: string = (stdout as any) instanceof Buffer ? stdout.toString() : stdout;
      let annoying2: string = (stderr as any) instanceof Buffer ? stderr.toString() : stderr;
      let headers = parseHeaders(annoying2);
      let h2 = new Headers();
      for (let i in headers.resp) {
        h2.append(i, headers.resp[i]);
      }

      let exit: SimpleResponse = {
        body: annoying1.trim(),
        headers: h2,
        ok: Math.floor(parseInt(headers.resp["status"], 10) / 100) === 2,
        status: parseInt(headers.resp["status"], 10),
      } as SimpleResponse;
      return good(exit);
    };

    /**
   * parseHeaders
   * Translate flat plain-text of cURL output into a struct
 
   * @param {string} str
   * @public
   * @returns {RunExecReturn } 
   */
    function parseHeaders(str: string): RunExecReturn {
      let bits: Array<string> = str.split("\n");
      let out = { reqt: {}, resp: {} } as RunExecReturn;

      for (let i = 0; i < bits.length; i++) {
        switch (bits[i][0]) {
          case ">": {
            let annoying = parseHeader2(bits[i]);
            out.reqt[annoying[0]] = annoying[1];
            break;
          }
          case "<": {
            let annoying = parseHeader2(bits[i]);
            out.resp[annoying[0]] = annoying[1];
            break;
          }
          default:
            break;
        }
      }
      return out;
    }

    /**
   * parseHeader2
   * Tokenise a single heder into a more useful structure

   * Nopte two odfd cases, in HTTP2 look like this: 	 
  // > GET /api/shared-state HTTP/2
  // < HTTP/2 200

   * @param {string} str
   * @public
   * @returns {Array<string>}
   */
    function parseHeader2(str: string): Array<string> {
      str = str.trim();
      str = str.substring(1, str.length);
      str = str.trim();
      if (str.indexOf(":") === -1) {
        if (str.indexOf("HTTP/") === 0) {
          return ["status", str.substring(str.indexOf(" ") + 1, str.length)];
        } else {
          return ["method", str.substring(0, str.indexOf(" "))];
        }
      } else {
        return [str.substring(0, str.indexOf(":")).trim(), str.substring(str.indexOf(":") + 2, str.length).trim()];
      }
    }

    let args: Array<string> = ["-v", "-k", "-m1", url];
    if (extra && "method" in extra && extra["method"]) {
      args.push("-X" + extra["method"].toUpperCase());
    }
    if (extra && "body" in extra && extra["body"]) {
      args.push("-d");
      args.push(extra.body.toString());
    }
    if (extra && "headers" in extra && extra.headers) {
      let tmp = new Headers(extra.headers);
      for (let i of tmp) {
        args.push("-H" + i[0] + ":" + i[1]);
      }
    }
    const options: FileExecFlags = { windowsHide: true, shell: false };
    execFile("/usr/bin/curl", args, options, CB);
  });
}
