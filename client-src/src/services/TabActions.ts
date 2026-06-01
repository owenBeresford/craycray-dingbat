import type { RouteLocationNormalizedLoadedGeneric } from "vue-router";

import { BaseActions } from "./BaseActions";
import { StdList } from "./AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "../components/Routing";
import { hashState } from "../../../common/util";
import { extractId } from "./util";
import { useUIText } from "./Localisation";
import { useLog } from "./LogStack";

import type { FactoryArtefact } from "./DataFactory";
import type { COMPLETE_STORE } from "./Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ExternalMethods, FakeThis } from "../types/Actionables";

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
const LOG = useLog();

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
    if (this.store.state.currentURL !== this.route.path) {
      this.store.commit("setPath", this.route.path);
    }
    if (this.store.state.currentId < 0) {
      this.store.commit("setId", extractId(this.route.params.index));
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
  public onInterstitial(ignored: GuessEvent, ctx: FakeThis): void {
    if (this.store.state.currentURL !== this.route.path) {
      console.warn("The state.currentURL hasn't updated!", this.store.state.currentURL, this.route.path);
      this.store.commit("setPath", this.route.path);
    }

    LOG.addRaw("Showing the help notes as requested ", "debug");
    // assert( the initersitial is present in the current screen )
    this.store.commit("show", false);
    this.store.commit("show", true);
    ctx.menuStateRef.value = false;
  }

  /**
   * onInstall
   * Event handler to exec "install" to a phone

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  public onInstall(ignored: GuessEvent, ctx: FakeThis): void {
    if (location.protocol !== "https:") {
      LOG.addRaw("Install button is disabled, you need to use HTTPS.", "info");
      return;
    }
    if (this.cache.check()) {
      LOG.addRaw("App thinks its already installed.", "info");
      ctx.menuStateRef.value = false;
      return;
    }

    LOG.addRaw("App is running install now", "debug");
    this.cache.install();
    ctx.menuStateRef.value = false;
  }

  /**
   * onUnique
   * Event handler to exec the unique filter on this list

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  public onUnique(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (!this.route.params) {
      LOG.addRaw("Cannot run unique(), not on a single list screen", "info");
      return;
    }
    const liste = this.data.currentData.get(this.store.state.currentId);
    if (liste) {
      liste.unique();
      LOG.addRaw("Ran Unique on " + liste.nom + " (" + this.store.state.currentId + ")", "info");

      // @ts-ignore  - there are no undef() at runtime after the con'tor.
      this.data.currentData.put(this.store.state.currentId, liste);
      ctx.menuStateRef.value = false;
    } else {
      LOG.addRaw("NO LIST FOUND for Unique (" + this.store.state.currentId + ")", "warn");
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
  public onDuplicate(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (!this.route.params) {
      LOG.addRaw("cannot run duplicate(), not on a single list screen", "info");
      return;
    }
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
      LOG.addRaw("Duplicated list " + this.store.state.currentId + " (see list DUP).", "info");
      ctx.menuStateRef.value = false;
    } else {
      LOG.addRaw("Attempt duplicate list? BUT list not found " + this.store.state.currentId + ".", "warn");
    }
    StaticRoutes.push({ name: "list-everything" });
  }

  /**
   * onSave
   * Event handler to push current state to the server

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {Promise<boolean>}
   */
  public onSave(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      LOG.addRaw("Data is identical as last save. Nothing done", "info");
      return false;
    }

    LOG.addRaw("Saving all your current lists to a local cache.", "info");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.loadedStateKey = hashState(this.data.currentData.list());
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.data.currentData.saveAllLists();
    ctx.menuStateRef.value = false;
  }

  /**
   * onRevert
   * Event handler to revert local state to what is stored on the server

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {Promise<boolean>}
   */
  protected onRevert(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    if (this.loadedStateKey === hashState(this.data.currentData.list())) {
      LOG.addRaw("Data is identical to initial state. Nothing done", "info");
      return;
    }
    LOG.addRaw("Rebuilding data from cache for all lists.", "info");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    this.data.currentData.loadAllLists();
    ctx.menuStateRef.value = false;
  }

  /**
   * onMenu
   * Event handler to toggle the menu

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {void}
   */
  public onMenu(ignored: GuessEvent, ctx: FakeThis): void {
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
  public onSearch(ignored: GuessEvent, ctx: FakeThis): void {
    ctx.getInputRef.value = "";
    createSearchCallback(ctx);
    ctx.visibleRef.value = true;
    ctx.menuStateRef.value = false;
  }

  /**
   * onName
   * Event handler to perform a list name change
   * #TODO if Route is show-all, abort with dedicated warning

   * @param {GuesEvent} ignored - maintained for API compat, this is ignored
   * @param {FakeThis} ctx - in modern JS, the real "this" is discouraged 
   * @public
   * @returns {boolean}
   */
  public onName(ignored: GuessEvent, ctx: FakeThis): void {
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    const liste: StdList = this.data.currentData.get(this.store.state.currentId) as StdList;
    if (!liste) {
      LOG.addRaw("Cannot edit list name, only have a bad ID.", "warn");
      return;
    }

    createNameCallback(ctx, this.data);
    ctx.getInputRef.value = liste.nom ?? TEXT.get("menu.renameSupport");
    ctx.visibleRef.value = true;

    ctx.menuStateRef.value = false;
  }
}

export { noop } from "./BaseActions";

/**
 * createNameCallback
 * An isolated code section to create a EnterInput callback
 * very IMPURE

 * @param {FakeThis} ctx
 * @param { FactoryArtefact } data
 * @public
 * @returns {void}
 */
function createNameCallback(ctx: FakeThis, data: FactoryArtefact): void {
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
    LOG.addRaw(
      "Editing name on list " + ctx.storeRef.value.state.currentId + " was " + liste.nom + " becomes " + d1,
      "info"
    );
    liste.editName(d1);
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    data.currentData.put(ctx.storeRef.value.state.currentId as number, liste);
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

    LOG.addRaw("Search running against for " + d1, "info");
    // @ts-ignore  - there are no undef() at runtime after the con'tor.
    ctx.visibleRef.value = false;
    StaticRoutes.push({
      name: "serps",
      params: { term: d1 },
    });
  };
}
