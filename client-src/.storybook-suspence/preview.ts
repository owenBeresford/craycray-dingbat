import "../src/assets/shopping.css";
import "../src/assets/foundation.min.css";
import { setup, definePreview } from "@storybook/vue3-vite";
import { createRouter, createWebHistory } from "vue-router";
import { Suspense } from "vue";
// import Vue3TouchEvents from "vue3-touch-events";
import { vueRouter } from "storybook-vue3-router";
import { uselog } from "../src/services/LogStack";

//https://storybook.js.org/docs/api/csf/csf-next
const preview = definePreview({
  // addons: [ ],
  decorators: [
    //    vueRouter(),
    (story) => ({
      components: { story },
      template: "<Suspense><story /></Suspense>",
      //    template: "<story />",
    }),
  ],
  parameters: {
    a11y: {
      options: { xpath: true },
      test: "todo",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
});
console.log("XXXX XXXX XXXX separator version with SUSPENSE , (just started storybook preview) XXXX XXXXX XXXXX");

/*
export const decorators = [
  (story) => ({
    components: { story },
    template: "<Suspense><story /></Suspense>",
//    template: "<story />",
  }),
];
*/

// https://vueschool.io/articles/vuejs-tutorials/how-to-use-vue-router-a-complete-tutorial/
const router = createRouter({
  history: createWebHistory(),
  // the is "http://127.0.0.1:6006/" but it crashes if I set this
  routes: [], // maybe add some routes, as now getting routes errors
});

setup((app) => {
  try {
    app.use(router);
//    app.use(Vue3TouchEvents);
    app.provide("helpText", "menu");
    app.provide("canSeeHelp", false);
    app.provide("ttl", 5000);
    app.provide("shopping", {}); // a fake thing, that is unused,
    app.provide("log", useLog());
    // BUT adding the fake thing stops other errors #leSigh
  } catch (e) {
    console.error("I do not expect to see this", e);
  }
});

export default preview;
