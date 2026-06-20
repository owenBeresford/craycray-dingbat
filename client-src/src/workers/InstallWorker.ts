// UNUSED https://iandunn.name/2019/11/29/minimal-cachestorage-cache-api-example/

// I should put this in a worker, but this is LAN only, I may not need to.
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED } from "../Constants";
import { useLocal } from "../services/LocalCopy";
import type { LocalCopy } from "../services/LocalCopy";

/**
 * useCacheWrapper
 * Another use function, blah

 * @public
 * @returns {CacheWrapper}
 */
export function useCacheWrapper(): CacheWrapper {
  if (
    !("__STORYBOOK_MODULE_TEST__" in globalThis && globalThis.__STORYBOOK_MODULE_TEST__) &&
    !( process.env && Object.keys(process.env)) &&
    !(globalThis.caches instanceof CacheStorage)
  ) {
    throw new Error("234798674564 Cache storage isn't working, the install button cannot work,");
  }

  return new CacheWrapper(useLocal());
}

// List of files needed in the installation
const prefix = "https://" + REMOTE_HOST;
// web manifests do not list files, so list lives here
const FILES: Array<string> = [
  prefix + "/index.html",
  prefix + "/asset/manifest.json",
  prefix + "/asset/favicon.ico",
  prefix + "/asset/logo.png",
  prefix + "/asset/shopping.min.css",
  prefix + "/asset/shopping.es.min.mjs",
  prefix + "/asset/worker1.es.min.mjs",
];

/**
 * CacheWrapper
 * Class to manage local cache for installation

 * @public
 */
export class CacheWrapper {
  protected local: LocalCopy;

  /**
   * constructor
   * Plain con'tor, nothing noteworthy
   * UPDATE: I needed to mask out the exception when storybook is found, or that always bsils.

   * @param {LocalCopy} ll
   * @public
   */
  public constructor(ll: LocalCopy) {
    this.local = ll;
    if (
      !("__STORYBOOK_MODULE_TEST__" in globalThis && globalThis.__STORYBOOK_MODULE_TEST__) &&
      location.protocol !== "https:"
    ) {
      throw new Error("945636534234 Cache storage isn't working, the install button cannot work,");
    }
  }

  /**
   * install
   * Copy asset files onto device
   * This can over-install on purpose - the assets *should* be immutable,

   * @public
   * @returns {void}
   */
  public install(): void {
    globalThis.caches
      .open(APP_NAME + "_" + APP_VERSION)
      .then(async (cache: Cache): Promise<void> => {
        this.local.saveProperty(INSTALLED, "1");
        return await cache.addAll(FILES);
      })
      .catch((err: Error): void => {
        console.warn("App install: ", err.message, err);
      });
  }

  /**
   * isInstalled
   * A util to be able to see if App is already installed.

   * @public
   * @returns {Promise<boolean> }
   */
  public static async isInstalled(): Promise<boolean> {
    return await globalThis.caches.has(FILES[0]);
  }

  /**
   * check
   * Test installed flag, to show if App is present.

   * @public
   * @returns {boolean}
   */
  public check(): boolean {
    // I cannot see a thing in cacheStorage to see if it has content
    // UPDATE see Cache class.
    let tt = parseInt(this.local.loadProperty(INSTALLED), 10);
    return !Number.isNaN(tt) && tt > 0;
  }
}
