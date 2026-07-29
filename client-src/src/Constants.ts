import type { RemoteConfig } from "../../common/types/RemoteTypes";
import { RemoteStorage } from "./services/RemoteStorage";

/* TODO: You need to set this URL to yopur host wher the app is run. */
export const TEST_LOCATION_URL = "https://app.hiss:3001";

export function REMOTE_HOST(): string {
  if (globalThis.__STORYBOOK_MODULE_TEST__) {
    // IOIO XXX #FIXME YOU MUST UPDATE THIS TO YOUR LOCAL MACHINE NAME
    // when storybookj is running, need to use a different value
    return "app.hiss:3001";
  }
  // outside of storybook tests, there is only 1 stack, and this works fins
  return location.hostname + ":" + location.port;
}
// maybe MSG_THREAD should start https://...
export const MSG_THREAD = /* @vite-ignore */ new URL("/asset/worker1.es.min.mjs", import.meta.url);
export const MSG_THREAD_SB = /* @vite-ignore */ new URL("https://localhost:6006/sb-asset/worker1.es.min.mjs");

// networking values + postMessages
export const APP_NAME = "shopping";
export const APP_VERSION = "0.0.1";

export const INSTALLED = "local-shopping";
export const API_RETRY = 500;
export const ROOT_NODE = "#app";

// this is outside of localisatuon at present,
// all phones must be in the same languages at the same time, or matching to ths doesnt work.
export const EMPTY_LIST_NAME = "New Empty list";

// used in MessageDistribution
export const PMQUE_TIMER = 300;
export const PMQUE_ATTEMPTS = 10;

// URLs used
export const WORKER_NAME = "NUDGE";
export const LOGO_PATH = "/asset/logo.png";

// https://symbl.cc/en/unicode/blocks/domino-tiles/
export const DRAG_HANDLE_SYMBOL = "🁻";

// values for MotionStream
export const MOBILE_THRESHOLD = 60;
export const BIG_THRESHOLD = 15; // buttons are currently 13px tall
export const ANGLE_ACCURACY = 20.0; // I might need to split mobile and desktop here
export const CSS_SYMBOL_REMOVE = "swipe";
export const CSS_SYMBOL_ORDER = "move";
export const CSS_SYMBOL_RECEIPT = "receipt";
export const CSS_SYMBOL_UP = "upwards";
export const CSS_SYMBOL_DOWN = "dwnwards";
export const CSS_SYMBOL_LANDED = "itemLanded";

// localisation
export const SUPPORTED_LANGUAGE = "en-GB";
export const KNOWN_PHONE = "shopping-known"; // may get localised
export const TTL_FOR_HELP = 5_000; // ms
export const DEFAULT_HELP_SHOW = false;

export const FETCH_TIMEOUT = 500; // ms
export const DELAY_FOR_API = 500; // ms

// for **mouse** longtaps, that edit an item
export const DELAY_LONGTAP = 700; // ms
export const MOBILE_LONGTAP = 1100; // ms

export const MAX_LOG_LENGTH = 150;
export const LOGGING_ENABLED = true;

export const EMPTY_LIST_ID = 0;

if (typeof globalThis.fetch === "undefined" || !globalThis.fetch) {
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
    (!globalThis || !("Worker" in globalThis || "worker_threads" in globalThis))
  ) {
    throw new Error("9757353545757 Message passing is only possible inside a reasonable browser.");
  }

  let cred = "same-origin";
  if (location.hostname !== TEST_LOCATION_URL) {
    // ie in Storybook
    cred = "omit";
  }

  let whereTo = loc.protocol + "//" + loc.hostname + ":" + loc.port + "/api/shared-state";
  let d3: RemoteConfig = {
    url: whereTo,
    timeout: API_RETRY,
    headers: { "Content-Type": "application/json" },
    mode: "cors",
    method: "GET",
    credentials: cred,
  };
  return new RemoteStorage(d3);
}
