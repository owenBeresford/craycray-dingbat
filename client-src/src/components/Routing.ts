import { createRouter, createWebHistory } from "vue-router";
import type {
  RouterOptions,
  RouteRecordRaw,
  RouteLocationNormalized,
  RouteLocationNormalizedLoadedGeneric,
} from "vue-router";

import ListOfLists from "./ListOfLists.vue";
import ThisList from "./ThisList.vue";
import UnknownRoute from "./UnknownRoute.vue";
import { wrap_getMyIP } from "../../../common/util";
import { useStore } from "../services/Store";
import { ListData } from "../services/DataFactory";

const { currentData, updateData, initData } = ListData;
/**
   * StaticRoutes
   * ilibrary standard file, holding the mspping of URN to Componment/ screen
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @public
   */
export const StaticRoutes = createRouter({
  history: createWebHistory(wrap_getMyIP()),
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
        return { ...route.params, currentStateKey: "listoflists2", fixPath: swapPath };
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
    //    { path: '/install', name:'install', ...? },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: UnknownRoute,
      props: (route: RouteLocationNormalized): Record<string, any> => {
        return { ...route.params, errpath: `${route.path}`, currentStateKey: "unknownRoute" + route.path };
      },
    },
  ] as Array<RouteRecordRaw>,
} as RouterOptions);

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
