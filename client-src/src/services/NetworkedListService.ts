import { AList } from "./AList";
import { ListService } from "./ListService";

import type { SaveStruct } from "../types/Saveable";
import type { LocalCopy } from "./LocalCopy";
import type { ListCollection } from "../types/ListCollection";
import type { DistantStorable } from "../types/RemoteTypes";
//import type { Listable, ListStruct } from "../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../types/promises";

/**
 * ListService 
 * ListService, the class to mediate List storage
 
 * @public
 */
export class NetworkedListService extends ListService implements ListCollection {
  protected remote: DistantStorable;
  protected local: LocalCopy;

  /**
   * constructor
   * Normal Con'tor
 
   * @param {DistantStorable} rr
   * @param {LocalCopy} ll
   * @public
   * @returns {ListService}
   */
  public constructor(rr: DistantStorable, ll: LocalCopy) {
    super();
    this.remote = rr;
    this.local = ll;
    if(  _LOGGING_) {
    console.log(
      "ListService created & injected with: (remote) " + rr.constructor.name + " (local) " + ll.constructor.name
    );
    }
    this.loadAllLists();
  }

  /**
   * poll
   * Check the remote data-sources are active (Wifi, and API running)
 
   * @public
   * @returns {Promise<boolean>}
   */
  public poll(): Promise<boolean> {
    if (!(this.remote && typeof this.remote === "object")) {
      return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
        good(false);
      });
    }
    return this.remote.poll();
  }

  /**
   * saveAllLists
   * Publish all collection items (Lists) to remote API
   * Maybe should restructure so the inverted Mapper() is pulled out

   * @public
   * @returns {boolean}
   */
  public async saveAllLists(): Promise<boolean> {
    const tmp: Array<SaveStruct> = [];

    // IDs are chosen by the caller, there may be holes in the list
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in, no-for-in-array
    for (const i in this.catalog) {
      tmp.push({
        name: this.catalog[i].nom,
        created: this.catalog[i].créé.getTime(),
        edited: this.catalog[i].modifié.getTime(),
        count: this.catalog[i].énumérer,
        id: this.catalog[i].id,
        list: [...this.catalog[i].éléments],
      } as SaveStruct);
    }
    //  Promise.resolve( this.local.saveState(tmp) );
    await this.local.saveState(tmp);
    return true;
  }

  /**
   * mapper
   * Util to convert data between formats SaveStruct -> AList
   * Mutates current Collections state
 
   * @param {Array<SaveStruct>} dat
   * @public
   * @returns {void}
   */
  private mapper(dat: Array<SaveStruct>): void {
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in, no-for-in-array
    for (const i in dat) {
      if (dat[i].name) {
        const tt = AList.manual(dat[i].name, dat[i].id);
        tt.créé = new Date(dat[i].created);
        tt.modifié = new Date(dat[i].edited);
        tt.énumérer = dat[i].count;
        tt.éléments = [...dat[i].list];
        this.catalog.push(<AList>tt);
      } else {
        console.warn("Unpacked list [" + i + "] has no name; Que?");
      }
    }
  }

  /**
   * loadAllLists
   * Request data from both remote sources, cache response in local states
 
   * @public
   * @returns {boolean} 
   */
  // might need to make this a Promise, if the then() callbacks dont block the function return.
  // public async loadAllLists(): Promise<boolean> {
  public loadAllLists(): boolean {
    let out = true;
    this.local.loadState().then((dat: Array<SaveStruct>): void => {
      if (!dat) {
        out = false;
        return;
      }

      this.catalog = this.catalog.splice(0, this.catalog.length);
      console.log("From local state, pulled " + dat.length + " items.");
      this.mapper(dat);
      return;
    });

    this.remote.loadState().then((dat: Array<SaveStruct>): void => {
      if (!dat) {
        out = false;
        return;
      }

      this.catalog = this.catalog.splice(0, this.catalog.length);
      console.log("From remote state, replacing " + dat.length + " items.");
      this.mapper(dat);
      return;
    });

    // i hope this works.  JS ha no spinlocks
    return out;
  }
}
