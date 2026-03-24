import { createStore, useStore as originalUseStore } from "vuex";
import type { Store } from "vuex";
import { APP_NAME } from "../Constants";
import type { ShopState } from '../types/ShopState';

/**
 * mapForHelp
 * Convert a URN to the symbol for the relevant interstitial text
 
 * @param {Store<ShopState>} state
 * @param {string} specific
 * @public
 * @returns {string}
 */
export const mapForHelp=(state: Store<ShopState>, specific: string): string => {
  let use = "";
  if (specific.length <= 2) {
    use = "/";
  } else if (specific.split("/").length > 1) {
    use = `/${specific.split("/")[1]}`;
  } else {
    use = specific;
  }

  const MM: Record<string, string> = {
    "/": "list-all",
    "/list-all": "list-all",
    "/list": "list-id",
    "/menu": "menu",
    // /install . . .
  };
  return MM[use];
};

// A Vuex Store object, to hold the SPA stack state 
export const STORE: Store<ShopState> = createStore<ShopState>({
  state: (): ShopState => {
    return {
      currentURL: "",
      showHelp: false,
      currentId: -1,
    } as ShopState;
  },
  mutations: {
    setPath(state: ShopState, nn: string): void {
      state.currentURL = nn;
    },
    show(state: ShopState, nn: boolean): void {
      state.showHelp = nn;
    },
    setId(state: ShopState, nn: number): void {
      state.currentId = nn;
    },
  },
  //  getters: {
  //    mapForHelp,
  //  },
});

// I need an example, do I need to pull vuex.useStore into every single component?

/**
 * useStore
 * Another use function, blah
 
 * @public
 * @returns {Store<ShopState>}
 */
export function useStore(): Store<ShopState> {
  originalUseStore(APP_NAME);
  return STORE;
}

// this solution is lighter than "rewire" which is described in
// https://www.wisdomgeek.com/development/web-development/javascript/how-to-unit-test-private-non-exported-function-in-javascript/
export const OnlyForTesting = { mapForHelp };

/**
> STORE
Store {
  _committing: false,
  _actions: [Object: null prototype] {},
  _actionSubscribers: [],
  _mutations: [Object: null prototype] {
    setPath: [ [Function: wrappedMutationHandler] ],
    show: [ [Function: wrappedMutationHandler] ],
    setId: [ [Function: wrappedMutationHandler] ]
  },
  _wrappedGetters: [Object: null prototype] { mapForHelp: [Function: wrappedGetter] },
  _modules: ModuleCollection {
    root: Module {
      runtime: false,
      _children: [Object: null prototype] {},
      _rawModule: [Object],
      state: [Object],
      context: [Object]
    }
  },
  _modulesNamespaceMap: [Object: null prototype] {},
  _subscribers: [],
  _makeLocalGettersCache: [Object: null prototype] {},
  _scope: EffectScope {
    detached: true,
    _active: true,
    _on: 0,
    effects: [],
    cleanups: [],
    _isPaused: false,
    __v_skip: true,
    parent: undefined
  },
  _devtools: undefined,
  dispatch: [Function: boundDispatch],
  commit: [Function: boundCommit],
  strict: false,
  getters: { mapForHelp: [Getter] },
  _state: Proxy [
    { data: [Object] },
    MutableReactiveHandler { _isReadonly: false, _isShallow: false }
  ]
}

*/
