import { createRouter, createWebHistory } from "vue-router";

import ListOfLists from "./ListOfLists.vue";
import ThisList from "./ThisList.vue";
import UnknownRoute from "./UnknownRoute.vue";
import { wrap_getMyIP } from "../services/util";
import { useStore } from "../services/Store";
import { DataFactory } from "../services/DataFactory";

  /**
   * StaticRoutes
   * ilibrary standard file, holding the mspping of URN to Componment/ screen
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @public
   */
export const StaticRoutes = createRouter({
  history: createWebHistory(wrap_getMyIP()),
  routes: [
    //  props: { name: 'attrs' }
    {
      path: "/list-all",
      name: "list-everything",
      component: ListOfLists,
      props: (route) => {
        return { currentStateKey: "listoflists1" };
      },
    },
    {
      path: "/",
      name: "list-same",
      component: ListOfLists,
      props: (route) => {
        return { currentStateKey: "listoflists2" };
      },
    },
    {
      path: "/list/:index",
      name: "a-list",
      component: ThisList,
      props: async (route) => {
        return { shopStore: useStore(), factory: await DataFactory(), currentStateKey: "thislist1" };
      },
    },
    //    { path: '/install', name:'install', ...? },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: UnknownRoute,
      props: (route) => ({ errpath: `${route.path}`, currentStateKey: "unknownRoute" + route.path }),
    },
  ],
});
