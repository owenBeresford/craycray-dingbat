import "../src/assets/shopping.css";
import "../src/assets/foundation.min.css";
import { setup, definePreview } from "@storybook/vue3-vite";
import { createRouter, createWebHistory } from "vue-router";
import Vue3TouchEvents from "vue3-touch-events";
import { uselog } from '../src/services/LogStack';


//https://storybook.js.org/docs/api/csf/csf-next
const preview = definePreview({
  // addons: [ addonQueryParams() ],
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

export const decorators = [
  (story) => ({
    components: { story },
    template: "<story />",
  }),
];

// https://vueschool.io/articles/vuejs-tutorials/how-to-use-vue-router-a-complete-tutorial/
const router = createRouter({
  history: createWebHistory(),
  // the is "http://127.0.0.1:6006/" but it crashes if I set this
  routes: [], // maybe add some routes, as now getting routes errors
});

setup((app) => {
  try {
    app.use(router);
    app.use(Vue3TouchEvents);
    app.provide("helpText", "menu");
    app.provide("canSeeHelp", false);
    app.provide("ttl", 5000);
    app.provide("log", useLog());

    app.provide("shopping", {}); // a fake thing, that is unused,
    // BUT adding the fake thing stops other errors #leSigh
  } catch (e) {
    console.error("I do not expect to see this", e);
  }
});
console.log("XXXX XXXX XXXX separator, (just started storybook preview) XXXX XXXXX XXXXX" );

export default preview;
