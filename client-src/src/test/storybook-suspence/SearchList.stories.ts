import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, userEvent } from "storybook/test";
import { vueRouter, asyncVueRouter } from "storybook-vue3-router";
import { useRoute } from "vue-router";
import type { NavigationGuard, RouteRecordRaw, RouteLocationNormalizedLoadedGeneric } from "vue-router";

import SearchList from "../../components/SearchList.vue";
import UnknownRoute from "../../components/UnknownRoute.vue";
import { ListData, createDataFactory } from "../../services/DataFactory";
import { CacheWrapper } from "../../workers/InstallWorker";
import { useStore, STORE } from "../../services/Store";
import { fixture1, fixture2, fixture3, fixture4, fixture5 } from "../../../../common/fixture-lists";
// this needs suspence

const customRoutes: Array<RouteRecordRaw> = [
  {
    path: "/located/:term",
    name: "SearchList",
    component: SearchList,
  },
  {
    path: "/*",
    name: "errorHandler",
    component: UnknownRoute,
  },
];

const meta: Meta<typeof SearchList> = {
  component: SearchList,
  title: "render of Search results",
  decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/all",
    }),
  ],
} satisfies Meta<typeof SearchList>;

export default meta;
type Story = StoryObj<typeof SearchList>;

export const EntirelyPassive: Story = {
  args: {
    currentStateKey: "test30",
    testId: "test30",
  },
};

export const TrackTextRendered: Story = {
  args: {
    currentStateKey: "test31",
    testId: "test31",
    term: "Garibaldi",
    shopStore: STORE,
    route: useRoute(),
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // might need to add .resolves. to expect statements
    expect(canvas.queryByTestId("test31")).toBeVisible();
    expect(canvas.getByRole("button", { name: /Save this/i })).toBeVisible();
    expect(canvas.getByRole("presentation")).toBeVisible(); // the IMG of logo.png
    expect(canvas.getByRole("Search results")).toBeVisible();
    expect(canvas.getByText("Did you enter a previous search query")).toBeVisible();
  },
};

export const TrackTextRendered2: Story = {
  args: {
    currentStateKey: "test32",
    testId: "test32",
    term: "thing",
    shopStore: STORE,
    route: useRoute(),
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // might need to add .resolves. to expect statements
    expect(canvas.queryByTestId("test32")).toBeVisible();
    expect(canvas.getByRole("button", { name: /Save this/i })).toBeVisible();
    expect(canvas.getByRole("presentation")).toBeVisible(); // the IMG of logo.png
    expect(canvas.getByRole("Search results")).toBeVisible();
    expect(canvas.getByText("Did you enter a previous search query")).notToBeVisible();
  },
};

export const TrackTextRendered3: Story = {
  ///////////////////////////////////////////////////////////////////////////////
  render: (args, { loaded }) => {
    // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { SearchList },
      setup() {
        const { currentData, initData, updateData } = ListData;

        return {
          args,
          currentStateKey: "test33",
          testId: "test33",
          shopStore: STORE,
          term: "thing",
          route: useRoute(),
        };
      },
      template: `<SearchList currentStateKey="test33" testId="test33" shopStore="STORE" term="thing" ></SearchList>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture1(), location);
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

    expect(canvas.queryByTestId("test33Results1")).toBeVisible();
    expect(canvas.queryByTestId("test33Results1").children.length).toBeGreaterThan(5);
  },
};
