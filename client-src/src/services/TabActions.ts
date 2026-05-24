import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized, RouteLocationNormalizedLoadedGeneric } from "vue-router";

import { BaseActions } from "./BaseActions";
import { StdList, SearchList } from "./AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "../components/Routing";
import { hashState } from "../../../common/util";
import { useUIText } from "./Localisation";
import { ListData } from "./DataFactory";

import type { FactoryArtefact } from "./DataFactory";
import type { COMPLETE_STORE } from "./Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";
import type { ExternalMethods, FakeThis, UserAction, CBType } from "../types/Actionables";

/**
 * useTabActions
 * The standard access util
 * This has params to make building unit-tests easier.
 *
 * @param {COMPLETE_STORE} a
 * @param {FactoryArtefact} b
 * @param {CacheWrapper} c
 * @param {RouteLocationNormalizedLoadedGeneric} d
 * @public
 * @returns {ExternalMethods}
 */
export function useTabActions(
  a: COMPLETE_STORE,
  b: FactoryArtefact,
  c: CacheWrapper,
  d: RouteLocationNormalizedLoadedGeneric
): ExternalMethods {
  let tmp = new TabActions(d, a, c, b);
  if (b.currentData) {
    tmp.loadedStateKey = hashState(b.currentData.list());
  }
  return tmp;
}

const TEXT = useUIText();

/**
 * @class TabActions
 * A class to make the TabBar simpler.   This also improves testability.

 * @access public
 */ // implements ExternalMethods
export class TabActions extends BaseActions {
  protected store: COMPLETE_STORE;
  protected route: RouteLocationNormalizedLoadedGeneric;
  protected cache: CacheWrapper;
  protected data: FactoryArtefact;

  public loadedStateKey: string;

  /**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 // NOTE:  not injected: StaticRoutes
 *
 * @param {RouteLocationNormalizedLoadedGeneric} rr
 * @param {shopStore} ss
 * @param {CacheWrapper} ca
 * @param {FactoryArtefact} ld
 * @public
 * @returns {ExternalMethods}
 */
  public constructor(
    rr: RouteLocationNormalizedLoadedGeneric,
    ss: COMPLETE_STORE,
    ca: CacheWrapper,
    ld: FactoryArtefact
  ) {
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
  }

  /**
   * onInterstitial
   * Event handler to load Interstitials

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  onInterstitial(ignored: GuessEvent, ctx: FakeThis): void {
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

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  onInstall(ignored: GuessEvent, ctx: FakeThis): boolean {
    if (location.protocol !== "https:") {
      console.warn("Install button is disabled, you need to use HTTPS.");
      return false;
    }
    if (this.cache.check()) {
      console.warn("App thinks its already installed.");
      return false;
    }

    console.log("Trying to install App to local device.");
    this.cache.install();
    return false;
  }

  /**
   * onUnique
   * Event handler to exec the unique filter on this list

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  onUnique(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    const liste = this.data.currentData.get(this.store.state.currentId);
    if (liste) {
      liste.unique();
      // @ts-ignore  - there are no undef() at runtime after the con'tor.
      this.data.currentData.put(this.store.state.currentId, liste);
    }
  }

  /**
   * onDuplicate
   * Event handler to copy the current list

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  onDuplicate(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    const liste: Stdlist = this.data.currentData.get(this.store.state.currentId);

    if (liste) {
      // @ts-ignore  - there are no undef() at runtime after the con'tor.
      const extra: StdList = Object.assign(
        StdList.manual<string, StdList>(`DUP: ${liste.nom}`, this.data.currentData.count()) as StdList,
        liste
      );
      extra.editName(`DUP: ${liste.nom}`);
      // @ts-ignore  - there are no undef() at runtime after the con'tor.
      this.data.currentData.append(extra);
    }
    StaticRoutes.push({ name: "list-everything" });
  }

  /**
   * onSave
   * Event handler to push current state to the server

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  async onSave(ignored: GuessEvent, ctx: FakeThis): Promise<boolean> {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      console.log("Data is identical as last save ");
      return false;
    }

    console.log("Saving list to local cache list, for all lists");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.loadedStateKey = hashState(this.data.currentData.list());
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.data.currentData.saveAllLists();
    return false;
  }

  /**
   * onRevert
   * Event handler to revert local state to what is stored on the server

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns [boolean]
   */
  async onRevert(ignored: GuessEvent, ctx: FakeThis): Promise<boolean> {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      console.log("Data is identical to initial state ");
      return false;
    }
    console.log("Rebuilding data from cache for all lists");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.data.currentData.loadAllLists();
    return false;
  }

  /**
   * onMenu
   * Event handler to toggle the menu

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  onMenu(ignored: GuessEvent, ctx: FakeThis): void {
    ctx.menuStateRef.value = !ctx.menuStateRef.value;
  }

  /**
   * onSearch
   * Event handler to perform a search

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  onSearch(ignored: GuessEvent, ctx: FakeThis): boolean {
    ctx.getInputRef.value = "";
    createSearchCallback(ctx);
    ctx.visibleRef.value = true;
    return false;
  }

  /**
   * onName
   * Event handler to perform a list name change
   * @TODO if Route is show-all, abort with dedicated warning

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  onName(ignored: GuessEvent, ctx: FakeThis): boolean {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    const liste: StdList = this.data.currentData.get(this.store.state.currentId) as StdList;
    if (!liste) {
      console.warn("EDIT NAME: got bad id, don't know how to proceed");
      return false;
    }

    createNameCallback(ctx, this.data);
    ctx.getInputRef.value = liste.nom ?? TEXT.get("menu.renameSupport");
    ctx.visibleRef.value = true;
    return false;
  }
}

export { noop } from "./BaseActions";

/**
 * createNameCallback
 * An isolated code section to create a EnterInput callback
 * very IMPURE

 * @param (FakeThis) ctx
 * @public
 * @returns {void}
 */
function createNameCallback(ctx: FakeThis, data:FactoryArtefact): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null) {
      ctx.visibleRef.value = false;
      return;
    }

    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    const liste = data.currentData.get(ctx.storeRef.value.state.currentId);
    if (!liste) {
      throw new Error("THe currentId " + ctx.storeRef.value.state.currentId + "in the state/ session is invalid.");
    }
    liste.editName(d1);
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    data.currentData.put(ctx.storeRef.state.currentId, liste);
    ctx.visibleRef.value = false;
    StaticRoutes.push({ name: "list-everything" });
  };
}

/**
 * createSearchCallback
 * An isolated code section to create a EnterInput callback
 * very IMPURE

 * @param {FakeThis} ctx
 * @public
 * @returns {void}
 */
function createSearchCallback(ctx: FakeThis): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null || d1 === "") {
      ctx.visibleRef.value = false;
      return;
    }

    console.info("Starting a search for '" + d1 + "'");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    //    let newList: SearchList = SearchList.serps(ListData.currentData.searchItems(d1));
    ctx.visibleRef.value = false;
    //    ctx.storeRef.value.commit("setPayload", newList);
    StaticRoutes.push({
      name: "serps",
      params: { term: d1 },
    });
  };
}
