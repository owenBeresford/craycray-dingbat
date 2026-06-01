// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin, DirectiveBinding } from "vue";
import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE, DELAY_LONGTAP } from "./Constants";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";

const TOOL = createApp(ShoppingApp, { currentStateKey: "scr1", instanceId: "v1.1" });
TOOL.use(StaticRoutes);
TOOL.use(Vue3TouchEvents as Plugin, { disableClick: false, passive: false });
TOOL.use(STORE);

TOOL.directive("longpress", {
  beforeMount(el: HTMLElement, binding: DirectiveBinding): void {
    let pressTimer: number | null = null;

    const start = (e: MouseEvent): void => {
      if (pressTimer === null) {
        pressTimer = window.setTimeout(() => {
          binding.value(e);
        }, DELAY_LONGTAP);
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
