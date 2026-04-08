import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { vueRouter, asyncVueRouter } from "storybook-vue3-router";
import type { Decorator, StoryContext } from "@storybook/vue3";
import { expect, fn, within, userEvent } from "storybook/test";
import type { NavigationGuard, RouteRecordRaw } from "vue-router";
// import { createRouter, createMemoryHistory, useRoute, routeLocationKey } from "vue-router";
// import type { Store } from "vuex";

import ThisList from "../../components/ThisList.vue";
import UnknownRoute from "../../components/UnknownRoute.vue";
import { STORE } from "../../services/Store";
import { createDataFactory, ListData, idOf } from "../../services/DataFactory";
import { fixture1, fixture2, fixture3, fixture4 } from '../fixture-lists';
// this needs suspence

// https://github.com/storybookjs/storybook/blob/a3cdabb025524822807318bc137f69be006596c2/docs/snippets/web-components/api-doc-block-story-parameter.ts.mdx#L17
// https://storybook.js.org/addons/storybook-vue3-router
const customRoutes: Array<RouteRecordRaw> = [
  {
    path: "/list/:index",
    name: "viewList",
    component: ThisList,
  },
  {
    path: "/*",
    name: "errorHandler",
    component: UnknownRoute,
  },
];

const meta: Meta<typeof ThisList> = {
  component: ThisList,
  title: "a current List, ThisList",
  decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/2",
    }),
  ],

  /*
    // https://storybook.js.org/docs/api/arg-types
    // https://github.com/storybookjs/storybook/blob/a3cdabb025524822807318bc137f69be006596c2/docs/snippets/web-components/arg-types-if.ts.mdx
    argTypes: {
        currentStateKey: String,
        testId: String,
        shopStore: Store<ShopState> ,
     },
 */
} satisfies Meta<typeof ThisList>;

export default meta;
type Story = StoryObj<typeof ThisList>;

export const EntirelyPassive: Story = {
  args: {
    currentStateKey: "test16",
    testId: "test16",
    shopStore: STORE,
  },
}; //  await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());

export const TrackTextRendered2: Story = {
//////////////////////////////////////////////////////////////////////////////
// https://github.com/storybookjs/storybook/blob/a3cdabb025524822807318bc137f69be006596c2/docs/snippets/web-components/api-doc-block-story-parameter.ts.mdx#L17

  parameters: {
    docs: {
      story: { autoplay: true },
    },
  },
///////////////////////////////////////////////////////////////////////////////
  render: (args, { loaded }) => {
     // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ThisList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        if (currentData) {
          console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
        }
        if (ListData.currentData) {
          console.log("KKK Story.render ListData.currentData id:", idOf(ListData.currentData));
        }

        return { args, currentStateKey: "test17", testId: "test17", shopStore: STORE };
      },
      // inject Suspense, I guess here?
      template: `<ThisList currentStateKey="test17" testId="test17" :shopStore="shopStore" ></ThisList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture1());
      if (currentData) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }
      if (ListData.currentData) {
        console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
      }
      if (!currentData) {
        throw new Error();
      }
      ListData.updateData(currentData);

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
    if (ListData.currentData) {
      console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
    }
    if (currentData) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = await canvas.findByTestId("test17List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5 +2); // it correctly loads 1st list in fixture
    // the +2 is due to two textnodes

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test17input1")).toBe(null);
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test17input1")).toBeVisible();

    const btn2=canvas.queryByTestId('test0cancel1');
    expect( btn2).toBeVisible();
    if(btn2) {
      await userEvent.click(btn2);
    }
    // I shouldnt need to test the enterinput component, as it has its own test
  },
};

export const TrackTextRendered2_5: Story = {
  decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/3",
    }),
  ],
  render: (args, { loaded }) => {
     // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ThisList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        if (currentData) {
          console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
        }
        if (ListData.currentData) {
          console.log("KKK Story.render ListData.currentData id:", idOf(ListData.currentData));
        }

        return { args, currentStateKey: "test17", testId: "test17", shopStore: STORE };
      },
      // inject Suspense, I guess here?
      template: `<ThisList currentStateKey="test17" testId="test17" :shopStore="shopStore" ></ThisList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture1());
      if (currentData) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }
      if (ListData.currentData) {
        console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
      }
      if (!currentData) {
        throw new Error();
      }
      ListData.updateData(currentData);

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
    if (ListData.currentData) {
      console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
    }
    if (currentData) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = await canvas.findByTestId("test17List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5 +2); // it correctly loads 1st list in fixture
    // the +2 is due to two textnodes

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test17input1")).toBe(null);
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test17input1")).toBeVisible();
    // I shouldnt need to test the enterinput component, as it has its own test
  },
};


export const TrackTextRendered3: Story = {
  render: (args, { loaded }) => {
     // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ThisList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        if (currentData) {
          console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
        }
        if (ListData.currentData) {
          console.log("KKK Story.render ListData.currentData id:", idOf(ListData.currentData));
        }

        return { args, currentStateKey: "test18", testId: "test18", shopStore: STORE };
      },
      // inject Suspense, I guess here?
      template: `<ThisList currentStateKey="test18" testId="test18" :shopStore="shopStore" ></ThisList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture2());
      if (currentData) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }
      if (ListData.currentData) {
        console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
      }
      if (!currentData) {
        throw new Error();
      }
      ListData.updateData(currentData);

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
    if (ListData.currentData) {
      console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
    }
    if (currentData) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = canvas.getByTestId("test18List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5 +2); // it correctly loads 1st list in fixture

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test18input1")).toBe(null);
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test18input1")).toBeVisible();
    // I shouldnt need to test the enterinput component, as it has its own test
  },
};






export const TrackTextRendered4: Story = {
    decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/2",
    }),
  ],
  render: (args, { loaded }) => {
     // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ThisList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        if (currentData) {
          console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
        }
        if (ListData.currentData) {
          console.log("KKK Story.render ListData.currentData id:", idOf(ListData.currentData));
        }

        return { args, currentStateKey: "test19", testId: "test19", shopStore: STORE };
      },
      // inject Suspense, I guess here?
      template: `<ThisList currentStateKey="test19" testId="test19" :shopStore="shopStore" ></ThisList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture3());
      if (currentData) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }
      if (ListData.currentData) {
        console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
      }
      if (!currentData) {
        throw new Error();
      }
      ListData.updateData(currentData);

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
    if (ListData.currentData) {
      console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
    }
    if (currentData) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = canvas.getByTestId("test19List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5 +2); // it correctly loads 1st list in fixture

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test19input1")).toBe(null);
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test19input1")).toBeVisible();
    // I shouldnt need to test the enterinput component, as it has its own test
  },
};





export const TrackTextRendered5: Story = {
  decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/2",
    }),
  ],
render: (args, { loaded }) => {
     // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ThisList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        if (currentData) {
          console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
        }
        if (ListData.currentData) {
          console.log("KKK Story.render ListData.currentData id:", idOf(ListData.currentData));
        }

        return { args, currentStateKey: "test20", testId: "test20", shopStore: STORE };
      },
      // inject Suspense, I guess here?
      template: `<ThisList currentStateKey="test20" testId="test20" :shopStore="shopStore" ></ThisList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture4());
      if (currentData) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }
      if (ListData.currentData) {
        console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
      }
      if (!currentData) {
        throw new Error();
      }
      ListData.updateData(currentData);

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
    if (ListData.currentData) {
      console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
    }
    if (currentData) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = canvas.getByTestId("test20List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5 +2); // it correctly loads 1st list in fixture

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test20input1")).toBe(null);
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test20input1")).toBeVisible();
    // I shouldnt need to test the enterinput component, as it has its own test
  },
};

// the other behaviour is all outbound, need to do an app test, not component test.
