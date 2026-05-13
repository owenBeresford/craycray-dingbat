import { createRouter, createWebHistory } from "vue-router";
import type {
  RouterOptions,
  RouteRecordRaw,
  RouteLocationNormalized,
  RouteLocationNormalizedGeneric, 
  RouteLocationNormalizedLoadedGeneric, 
  NavigationGuardNext,
  NavigationGuardReturn,
} from "vue-router";

import ListOfLists from "./ListOfLists.vue";
import ThisList from "./ThisList.vue";
import SearchList from "./SearchList.vue";
import UnknownRoute from "./UnknownRoute.vue";
import { useStore } from "../services/Store";
// import { ListData } from "../services/DataFactory";

 /**
   * StaticRoutes
   * library-standard file, holding the mspping of URN to Componment/ screen
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @public
   */
 export const StaticRoutes = createRouter({
  history: createWebHistory("/"),
  strict:false,
  routes: [
    // For the Meta sections
    // https://stackoverflow.com/questions/51639850/how-to-change-page-titles-when-using-vue-router
    //  props: { name: 'attrs' }
    {
      path: "/list-all",
      name: "list-everything",
      component: ListOfLists,
      meta: { title: "All your shopping lists" },
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params, currentStateKey: "listoflists1", fixPath: swapPath };
      },
    },
    {
      path: "/",
      name: "list-same",
      component: ListOfLists,
      meta: { title: "All your shopping lists" },
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params,  currentStateKey: "listoflists2", fixPath: swapPath };
      },
    },
    {
      path: "/list/:index",
      name: "a-list",
      meta: { title: "A list XXX" },
      component: ThisList,
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params, shopStore: useStore(), currentStateKey: "thislist1" };
      },
    },
    {
      path: "/located/:term",
      name: "serps",
      meta: { title: "Your search query result data." },
      component: SearchList,
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params,  currentStateKey: "searchlist1" };
      },
    },
    // possible @TODO IOIO XXX     this is available as a button
    //    { path: '/install', name:'install', ... },
    // also
    //    { path:'/welcome', name:'docs', ...} 
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      meta: { title: "Unable to perform your last request" },
      component: UnknownRoute,
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params, errpath: `${route.path}`, currentStateKey: "unknownRoute" + route.path };
      },
    },
  ] as Array<RouteRecordRaw>,
} as RouterOptions);

/*
StaticRoutes.beforeEach(
  async (
    to:RouteLocationNormalizedGeneric, 
    from:RouteLocationNormalizedLoadedGeneric, 
    next:NavigationGuardNext )
    :Promise<NavigationGuardReturn> => {
    console.
    log(`Pointless log to show feature ${from} -> ${to}`); 
    next();
});
*/

/**
 * swapPath
 * A util to reduce export of StaticRoutes
 
 * @param {RouteLocationNormalizedLoadedGenerici} rr
 * @public
 * @returns {void}
 */
export function swapPath(rr: RouteLocationNormalizedLoadedGeneric): void {
  if (rr.path === "/") {
    StaticRoutes.push({ name: "list-everything" });
  }
}
