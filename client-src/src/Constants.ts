import type { RemoteConfig } from "../../common/types/RemoteTypes";
import { RemoteStorage } from "./services/RemoteStorage";

export declare const __STORYBOOK_MODULE_TEST__: Readonly<string>;

/* TODO: You need to set this URL to your host where the app is run. 
 maybe it would be nice to have an install script for this line */
export const HOST_NAME= "app.hiss:3001";
export const HOST_NAME_SB="localhost:6006";
export const TEST_LOCATION_URL = "https://"+HOST_NAME;
export const APP_DEFAULT_API= "https://"+HOST_NAME+"/api/shared-state";

/**
 * REMOTE_HOST
 * A simple util to return correct URLs for storybook or runtime

 * @public
 * @returns {string}
 */
export function REMOTE_HOST(): string {
  if (globalThis.__STORYBOOK_MODULE_TEST__) {
    // IOIO XXX #FIXME YOU MUST UPDATE THIS TO YOUR LOCAL MACHINE NAME
    // when storybook is running, need to use a different value
    return HOST_NAME;
  }
  // outside of storybook tests, there is only 1 stack, and this works fins
  return location.hostname + ":" + location.port;
}

// relative URL to asset from same host, for worker thread js
export const MSG_THREAD = /* @vite-ignore */ new URL("/asset/worker1.es.min.mjs", import.meta.url);
export const MSG_THREAD_SB = /* @vite-ignore */ new URL("https://localhost:6006/sb-asset/worker1.es.min.mjs");

// networking values + postMessages
export const APP_NAME = "shopping";
export const APP_VERSION = "0.0.2";

// value in localStorage
export const INSTALLED = "local-shopping";
// value in base index.html
export const ROOT_NODE = "#app";
// localisation
export const SUPPORTED_LANGUAGE = "en-GB";
export const KNOWN_PHONE = "shopping-known"; // may get localised
export const LOGO_PATH = "/asset/logo.png";  // hopefully clear enough

// in the same request, pause 500ms then try again
export const API_RETRY = 500;
// if no network found, try after 30s
export const API_DELAY=30_000;

// This is outside of localisation at present,
// All phones must be in the same languages at the same time, or matching to ths doesnt work.
export const EMPTY_LIST_NAME = "New Empty list";
// the static id in the collection
export const EMPTY_LIST_ID = 0; 

// used in MessageDistribution
export const PMQUE_TIMER = 300; // ms
export const PMQUE_ATTEMPTS = 10; // count

export const WORKER_NAME = "NUDGE";  // I think this doesnt do anything


// Text displayed for drag handles, 
// not currentlky loalised as cannot be a long DE compound word (etc)
// https://symbl.cc/en/unicode/blocks/domino-tiles/
export const DRAG_HANDLE_SYMBOL = "🁻";

// values for MotionStream
export const MOBILE_THRESHOLD = 60; // px
export const BIG_THRESHOLD = 15; // in px, buttons are currently 13px tall
export const ANGLE_ACCURACY = 20.0; // I might need to split mobile and desktop here
// Following are strings used for representation of motion
export const CSS_SYMBOL_REMOVE = "swipe";
export const CSS_SYMBOL_ORDER = "move";
export const CSS_SYMBOL_RECEIPT = "receipt";
export const CSS_SYMBOL_UP = "upwards";
export const CSS_SYMBOL_DOWN = "dwnwards";
export const CSS_SYMBOL_LANDED = "itemLanded";

//  the duration the helpo text is showen for
export const TTL_FOR_HELP = 5_000; // in ms, 
// by default the help is visible or not
export const DEFAULT_HELP_SHOW = false;

// how long a fetch() call may block for, in lowest level of networking
// as LAN only, this is very generous
export const FETCH_TIMEOUT = 500; // ms

// duraton for **mouse** longtaps, that edit an item
export const DELAY_LONGTAP = 700; // ms
// and mobile
export const MOBILE_LONGTAP = 1100; // ms

// logging feature is ON | OFF
export const LOGGING_ENABLED = true;
// in log messages, trim() after X chars
export const MAX_LOG_LENGTH = 150;



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
