import { AList } from "./AList";
import type { SaveStruct } from "../types/Saveable";
import type { LocalCopy } from "./LocalCopy";
import type { ListCollection } from '../types/ListCollection';
// import { MessageDistribution } from "./MessageDistribution";
// import { RemoteStorage } from './RemoteStorage';
import type { DistantStorable } from "../types/RemoteTypes";
import type { Listable, ListStruct } from '../types/ListCollection';
import type { PromiseSucceed, PromiseReject } from "../types/promises";
 
/**
 * ListService 
 * ListService, the class to mediate List storage
 
 * @public
 */
export class ListService implements ListCollection {
  catalog: Array<AList>;
  remote: DistantStorable;
  local: LocalCopy;

  /**
   * constructor
   * Normal Con'tor
 
   * @param {DistantStorable} rr
   * @param {LocalCopy} ll
   * @public
   * @returns {ListService}
   */
  public constructor(rr: DistantStorable, ll: LocalCopy) {
    this.catalog = [];
    this.remote = rr;
    this.local = ll;
    console.log(
      "ListService created & injected with: (remote) " + rr.constructor.name + " (local) " + ll.constructor.name
    );
    this.loadAllLists();
  }

  /**
   * create
   * Inject a new List ~ will have no items
  // ID=0 isn't valid, so the code +1
 
   * @param {string} nom
   * @public
   * @return {number]
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
    if (!(this.remote && typeof this.remote === "object")) {
      return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
        good(false);
      });
    }
    return this.remote.poll();
  }

  /**
   * isNotValidId
   * Check a possible ID, is valid.  NOTE: negative test
 
   * @param {number} id
   * @public
   * @return {boolean}
   */
  public isNotValidId(id: number): boolean {
    return !(Number.isInteger(id) && id >= 0 && id <= this.catalog.length);
  }

  /**
   * count
   * Current number of Lists
 
   * @public
   * @return {number}
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
   * list
   * Return views() of the current Lists in this collection
 
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
   * Return a item (ie a list) from this List collection
 
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

/*
  // dupe function
  public store(ret: AList, offset: number): boolean {
    if (this.isNotValidId(offset)) {
      console.warn("ERROR: Cannot store list with id=" + offset);
      return false;
    }
    this.catalog[offset] = ret;
    return true;
  }
*/

  /**
   * saveAllLists
   * Publish all collection items (Lists) to remote API
   * Maybe should restructure so the inverted Mapper() is pulled out

   * @public
   * @returns {boolean}
   */
  public saveAllLists(): boolean {
    const tmp: Array<SaveStruct> = [];

    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
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
    Promise.resolve(this.local.saveState(tmp));
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
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
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

    // i hope this works
    return out;
  }
}
