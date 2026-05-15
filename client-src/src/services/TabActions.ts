import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import { BaseActions  } from './BaseActions';
import type { UserAction, MenuStateType, ExternalMethods, CBType } from './BaseActions';
import { AList } from "./AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "../components/Routing";
import { hashState } from "../../../common/util";
import { useUIText } from "./Localisation";
import type { FactoryArtefact } from "./DataFactory";
import type { COMPLETE_STORE } from "./Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";

 
/**
 * useTabActions
 * The standard access util
 * This has params to make building unit-tests easier.
 *
 * @param {COMPLETE_STORE} a
 * @param {FactoryArtefact} b
 * @param {CacheWrapper} c
 * @param {RouteRecordNormalized} d
 * @public
 * @returns {ExternalMethods}
 */
export function useTabActions(
  a: COMPLETE_STORE,
  b: FactoryArtefact,
  c: CacheWrapper,
  d: RouteRecordNormalized
): ExternalMethods {
  return new TabActions(d, a, c, b);
}

const TEXT = useUIText();

/**
 * @class TabActions
 * A class to make the TabBar simpler.   This also improves testability.

 * @access public
 */
export class TabActions extends BaseActions implements ExternalMethods {
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
  ): TabActions {
    super();
    this.route = rr;
    this.store = ss;
    this.cache = ca;
    this.data = ld;

    if (!this.store) {
      throw new Error("The Store of ShopState isn't present");
    }
    if (!this.cache) {
      throw new Error("The CacheWrapper isn't present");
    }
    if (!this.data || !this.data.currentData) {
      throw new Error("The Data Factory isn't present");
    }
    if (!this.route) {
      throw new Error("The vue Route isn't present");
    }
    this.loadedStateKey = hashState(this.data.currentData.list());
  }

  /**
   * onIntersitial
   * Event handler to load Interstitials

   * @public
   * @returns {void}
   */
  onIntersitial(ctx: MenuStateType): void {
    if (this.store.state.currentURL !== this.route.path) {
      console.warn("The state.currentURL hasn't updated!", this.store.state.currentURL, this.route.path);
      this.store.commit("setPath", this.route.path);
    }
    // assert( the initersitial is present in the current screen )
    this.store.commit("show", true);
  }

  /**
   * onInstall
   * Event handler to exec "install" to a phone

   * @public
   * @returns {boolean}
   */
  onInstall(ctx: MenuStateType): boolean {
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
  onUnique(ctx: MenuStateType): void {
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
  onDuplicate(ctx: MenuStateType): void {
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
  onSave(ctx: MenuStateType): boolean {
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
  onRevert(ctx: MenuStateType): boolean {
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      console.log("Data is identical to initial state ");
      return false;
    }
    console.log("Rebuilding data from cache for all lists");
    this.data.currentData.loadAllLists();
    return false;
  }

  /**
   * onMenu
   * Event handler to toggle the menu

   * @param {MenuStateType} ctx
   * @public
   * @returns {void}
   */
  onMenu(ctx: MenuStateType): void {
    ctx.menuStateRef.value = !ctx.menuStateRef.value;
  }

  /**
   * onSearch
   * Event handler to perform a search

   * @param {MenuStateType} ctx
   * @public
   * @returns {boolean}
   */
  onSearch(ctx: MenuStateType): boolean {
    ctx.getInputRef.value = "";
    createSearchCallback(ctx );
    ctx.visibleRef.value = true;
    return false;
  }

  /**
   * onName
   * Event handler to perform a list name change
   * @YODO if Route is show-all, abort with dedicated warning

   * @param {MenuStateType} ctx
   * @public
   * @returns {boolean}
   */
  onName(ctx: MenuStateType): boolean {
    const liste = ListData.currentData.get(this.store.state.currentId);
    if (!liste) {
      console.warn("EDIT NAME: got bad id, don't know how to proceed");
      return false;
    }
    createNameCallback(ctx);
    ctx.getInputRef.value = liste.nom ?? TEXT.get("menu.renameSupport");
    ctx.visibleRef.value = true;
    return false;
  }
}

export {noop } from './BaseActions';

/**
 * createNameCallback
 * An isolated code section to create a EnterInput callback
 * very IMPURE

 * @param (MenuStateType) ctx
 * @public
 * @returns {void}
 */
function createNameCallback(ctx: MenuStateType ): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null) {
      ctx.visibleRef.value = false;
      return;
    }

    const liste = ctx.ListData.currentData.get(ctx.storeRef.value.state.currentId);
    liste.editName(d1);
    ctx.ListData.value.currentData.put(ctx.storeRef.state.currentId, liste);
    ctx.visibleRef.value = false;
    StaticRoutes.push({ name: "list-everything" });
  };
}

/**
 * createSearchCallback
 * An isolated code section to create a EnterInput callback
 * very IMPURE

 * @param (MenuStateType) ctx
 * @public
 * @returns {void}
 */
function createSearchCallback(ctx: MenuStateType ): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null || d1 === "") {
      ctx.visibleRef.value = false;
      return;
    }

    console.info("Starting a search for '" + d1 + "'");
    let newList: AList = AList.serps(ctx.ListData.currentData.searchItems(d1));
    ctx.visibleRef.value = false;
    ctx.storeRef.value.commit("setPayload", newList);

    StaticRoutes.push({
      name: "serps",
      params: { term: d1 },
    });
  };
}
