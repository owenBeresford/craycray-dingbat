import type { RemoteConfig } from "./types/RemoteTypes";
import { RemoteStorage } from "./services/RemoteStorage";
// import type { Request as RequestType, Response as ResponseType } from 'node-fetch';

// networking values + postMessages
export const APP_NAME = "shopping";
export const APP_VERSION = "0.0.1";
export const REMOTE_HOST = location.hostname + ":" + location.port;
export const INSTALLED = "local-shopping";
export const API_RETRY = 500;
export const ROOT_NODE = "#app";
// IOIO XXX add a real value to this.    try server ip or msgQueue channel name
export const MSG_DESTINATION = "panic";

// used in MessageDistribution
export const PMQUE_TIMER = 300;
export const PMQUE_ATTEMPTS = 10;

// IOIO check base dir for conmpiled artefacts
export const MSG_THREAD = /* @vite-ignore */ new URL("worker1.min.mjs", import.meta.url);

// values for MotionStream
export const MOBILE_THRESHOLD = 150;
export const BIG_THRESHOLD = 200;
export const ANGLE_ACCURACY = 20.0;

// localisation
export const SUPPORTED_LANGUAGE = "en-GB";
export const KNOWN_PHONE = "shopping-known";

export const FETCH_TIMEOUT = 500; // ms
export const DELAY_FOR_API = 500; // ms

if (typeof global.fetch === "undefined" || !global.fetch) {
  throw new Error("73453894563453 Fetch() not found.  BAILING OUT");
}

/**
 * createRemoteService
 * Create a remote HTTP client.  
 * Will throw if Node/ browser lacks features 
 
 * @param {Location | WorkerLocation} loc
 * @public
 * @returns {RemoteStorage}
 */
export function createRemoteService(loc: Location | WorkerLocation): RemoteStorage {
  if (process.env.NODE_ENV !== "TEST" && (!global || !global.addEventListener)) {
    throw new Error("8674564632343 Message passing is only possible inside a reasonable browser.");
  }
  if (process.env.NODE_ENV !== "TEST" && (!global || (!global.Worker && !("worker_threads" in global)))) {
    throw new Error("9757353545757 Message passing is only possible inside a reasonable browser.");
  }
  let d3: RemoteConfig = {
    url: loc.protocol + "//" + loc.hostname + ":" + loc.port + "/api/shared-state",
    timeout: API_RETRY,
    headers: { "Content-Type": "application/json" },
    mode: "same-origin",
    method: "GET",
    credentials: "same-origin",
  };
  console.log("d3 RemoteConfig ", d3.url);

  return new RemoteStorage(d3);
}
