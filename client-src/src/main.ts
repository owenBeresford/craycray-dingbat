// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin, DirectiveBinding } from "vue";
// import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE, MOBILE_LONGTAP, DELAY_LONGTAP } from "./Constants";
import { isMobile } from "../../common/util";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";

const TOOL = createApp(ShoppingApp, { currentStateKey: "scr1", instanceId: "v1.1" });
TOOL.use(StaticRoutes);
// TOOL.use(Vue3TouchEvents as Plugin, { disableClick: false, passive: false });
TOOL.use(STORE);

TOOL.directive("longpress", {
  beforeMount(el: HTMLElement, binding: DirectiveBinding): void {
    let pressTimer: number | null = null;

    const start = (e: MouseEvent): void => {
      let delay=DELAY_LONGTAP;
      if(isMobile()) { delay = MOBILE_LONGTAP; }
      
      if (pressTimer === null) {
        pressTimer = window.setTimeout(():void => {
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

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
