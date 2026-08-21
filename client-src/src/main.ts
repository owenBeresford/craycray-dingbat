import { createApp, ref } from "vue";
import type { Plugin, DirectiveBinding } from "vue";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE, MOBILE_LONGTAP, DELAY_LONGTAP, TTL_FOR_HELP, DEFAULT_HELP_SHOW } from "./Constants";

import { isMobile } from "../../common/util";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";
import { useLog } from "./services/LogStack";
import type { FactoryArtefact } from "./services/DataFactory";
import { currentNetworkConfig, createEmptyFactory } from "./services/DataFactory";
import { ExtraHook } from "./services/ExtraHook";
import type { NullableSysTimerType } from "../../common/types/Timer";

console.time("boot-app");
const TOOL = createApp(ShoppingApp, { currentStateKey: "scr1", instanceId: "v1.1" });
TOOL.use(StaticRoutes);
TOOL.use(STORE);

TOOL.directive("longpress", {
  /**
   * beforeMount
   * Infra to support long clicks, either mobile or bigScreen
	* See pointerevent fiasco
 
   * @param {HTMLElement} el
   * @param {DirectiveBinding} binding
   * @public
   * @returns {void}
   */
  beforeMount(el: HTMLElement, binding: DirectiveBinding): void {
    let pressTimer: NullableSysTimerType = undefined;

    const start = (e: MouseEvent): void => {
      let delay = DELAY_LONGTAP;
      if (isMobile()) {
        delay = MOBILE_LONGTAP;
      }

      if (pressTimer === undefined) {
        pressTimer = globalThis.setTimeout((): void => {
          binding.value(e);
        }, delay);
      }
    };

    const cancel = (e: MouseEvent): void => {
      if (pressTimer !== undefined) {
        globalThis.clearTimeout(pressTimer);
        pressTimer = undefined;
      }
    };

    el.addEventListener("pointerdown", start);
    el.addEventListener("pointerup", cancel);
    el.addEventListener("pointerleave", cancel);
  },
});
console.time("boot-data-connection");
const data: FactoryArtefact = createEmptyFactory();
const listCountRef = ref<number>(0);
// this is too small to add a doc header,
// it's just to be able to set the var as a given point, as the assignment has its own stack pointer
function updateListCount(nu: number): void {
  listCountRef.value = nu;
}
await currentNetworkConfig(location, updateListCount, data);
// listCountRef.value SHOULD be updated inside DataFactory.currentNetworkConfig
console.timeEnd("boot-data-connection");
TOOL.provide("helpText", "menu");
TOOL.provide("canSeeHelp", DEFAULT_HELP_SHOW);
TOOL.provide("ttl", TTL_FOR_HELP);

TOOL.provide("dataOnLoad", { listCountRef, updateListCount });
TOOL.provide("listData", data);
TOOL.provide("log", useLog());

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
ExtraHook();
console.timeEnd("boot-app");
