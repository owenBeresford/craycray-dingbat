import '../src/assets/shopping.css';
import '../src/assets/foundation.min.css';
import Vue3TouchEvents from 'vue3-touch-events';
import { setup } from '@storybook/vue3';
import { createRouter, createWebHistory } from 'vue-router';

/** @type { import('@storybook/vue3-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export const decorators = [
  (story) => ({
    components: { story },
    template: '<story />'
  })
];

const router = createRouter({
  history: createWebHistory(),
  routes: [] // maybe add some routes, as now getting routes errors
});

setup(app => {
  app.use(router);
  app.use(Vue3TouchEvents);
  app.provide( 'helpText', "menu");
  app.provide( 'canSeeHelp', false);
  app.provide( 'ttl', 5000);
  app.provide( 'shopping', {}); // a fake thing, that is unused,
  // BUT adding the fake thing stops other errors
});

export default preview;
