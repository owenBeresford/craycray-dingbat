import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import { AList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";
import { StaticRoutes } from "../components/Routing";
import { hashState } from "../../../common/util";
import { useUIText } from "../services/Localisation";
import type { FactoryArtefact } from "../services/DataFactory";
import type { COMPLETE_STORE } from "../services/Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";

export type UserAction = (e: GuessEvent) => boolean;
export interface MenuStateType {
  visibleRef: Ref<boolean>;
  getInputRef: Ref<stringn>;
  CBRef: Ref<(a: MenuStateType) => void>;
  storeRef: Ref<COMPLETE_STORE>;
  menuStateRef: Ref<boolean>;
}
// IOIO this type is abit of a hack...
export type DefinedComponent = ReturnValue<defineComponent>;
export interface ExternalMethods {
  mount(): MethodOptions;
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
   * mount
   * The accessible util to assign all the boilerplate code to the event handlers.
   * See HOC in a OO class
 
   * @param {MenuStateType } ctx
   * @public
   * @returns {MethodOptions}
   */
  mount(ctx: MenuStateType): MethodOptions {
    let ret = {
      [Symbol.iterator]() {
        const ar = Object.values(this);
        let i = 0;
        return {
          next() {
            if (i < ar.length) {
              let tmp = { value: ar[i], done: false };
              i++;
              return tmp;
            } else {
              return { done: true };
            }
          },
        };
      },
    };

    ret.onName = this.wrapper(this.onName, ctx);
    ret.onSearch = this.wrapper(this.onSearch, ctx);
    ret.onMenu = this.wrapper(this.onMenu, ctx);
    ret.onIntersitial = this.wrapper(this.onIntersitial, ctx);
    ret.onInstall = this.wrapper(this.onInstall, ctx);
    ret.onUnique = this.wrapper(this.onUnique, ctx);
    ret.onDuplicate = this.wrapper(this.onDuplicate, ctx);
    ret.onSave = this.wrapper(this.onSave, ctx);
    ret.onRevert = this.wrapper(this.onRevert, ctx);
    return ret;
  }

  /**
   * wrapper
   * A function -makin- function that creates boilerplate
 
   * @param {UserAction} f1
   * @param {MenuStateType} ctx
   * @public
   * @returns {UserAction }
   */
  wrapper(f1: UserAction, ctx: MenuStateType): UserAction {
    return function (e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        return false;
      }
      if ("data" in this && !this.data.currentData) {
        return false;
      }
      f1 = f1.bind(this);
      f1(ctx); // return void mostly
      return false;
    }.bind(this);
  }

  /**
   * onIntersitial
   * Event handler to load Interstitials
 
   * @public
   * @returns {void}
   */
  onIntersitial(ctx: MenuStateType): void {
    console.log("Trying to show help for screen: ", this.route.path);
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

  onMenu(ctx: MenuStateType): void {
    ctx.menuStateRef.value = !ctx.menuStateRef.value;
  }

  onSearch(ctx: MenuStateType): boolean {
    ctx.getInputRef.value = "";
    createSearchCallback(ctx, ctx.storeRef);
    ctx.visibleRef.value = true;
    return false;
  }

  onName(ctx: MenuStateType): boolean {
    const liste = ListData.currentData.get(this.store.state.currentId);
    if (!liste) {
      console.warn("EDIT NAME: got bad id, don't know how to proceed");
      return false;
    }
    createNameCallback(ctx, ctx.storeRef);
    ctx.getInputRef.value = liste.nom ?? TEXT.get("menu.renameSupport");
    ctx.visibleRef.value = true;
    return false;
  }
}

export type CBType = (d1: string | null) => any;
export function noop(str: string | null): void {}

function createNameCallback(ctx: MenuStateType, store: COMPLETE_STORE): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null) {
      ctx.visibleRef.value = false;
      return;
    }

    const liste = ctx.ListData.currentData.get(ctx.storeRef.value.state.currentId);
    liste.editName(d1);
    ctx.ListData.value.currentData.put(store.state.currentId, liste);
    ctx.visibleRef.value = false;
    StaticRoutes.push({ name: "list-everything" });
  };
}

function createSearchCallback(ctx: MenuStateType, store: COMPLETE_STORE): void {
  ctx.CBRef.value = (d1: string | null): any => {
    if (d1 === null || d1 === "") {
      ctx.visibleRef.value = false;
      return;
    }

    console.info("Starting a search for '" + d1 + "'");
    let newList: AList = AList.serps(ctx.ListData.currentData.searchItems(d1));
    ctx.visibleRef.value = false;
    store.value.commit("setPayload", newList);

    StaticRoutes.push({
      name: "serps",
      params: { term: d1 },
    });
  };
}
