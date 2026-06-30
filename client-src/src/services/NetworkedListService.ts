import { StdList } from "./AList";
import { ListService } from "./ListService";
import { RemoteStorage } from "./RemoteStorage";

import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { LocalCopy } from "./LocalCopy";
// import type { ListCollection } from "../types/ListCollection";
import type { DistantStorable } from "../../../common/types/RemoteTypes";
//import type { Listable, ListStruct } from "../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import type {AbstractSelfNameClass} from '../../../common/AbstractSelfNameClass';
import type { NotifyType } from "../types/Actionables";

/**
 * ListService
 * ListService, the class to mediate List storage

 * @public
 */
export class NetworkedListService extends ListService {
  // has implied AbstractSelfNameClass from ListService
  protected remote: DistantStorable;
  protected local: LocalCopy;
  protected static _debugSymbol = Symbol("NetworkedListService");

  /**
   * constructor
   * Normal Con'tor

   * @param {DistantStorable} loin
   * @param {LocalCopy} proche
   * @public
   * @returns {ListService}
   */
  public constructor(loin: DistantStorable, proche: LocalCopy, notify: NotifyType, loggingSymbols:Array<Symbol> )  {
    super(notify);
    this.remote = loin;
    this.local = proche;
    if (import.meta.env.VITEST ) {
      console.log(
        "NetworkListService created & injected with: (remote) " +
          loggingSymbols[0] +
          " (local) " +
          loggingSymbols[1]
      );
    }
    this.loadAllLists();
  }

  /**
   * terminate
   * An extra function to attempt to terminate faster, as the direct call can interupt any setTimeout or fetch()

   * @public
   * @returns {void}
   */
  public terminate(): void {
    if (import.meta.env.VITEST) {
      console.log("NetworkListService being destroyed");
    }
    if (this.remote && typeof this.remote === "object") {
      (this.remote as RemoteStorage).terminateSoon();
    }
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
    const valeur: Array<SaveStruct> = [];

    // IDs are chosen by the caller, there may be holes in the list
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in, no-for-in-array
    for (const i in this.catalog) {
      valeur.push({
        name: this.catalog[i].nom,
        created: this.catalog[i].créé.getTime(),
        edited: this.catalog[i].modifié.getTime(),
        count: this.catalog[i].énumérer,
        id: this.catalog[i].id,
        list: [...this.catalog[i].éléments],
      } as SaveStruct);
    }
    await this.local.saveState(valeur);
    await this.remote.saveState(valeur);
    return true;
  }

  /**
   * mapper
   * Util to convert listea between formats SaveStruct -> StdList
   * Mutates current Collections state

   * @param {Array<SaveStruct>} liste
   * @public
   * @returns {void}
   */
  private mapper(liste: Array<SaveStruct>): void {
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in, no-for-in-array
    for (const i in liste) {
      if (liste[i].name) {
        const tt = StdList.manual<string, StdList>(liste[i].name, liste[i].id);
        tt.créé = new Date(liste[i].created);
        tt.modifié = new Date(liste[i].edited);
        tt.énumérer = liste[i].count;
        tt.éléments = [...liste[i].list];
        this.catalog.push(tt as StdList);
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
    let répondeur = true;
    this.local.loadState().then((dat: Array<SaveStruct>): void => {
      if (!dat) {
        répondeur = false;
        return;
      }

      this.catalog = this.catalog.splice(0, Infinity);
      console.debug("From local state, pulled " + dat.length + " items.");
      this.mapper(dat);
      return;
    });

    this.remote.loadState().then((dat: Array<SaveStruct>): void => {
      if (!dat) {
        répondeur = false;
        return;
      }

      this.catalog = this.catalog.splice(0, Infinity);
      this.mapper(dat);
      this.notify(this.catalog.length);
      console.debug("From remote state, replacing " + dat.length + " items (only has valid 'safed'/saved data).");
      return;
    });

    // i hope this works.  JS has no spinlocks
    return répondeur;
  }
}
