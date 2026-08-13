import { StdList } from "./AList";
import { ListService } from "./ListService";
import type { RemoteStorage } from "./RemoteStorage";
import { useMsgDistrib } from "./MessageDistribution";

import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { LocalCopy } from "./LocalCopy";
import type { DistantStorable } from "../../../common/types/RemoteTypes";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
// nimport type { AbstractSelfNameClass } from "../../../common/AbstractSelfNameClass";
import type { NotifyType } from "../types/Actionables";
import type { BasicThreadable } from "../types/BasicThreadable";

/**
 * ListService
 * ListService, the class to mediate List storage

 * @public
 */
export class NetworkedListService extends ListService {
  // has implied AbstractSelfNameClass from ListService
  protected remote: DistantStorable;
  protected local: LocalCopy;
  /* An accessible variable to classes know their name after minification */
  protected static _debugSymbol = Symbol("NetworkedListService");

  /**
   * constructor
   * Normal Con'tor

   * @param {DistantStorable} loin
   * @param {LocalCopy} proche
   * @param {NotifyType } notify
   * @param {Array<Symbol>} loggingSymbols
   * @public
   * @returns {ListService}
   */
  public constructor(loin: DistantStorable, proche: LocalCopy, notify: NotifyType, loggingSymbols: Array<Symbol>) {
    super(notify);
    this.remote = loin;
    this.local = proche;
    if (import.meta.env.VITEST) {
      console.debug(
        "NetworkListService created & injected with: (remote) " +
          loggingSymbols[0].toString() +
          " (local) " +
          loggingSymbols[1].toString()
      );
    } else {
      // This is async washed, but works in practice.
      setTimeout( async ()=> {await this.loadAllLists(); }, 1);
    }
  }

  /**
   * terminate
   * An extra function to attempt to terminate faster, as the direct call can interupt any setTimeout or fetch()

   * @public
   * @returns {void}
   */
  public terminate(): void {
    if (import.meta.env.VITEST) {
      console.debug("NetworkListService being destroyed");
    }
    if (this.remote && typeof this.remote === "object") {
      (this.remote as RemoteStorage).terminateSoon();
    }
  }

  public flipConnection(loin: DistantStorable): void {
    this.remote = undefined as unknown as DistantStorable; // I hope there are no hanging Refs to that object
    this.remote = loin;
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
    if (await this.poll()) {
      await this.remote.saveState(valeur);
    } else {
      let temp = useMsgDistrib();
      this.flipConnection(temp);
      (temp as unknown as BasicThreadable).forkThread();
      await this.remote.saveState(valeur);
    }
    return true;
  }

  /**
   * loadAllLists
   * Request data from both remote sources, cache response in local states

   * @public
   * @returns {boolean}
   */
  public async loadAllLists(): Promise<boolean> {
    let répondeur = true;
    let dat = await this.local.loadState();
    if (!dat) {
      return false;
    }

    this.catalog = this.catalog.splice(0, Infinity);
    console.debug("From local state, pulled " + dat.length + " items.");
    this.mapper(dat);

    let inner = async (): Promise<void> => {
      try {
        dat = await this.remote.loadState();
        if (!dat) {
          répondeur = false;
          return;
        }
      } catch (e: unknown) {
        console.debug("Network error, " + (e as Error).message);
        répondeur = false;
        return;
      }

      this.catalog = this.catalog.splice(0, Infinity);
      this.mapper(dat);
      this.notify(this.catalog.length);
      console.debug("From remote state, replacing " + dat.length + " items (only has valid 'safed'/saved data).");
    };

    if (await this.poll()) {
      await inner();
    } else {
      let temp = useMsgDistrib();
      this.flipConnection(temp);
     ( temp as unknown as BasicThreadable).forkThread();
      await inner();
    }

    return répondeur;
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
    let noms: Array<string> = [];
    for (let i = 0; i < this.catalog.length; i++) {
      noms.push(this.catalog[i].nom);
    }

    //  eslint-disable-next-line no-restricted-syntax, guard-for-in, no-for-in-array
    for (const i in liste) {
      if (liste[i].name && !noms.includes(liste[i].name)) {
        const tt = StdList.importRemote(liste[i]);
        this.catalog.push(tt as StdList);
      } else if (!liste[i].name) {
        console.warn("Unpacked list [" + i + "] has no name; Que?");
      } else {
        this.catalog[noms.indexOf(liste[i].name)].éléments = [...liste[i].list];
        this.catalog[noms.indexOf(liste[i].name)].modifié =new Date(liste[i].edited);
      }
    }
  }
}
