// UNUSED https://iandunn.name/2019/11/29/minimal-cachestorage-cache-api-example/

// I should put this in a worker, but this is LAN only, I may not need to.
import { APP_NAME, APP_VERSION, REMOTE_HOST, INSTALLED } from "../Constants";
import { useLocal, LocalCopy } from "../services/LocalCopy";

const prefix = "https://" + REMOTE_HOST;
// IOIO XXX can I move this to a manifest?
const FILES: Array<string> = [
  prefix + "/index.html",
  prefix + "/favicon.ico",
  prefix + "/libs.min.js",
  prefix + "/shopping.min.css",
  prefix + "/shopping.min.js",
  prefix+"/worker1.min.mjs",
];

export class CacheWrapper {
  protected local: LocalCopy;

  constructor(ll: LocalCopy) {
    this.local = ll;
    if(!(global.caches instanceof CacheStorage )) {
      throw new Error("234798674564 Cache storage isn't working, the install button cannot work,");
    }
    if(location.protocol !== "https:") {
       throw new Error("945636534234 Cache storage isn't working, the install button cannot work,");
    }
  }

  // may over install on purpose, the assets should be immutable, 
  // but this allows newer copies
  install(): void {
    global.caches.open(APP_NAME + "_" + APP_VERSION)
      .then((cache:Cache):Promise<void> => {
        this.local.saveProperty(INSTALLED, "1");
        return cache.addAll(FILES);
                                           });
  }

  check(): boolean {
    // I cannot see a thing in cacheStorage to see if it has content
    // UPDATE see Cache class.
    let tt = parseInt(this.local.loadProperty(INSTALLED), 10);
    return !Number.isNaN(tt) && tt > 0;
  }
}

export function useCacheWrapper():CacheWrapper {
  return new CacheWrapper(useLocal());
}
