import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { vueRouter, asyncVueRouter } from 'storybook-vue3-router';
import type { Decorator, StoryContext } from '@storybook/vue3';
import { createRouter, createMemoryHistory, useRoute, routeLocationKey } from 'vue-router';
import { expect, fn, within, userEvent } from "storybook/test";
import type { NavigationGuard, RouteRecordRaw } from 'vue-router';

import ThisList from "../components/ThisList.vue";
// import type { Store } from "vuex";
import UnknownRoute from "../components/UnknownRoute.vue";
import { STORE } from "../services/Store";
import { createDataFactory, ListData, idOf } from "../services/DataFactory";

import type { TestDataSchema } from "../types/ListCollection";

// https://storybook.js.org/addons/storybook-vue3-router
const customRoutes:Array<RouteRecordRaw>=[
  {
    path: '/list/:index',
    name: 'viewList',
    component: ThisList,
  },
   {
    path: '/*',
    name: 'errorHandler',
    component: UnknownRoute
  },
];

const meta: Meta<typeof ThisList> = {
  component: ThisList,
  title: "a current List, ThisList",
  decorators : [
        vueRouter(customRoutes),
         asyncVueRouter(customRoutes, {
          initialRoute: '/list/2'
                 })
            ],

  /*        
    // https://storybook.js.org/docs/api/arg-types
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
};

export const TrackTextRendered2: Story = {
  render: (args, { loaded }) => {
/*
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/list/:index', component: ThisList },
        { path: '/*', component:UnknownRoute },
      ]
    });

    // Set the route BEFORE mounting
    // index value to match fixture data
    router.push({ 
      path: '/list/1', 
      query: { } 
    });
*/
    // https://router.vuejs.org/api/interfaces/Router.html#isReady-
    return {
    components: { ThisList },
    setup() {
        const { currentData, initData, updateData } = ListData ;

 if(currentData) {
  console.log("KKK Story.render decomposed currentData id:", idOf(currentData));
} 
if( ListData.currentData ) {
  console.log("KKK Story.render ListData.currentData id:", idOf( ListData.currentData));
} 

      return { args, 
                currentStateKey: "test17",
                testId: "test17",
                shopStore: STORE,  
            };
    },
    // inject Suspense, I guess here?
    template: `<ThisList currentStateKey="test17" testId="test17" :shopStore="shopStore" ></ThisList>`, 
    }
  },
  // https://storybook.js.org/docs/writing-stories/loaders
  loaders: [
    () => {
    const { currentData, initData, updateData } = createDataFactory(fixture1());
if(currentData) {
  console.log("KKK Story.loaders[]:: NEW currentData id:", idOf(currentData));
} 
if(ListData.currentData) {
  console.log("KKK Story.loaders[]:: imported currentData id:", idOf(ListData.currentData));
} 
    if(!currentData ) { throw new Error(); }
    ListData.updateData(currentData );

    return {
      currentData,
      shopStore: STORE
    };
  },
    /*
    async () => ({
      currentData: () => { const { currentData, updateData, initData } = createDataFactory(fixture1()); return currentData; },
      shopStore: () => {return STORE; }
    }),
    */
  ],
   play: async ({ canvasElement }) => {
 //   window.history.pushState({}, '/list/2', '');
    const canvas = within(canvasElement);
    const { currentData, initData, updateData } = ListData;
if(ListData.currentData) {
  console.log("KKK Story.play:: imported currentData id:", idOf(ListData.currentData));
} 
if( currentData) {
  console.log("KKK Story.play:: decomposed currentData id:", idOf( currentData));
}

    const list = canvas.getByTestId("test17List1");
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5); // it correctly loads 1st list in fixture

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test17input1")).not.toBeVisible();
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test17input1")).toBeVisible();
    // I shouldnt need to test the enterinput component, as it ha its own test
  },
};




const DISABLED_TrackTextRendered2: Story = {
  args: {
   currentStateKey: "test17",
   testId: "test17",
   shopStore: STORE,  
  },
// https://storybook.js.org/addons/@storybook/addon-queryparams
  parameters: {
    query: {
      index: '1',
    },
  },

  play: async ({ canvasElement }) => {
 /*   
    const { currentData, updateData, initData } = createDataFactory(fixture1());
    if (!currentData) {
      console.log("somehow have no data from inital populate, need to QUIT");
      return;
    }
    console.log("storybook test:", location, currentData.get(0) );
    const mainUpdate = ListData.updateData;
    mainUpdate(currentData); // this means the component-under-test should have data.
   */ 
    const canvas = within(canvasElement);

    const list = canvas.getByTestId("test17List1");
    console.log("EEEEE ", list);
    expect(list).toBeVisible();
    expect(list.childNodes.length).toBe(5); // it correctly loads 1st list in fixture

    // IOIO XXX there is one one list displayed here.  DUMP TEST

    expect(canvas.queryByTestId("test17input1")).not.toBeVisible();
    const btn = canvas.getByRole("button", { name: /Add item/i });
    expect(btn).toBeVisible();
    await userEvent.click(btn);
    expect(canvas.queryByTestId("test17input1")).toBeVisible();
    // I shouldnt need to test that component, as it ha its own test
  },
};

/*
export const TrackTextRendered3: Story = {
  args: {
    currentStateKey: "test18",
    testId: "test18",
    shopStore: STORE,
  },

  play: async ({ canvasElement }) => {
    const { currentData, initData }= createDataFactory(fixture2());
    // somehow overwrite original object in the module
    const canvas = within(canvasElement);
    
    

  },
};

export const TrackTextRendered4: Story = {
  args: {
    currentStateKey: "test19",
    testId: "test19",
    shopStore: STORE,
  },

  play: async ({ canvasElement }) => {
    const { currentData, initData }= createDataFactory(fixture3());
    // somehow overwrite original object in the module
    const canvas = within(canvasElement);
    
    

  },
};

export const TrackTextRendered5: Story = {
  args: {
    currentStateKey: "test20",
    testId: "test20",
    shopStore: STORE,
  },

  play: async ({ canvasElement }) => {
    const { currentData, initData }= createDataFactory(fixture4());
    // somehow overwrite original object in the module
    const canvas = within(canvasElement);
    
    

  },
};
*/

// the other behaviour is all outbound, need to do an app test, not component test.

function fixture1(): Array<TestDataSchema> {
  // good data
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5"],
    } as TestDataSchema,
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 2,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 3,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}

function fixture2(): Array<TestDataSchema> {
  // bad ids
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5"],
    } as TestDataSchema,
    {
      name: "list 2",
      created: new Date(),
      edited: new Date(),
      count: 3,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}

function fixture3(): Array<TestDataSchema> {
  // long list
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5"],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 3,
      list: [
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
        "thing 0",
        "thing 1",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
        "thing 6",
        "thing 7",
        "thing 8",
        "thing 9",
        "thing 10",
        "thing 11",
        "thing 12",
        "thing 13",
        "thing 14",
        "thing 15",
        "thing 16",
        "thing 17",
        "thing 18",
        "thing 19",
      ],
    } as TestDataSchema,
  ];
}

function fixture4(): Array<TestDataSchema> {
  // very long item
  return [
    {
      name: "list 1",
      created: new Date(),
      edited: new Date(),
      count: 5,
      id: 1,
      list: [
        "thing 1 fgdh dhsh sfhs hsfh shsfhsfgh sghs fgh sghsfgh hsfhsf hsfh sfhsf hsfh sghsghs hdgj gkfg kjd gjdgj dj sj",
        "thing 2",
        "thing 3",
        "thing 4",
        "thing 5",
      ],
    } as TestDataSchema,
    {
      name: "list 3",
      created: new Date(),
      edited: new Date(),
      count: 10,
      id: 3,
      list: ["thing 1", "thing 2", "thing 3", "thing 4", "thing 5", "thing 6", "thing 7", "thing 8", "thing 9"],
    } as TestDataSchema,
  ];
}
