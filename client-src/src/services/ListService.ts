import { AList, EMPTY_LIST } from "./AList";

import type { SaveStruct } from "../types/Saveable";
import type { ListCollection } from "../types/ListCollection";
import type { ListStruct } from "../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../types/promises";
// import type { LocalCopy } from "./LocalCopy";
// import { MessageDistribution } from "./MessageDistribution";
// import { RemoteStorage } from './RemoteStorage';
// import type { DistantStorable } from "../types/RemoteTypes";

/**
 * ListService 
 * ListService, the class to mediate List storage
 
 * @public
 */
export class ListService implements ListCollection {
  protected catalog: Array<AList>;

  /**
   * constructor
   * Normal Con'tor
 
   * @param {DistantStorable} rr
   * @param {LocalCopy} ll
   * @public
   * @returns {ListService}
   */
  public constructor() {
    this.catalog = [ EMPTY_LIST ];
  }

  /**
   * create
   * Inject a new List ~ will have no items
  // ID=0 isn't valid, so the code +1
 
   * @param {string} nom
   * @public
   * @returns {number}
   */
  public create(nom: string): number {
    const LEN = this.catalog.length;
    this.catalog.push(AList.manual(nom, LEN));
    return LEN + 1;
  }

  /**
   * poll
   * Check the remote data-sources are active (Wifi, and API running)
 
   * @public
   * @returns {Promise<boolean>}
   */
  public poll(): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      good(false);
    });
  }

  /**
   * isNotValidId
   * Check a possible ID, is valid.  NOTE: negative test
 
   * @param {number} id
   * @public
   * @returns {boolean}
   */
  public isNotValidId(id: number): boolean {
    if (this.catalog.length === 0) {
      // adding special case here, otherwise empty lists remain empty
      return id === 0;
    }
    return !(Number.isInteger(id) && id >= 0 && id <= this.catalog.length);
  }

  /**
   * count
   * Current number of Lists
 
   * @public
   * @returns {number}
   */
  public count(): number {
    return this.catalog.length;
  }

  /**
   * delete
   * Remove a specific List from this collection
 
   * @param {number} id
   * @public
   * @returns {boolean}
   */
  public delete(id: number): boolean {
    if (this.isNotValidId(id)) {
      return false;
    }
    id--;
    this.catalog.splice(id, 1);
    return true;
  }

  /**
   * merge
   * Copy a remote collection into this object
 
   * @param {ListCollection} next
   * @public
   * @returns {boolean}
   */
  public merge(next: ListCollection): boolean {
    for (let i = 0; i < next.count(); i++) {
      let annoying = next.get(i);
      if (annoying) {
        this.append(annoying);
      }
    }
    return true;
  }

  /**
   * list
   * Return views() of the current Lists in this collection.
 
   * @public
   * @returns {Array<ListStruct> }
   */
  public list(): Array<ListStruct> {
    const tmp: Array<ListStruct> = [];
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in this.catalog) {
      tmp.push(this.catalog[i].view());
    }
    return tmp;
  }

  /**
   * get
   * Return a item (ie a list) from this List collection.
 
   * @param {number} id
   * @public
   * @returns {AList | undefined}
   */
  public get(id: number): AList | undefined {
    if (this.isNotValidId(id) || !(id in this.catalog)) {
      console.warn("ERROR: Cannot load list with id=" + id + " " + JSON.stringify(this.catalog));
      return undefined;
    }
    let tmp = this.catalog[id];
    if (tmp === null) {
      return undefined;
    }
    return tmp;
  }

  /**
   * put
   * Set a particular item in a named slot.
 
   * @param {number} id
   * @param {AList} ret
   * @public
   * @returns {boolean}
   */
  public put(id: number, ret: AList): boolean {
    if (this.isNotValidId(id)) {
      console.warn("ERROR: Cannot put list with id=" + id);
      return false;
    }
    this.catalog[id] = ret;
    return true;
  }

  /**
   * append
   * Add a List to end of collection
 
   * @param {AList} ret
   * @public
   * @returns {boolean}
   */
  public append(ret: AList): boolean {
    this.catalog.push(ret);
    return true;
  }

  /**
   * saveAllLists
   * Publish all collection items (Lists) to remote API
   * Maybe should restructure so the inverted Mapper() is pulled out
   * NULL IMPLEMEMENTATION

   * @public
   * @returns {boolean}
   */
  public async saveAllLists(): Promise<boolean> {
    const tmp: Array<SaveStruct> = [];
    return true;
  }

  /**
   * loadAllLists
   * Request data from both remote sources, cache response in local states
   * NULL IMPLEMEMENTATION
 
   * @public
   * @returns {boolean} 
   */
  public loadAllLists(): boolean {
    let out = true;
    return out;
  }
}
