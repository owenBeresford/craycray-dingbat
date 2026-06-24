// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin, DirectiveBinding } from "vue";
// import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import {
  APP_NAME,
  ROOT_NODE,
  MOBILE_LONGTAP,
  DELAY_LONGTAP,
  TTL_FOR_HELP,
  DEFAULT_HELP_SHOW,
  LOGGING_ENABLED,
} from "./Constants";

import { isMobile } from "../../common/util";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";
import { useLog } from "./services/LogStack";
import type { FactoryArtefact } from "./services/DataFactory";
import { currentNetworkConfig, createEmptyFactory } from "./services/DataFactory";

console.time("boot-app");
const TOOL = createApp(ShoppingApp, { currentStateKey: "scr1", instanceId: "v1.1" });
TOOL.use(StaticRoutes);
// TOOL.use(Vue3TouchEvents as Plugin, { disableClick: false, passive: false });
TOOL.use(STORE);

TOOL.directive("longpress", {
  beforeMount(el: HTMLElement, binding: DirectiveBinding): void {
    let pressTimer: number | null = null;

    const start = (e: MouseEvent): void => {
      let delay = DELAY_LONGTAP;
      if (isMobile()) {
        delay = MOBILE_LONGTAP;
      }

      if (pressTimer === null) {
        pressTimer = window.setTimeout((): void => {
          binding.value(e);
        }, delay);
      }
    };

    const cancel = (e: MouseEvent): void => {
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", cancel);
    el.addEventListener("pointerleave", cancel);
  },
});
console.timeLog("boot-app");
const data: FactoryArtefact = createEmptyFactory();
await currentNetworkConfig(location, data);
console.timeLog("boot-app");
TOOL.provide("helpText", "menu");
TOOL.provide("canSeeHelp", DEFAULT_HELP_SHOW);
TOOL.provide("ttl", TTL_FOR_HELP);
TOOL.provide("dataOnLoad", data.currentData.count() > 0);
TOOL.provide("listData", data);
TOOL.provide("log", useLog());

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
console.timeEnd("boot-app");
