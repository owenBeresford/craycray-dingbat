import { defineComponent } from "vue";
import type { MethodOptions } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import { AList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "./Routing";
import { hashState } from "../../../common/util";
import { useUIText } from "../services/Localisation";
import type { FactoryArtefact } from "../services/DataFactory";
import type { COMPLETE_STORE } from "../services/Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";

export type UserAction = (e: GuessEvent) => boolean;
// IOIO this type is abit of a hack...
export type DefinedComponent = ReturnValue<defineComponent>;
export interface ExternalMethods {
  mount(bound: Array<UserAction>, obj: DefinedComponent): MethodOptions;
}


/**
 * useUserActions
 * The standard access util
 * This has params to make building unit-tests easier.
 *
 * @param {shopStore} a
 * @param {FactoryArtefact} b
 * @param {CacheWrapper} c
 * @param {RouteRecordNormalized} d
 * @public
 * @returns {ExternalMethods} 
 */
export function useUserActions(
  a: shopStore,
  b: FactoryArtefact,
  c: CacheWrapper,
  d: RouteRecordNormalized
): ExternalMethods {
  return new UserActions(d, a, c, b);
}

const TEXT = useUIText();

/**
 * @class UserActions
 * A class to make the TabBar simpler.   This also improves testability.
 
 * @access public
 */
class UserActions implements ExternalMethods {
  protected store: COMPLETE_STORE;
  protected route: RouteRecordNormalized;
  protected cache: CacheWrapper;
  protected data: FactoryArtefact;

  protected loadedStateKey: string;

/**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 // NOTE:  not injected: StaticRoutes
 *
 * @param {RouteRecordNormalized} rr
 * @param {shopStore} ss
 * @param {CacheWrapper} ca
 * @param {FactoryArtefact} ld
 * @public
 * @returns {ExternalMethods} 
 */
  public constructor(
    rr: RouteRecordNormalized,
    ss: COMPLETE_STORE,
    ca: CacheWrapper,
    ld: FactoryArtefact
  ): UserActions {
    this.route = rr;
    this.store = ss;
    this.cache = ca;
    this.data = ld;
    this.loadedStateKey = hashState(this.data.currentData.list());

    if (!this.route) {
      throw new Error("The vue Route isn't present");
    }
    if (!this.store) {
      throw new Error("The Store of ShopState isn't present");
    }
    if (!this.cache) {
      throw new Error("The CacheWrapper isn't present");
    }
    if (!this.data) {
      throw new Error("The Data Factory isn't present");
    }
  }

  /**
   * mount
   * The accessible util to assign all the boilerplate code to the event handlers.
   * See HOC in a OO class
 
   * @param {Array<UserAction>} bound
   * @param {DefinedComponent} obj
   * @public
   * @returns {MethodOptions}
   */
  mount(bound: Array<UserAction>, obj: DefinedComponent): MethodOptions {
    let ret = {};
    for (let i = 0; i < bound.length; i++) {
      ret[bound[i].name] = this.wrapper(bound[i].bind(obj), false);
    }
    ret.onIntersitial = this.wrapper(this.onIntersitial, true);
    ret.onInstall = this.wrapper(this.onInstall, true);
    ret.onUnique = this.wrapper(this.onUnique, true);
    ret.onDuplicate = this.wrapper(this.onDuplicate, true);
    ret.onSave = this.wrapper(this.onSave, true);
    ret.onRevert = this.wrapper(this.onRevert, true);
    ret.onSearch = this.wrapper(this.onSearch, true);
    return ret;
  }

  /**
   * wrapper
   * A function -makin- function that creates boilerplate
 
   * @param {UserAction} f1
   * @param {boolean} bind
   * @public
   * @returns {UserAction }
   */
  wrapper(f1: UserAction, bind: boolean): UserAction {
    return function (e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        return false;
      }
	    if ('data' in this && !this.data.currentData) { 
        return false;
      }
      bind && f1.bind(this);
      f1(e); // return void mostly
      return false;
    }.bind(this);
  }

  /**
   * onIntersitial
   * Event handler to load Interstitials
 
   * @public
   * @returns {void}
   */
  onIntersitial(): void {
    console.log("Trying to show help", this.route.path);
    if (this.store.state.currentURL !== this.route.path) {
      console.warn("The state.currentURL hasn't updated!", this.store.state.currentURL, this.route.path);
      this.store.commit("setPath", this.route.path);
    }
    this.store.commit("show", true);
  }

  /**
   * onInstall
   * Event handler to exec "install" to a phone
 
   * @public
   * @returns {boolean}
   */
  onInstall(): boolean {
    if (location.protocol !== "https:") {
      console.warn("Install button is disabled, you need to use HTTPS.");
      return false;
    }
    if (this.CACHE.check()) {
      console.warn("App thinks its already installed.");
      return false;
    }

    console.log("Trying to install App to local device.");
    this.CACHE.install();
    return false;
  }

  /**
   * onUnique
   * Event handler to exec the unique filter on this list
 
   * @public
   * @returns {void}
   */
  onUnique(): void {
    const liste = this.data.currentData.get(this.store.state.currentId);
    if (liste) {
      liste.unique();
      this.data.currentData.put(this.store.state.currentId, liste);
    }
  }

  /**
   * onDuplicate
   * Event handler to copy the current list
 
   * @public
   * @returns {void}
   */
  onDuplicate(): void {
    const liste = this.data.currentData.get(this.store.state.currentId);

    if (liste) {
      const extra = Object.assign(AList.manual(`DUP: ${liste.nom}`, this.data.currentData.count()), liste);
      extra.editName(`DUP: ${liste.nom}`);
      this.data.currentData.append(extra);
    }
    StaticRoutes.push({ name: "list-everything" });
  }

  /**
   * onSave
   * Event handler to push current state to the server
 
   * @public
   * @returns {boolean}
   */
  onSave(): boolean {
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      console.log("Data is identical as last save ");
      return false;
    }

    console.log("Saving list to local cache list, for all lists");
    this.loadedStateKey = hashState(this.data.currentData.list());
    this.data.currentData.saveAllLists();
    return false;
  }

  /**
   * onRevert
   * Event handler to revert local state to what is stored on the server
 
   * @public
   * @returns [boolean]
   */
  onRevert(): boolean {
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      console.log("Data is identical to initial state ");
      return false;
    }
    console.log("Rebuilding data from cache for all lists");
    this.data.currentData.loadAllLists();
    return false;
  }
}
