import type { RemoteConfig } from "../../common/types/RemoteTypes";
import { RemoteStorage } from "./services/RemoteStorage";

// networking values + postMessages
export const APP_NAME = "shopping";
export const APP_VERSION = "0.0.1";
export const REMOTE_HOST = location.hostname + ":" + location.port;
export const INSTALLED = "local-shopping";
export const API_RETRY = 500;
export const ROOT_NODE = "#app";

// this is outside of localisatuon at present,
// all phones must be in the same languages at the same time, or matching to ths doesnt woek.
export const EMPTY_LIST_NAME = "New Empty list";

// used in MessageDistribution
export const PMQUE_TIMER = 300;
export const PMQUE_ATTEMPTS = 10;

// URLs used
// maybe MSG_THREAD should start https://...
export const MSG_THREAD = /* @vite-ignore */ new URL("/asset/worker1.es.min.mjs", import.meta.url);
export const WORKER_NAME = "NUDGE";
export const LOGO_PATH = "/asset/logo.png";

// https://symbl.cc/en/unicode/blocks/domino-tiles/
export const DRAG_HANDLE_SYMBOL = "🁻";

// values for MotionStream
export const MOBILE_THRESHOLD = 60;
export const BIG_THRESHOLD = 15; // buttons are currently 13px tall
export const ANGLE_ACCURACY = 20.0; // I might need to split miobile and desktop here
export const CSS_SYMBOL_REMOVE = "swipe";
export const CSS_SYMBOL_ORDER = "move";
export const CSS_SYMBOL_RECEIPT = "receipt";
export const CSS_SYMBOL_UP = "upwards";
export const CSS_SYMBOL_DOWN = "dwnwards";
export const CSS_SYMBOL_LANDED="itemLanded";

// localisation
export const SUPPORTED_LANGUAGE = "en-GB";
export const KNOWN_PHONE = "shopping-known"; // may get localised
export const TTL_FOR_HELP = 5000; // ms
export const DEFAULT_HELP_SHOW = false;

export const FETCH_TIMEOUT = 500; // ms
export const DELAY_FOR_API = 500; // ms

// for **mouse** longtaps, that edit an item
export const DELAY_LONGTAP = 700; // ms
export const MOBILE_LONGTAP = 1100; // ms

export const MAX_LOG_LENGTH = 150;
export const LOGGING_ENABLED = true;

if (typeof globalThis.fetch === "undefined" || !globalThis.fetch) {
  throw new Error("73453894563453 Fetch() not found.  BAILING OUT");
}

export const TEST_LOCATION_URL="https://google.com/";
/**
 * createRemoteService
 * Create a remote HTTP client.  
 * Will throw if Node/ browser lacks features 
 
 * @param {Location | WorkerLocation} loc
 * @public
 * @returns {RemoteStorage}
 */
export function createRemoteService(loc: Location | WorkerLocation): RemoteStorage {
  if (
    "process" in globalThis &&
    process.env.NODE_ENV !== "development" &&
    (!globalThis || !globalThis.addEventListener)
  ) {
    throw new Error("8674564632343 Message passing is only possible inside a reasonable browser.");
  }
  if (
    "process" in globalThis &&
    process.env.NODE_ENV !== "development" &&
    (!globalThis || (!globalThis.Worker && !("worker_threads" in globalThis)))
  ) {
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

  return new RemoteStorage(d3);
}
