import { expect, fn, within, userEvent } from "storybook/test";
import { vueRouter, asyncVueRouter } from "storybook-vue3-router";
import type { Meta, StoryObj } from "@storybook/vue3-vite";
// import type { Decorator, StoryContext } from "@storybook/vue3";
import type { NavigationGuard, RouteRecordRaw, RouteLocationNormalizedLoadedGeneric } from "vue-router";

import ListOfLists from "../../components/ListOfLists.vue";
import UnknownRoute from "../../components/UnknownRoute.vue";
import { STORE } from "../../services/Store";
import { createDataFactory, idOf } from "../../services/DataFactory";
import { fixture1, fixture2, fixture3, fixture4 } from "../../../../common/fixture-lists";
// this needs suspence

const PASSBACK = (a: number): void => {};
// https://github.com/storybookjs/storybook/blob/a3cdabb025524822807318bc137f69be006596c2/docs/snippets/web-components/api-doc-block-story-parameter.ts.mdx#L17
// https://storybook.js.org/addons/storybook-vue3-router
const customRoutes: Array<RouteRecordRaw> = [
  {
    path: "/list/all",
    name: "viewList",
    component: ListOfLists,
  },
  {
    path: "/*",
    name: "errorHandler",
    component: UnknownRoute,
  },
];

const meta: Meta<typeof ListOfLists> = {
  component: ListOfLists,
  title: "The lists ListOfLists",
  decorators: [
    vueRouter(customRoutes),
    asyncVueRouter(customRoutes, {
      initialRoute: "/list/all",
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
} satisfies Meta<typeof ListOfLists>;

export default meta;
type Story = StoryObj<typeof ListOfLists>;

export const EntirelyPassive: Story = {
  args: {
    currentStateKey: "test22",
    testId: "test2",
    shopStore: STORE,
    fixPath: (a: unknown) => {
      return;
    },
  },
};

let OVERRIDE = (a: RouteLocationNormalizedLoadedGeneric) => {
  return;
};
export const TrackTextRendered6: Story = {
  //////////////////////////////////////////////////////////////////////////////
  // https://github.com/storybookjs/storybook/blob/a3cdabb025524822807318bc137f69be006596c2/docs/snippets/web-components/api-doc-block-story-parameter.ts.mdx#L17
  /*
  parameters: {
    docs: {
      story: { autoplay: true },
    },
  },
  */
  ///////////////////////////////////////////////////////////////////////////////
  render: (args, { loaded }) => {
    // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
      components: { ListOfLists },
      setup() {
        return {
          args,
          currentStateKey: "test23",
          testId: "test23",
          shopStore: STORE,
          fixPath: fn(),
        };
      },
      template: `<ListOfLists currentStateKey="test23" testId="test23" :shopStore="shopStore" :fixPath={fn} ></ListOfLists>`,
    };
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
      const { currentData, initData, updateData } = createDataFactory(fixture1(), location, PASSBACK);
      if (currentData ) {
        console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
      }

      if (!currentData) {
        throw new Error();
      }

      return {
        currentData,
        shopStore: STORE,
      };
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = createDataFactory(fixture1(), location, PASSBACK);
    if (currentData ) {
      console.log("KKK Story.play:: decomposed currentData id:", idOf(currentData));
    }

    const list = await canvas.findByTestId("test23List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(3 + 2); // it correctly loads 1st list in fixture
    // the +2 is due to two textnodes

    // I shouldnt need to test the enterinput component, as it has its own test
  },
};
