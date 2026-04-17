// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin } from "vue";
import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE } from "./Constants";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";

const TOOL = createApp(ShoppingApp, { currentStateKey:"scr1", instanceId:"v1.1" });
TOOL.use(StaticRoutes);
TOOL.use(Vue3TouchEvents as Plugin);
TOOL.use(STORE);

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
