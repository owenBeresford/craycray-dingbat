import type { Meta, StoryObj } from "@storybook/vue3-vite";
// import { useArgs } from 'storybook/preview-api';
// import { setup,  } from "@storybook/vue3";
// import { provide } from 'vue';
import { expect, fn, within, waitFor, userEvent } from "storybook/test";

// import { useLog } from "../../services/LogStack";
import InterstitialView from "../../components/InterstitialView.vue";
import { delay } from "../../../../common/util";
import { useStore, STORE } from "../../services/Store.js";

const meta: Meta<typeof InterstitialView> = {
  component: InterstitialView,
  title: "user training screen with InterstitialView",
} satisfies Meta<typeof InterstitialView>;

export default meta;
type Story = StoryObj<typeof InterstitialView>;

export const EntirelyPassive: Story = {
  args: {
    ttl: 0,
    display: "firstUse",
    show: true,
    currentStateKey: "test8",
    testId: "test8",
  },
};

export const Invisible2: Story = {
  args: {
    ttl: 0,
    display: "firstUse",
    show: false,
    currentStateKey: "test9",
    testId: "test9",
  },
};

export const ExpectedRendering2: Story = {
  args: {
    ttl: 0,
    display: "firstUse",
    show: true,
    currentStateKey: "test10",
    testId: "test10",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByTestId("test10")).toBeVisible();
    expect(await canvas.findByText("Hello, this is a shopping list hack, hosted locally on your phone.")).toBeVisible();
    expect(await canvas.findByTestId("test10close1")).toBeVisible();
    expect(((await canvas.findByTestId("test10close1")) as HTMLInputElement).value).toBe("X");
  },
};

export const ExpectedNotRendering: Story = {
  args: {
    ttl: 0,
    display: "firstUse",
    show: false,
    currentStateKey: "test11",
    testId: "test11",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements
    expect((canvasElement.childNodes[0] as Comment).data).toEqual("v-if");
  },
};

export const VanishingRendering: Story = {
  args: {
    ttl: 300,
    display: "firstUse",
    show: true,
    currentStateKey: "test12",
    testId: "test12",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements

    expect(await canvas.getByTestId("test12")).toBeVisible();
    expect(await canvas.getByText("Hello, this is a shopping list hack, hosted locally on your phone.")).toBeVisible();
    expect(await canvas.getByTestId("test12close1")).toBeVisible();
    expect(((await canvas.findByTestId("test12close1")) as HTMLInputElement).value).toBe("X");
    await delay(1000);
    expect((canvasElement.childNodes[0] as Comment).data).toEqual("v-if");
    //   expect( await canvas.getByTestId('test9')).not.toBeVisible();
  },
};

export const RenderingWithButtonEvent: Story = {
  args: {
    ttl: 0,
    display: "firstUse",
    show: true,
    currentStateKey: "test13",
    testId: "test13",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByTestId("test13")).toBeVisible();
    expect(((await canvas.findByTestId("test13close1")) as HTMLInputElement).value).toBe("X");
    // await userEvent.click(canvas.getByRole('button', { name: /X/i }));
    await userEvent.click(canvas.getByRole("button"));
    expect((canvasElement.childNodes[0] as Comment).data).toEqual("v-if");
  },
};

export const VanishingRendering2: Story = {
  args: {
    ttl: 3000,
    display: "firstUse",
    show: true,
    currentStateKey: "test21",
    testId: "test21",
  },

  /*
  render:function(argsFirst ) { 
    const [args, updateArgs, resetArgs] = useArgs();
    //  const [, updateArgs] = useArgs();

    return {
    components: { InterstitialView  },
    setup() {
      const stepBack=()=> { 
        if(stateA < stateB) { 
         updateArgs({ ...argsFirst, show: true, });
         stateA++;
        } 
      };
      return { argsFirst, stepBack };
    },
    template: `<InterstitialView :display="args.display" :show="args.show" :ttl="args.ttl" :currentStateKey="args.currentStateKey" :testId="args.testId" />`
    };
  },
  */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    //  const [args, updateArgs, resetArgs] = useArgs();
    // might need to add .resolves. to expect statements

    expect(await canvas.getByTestId("test21")).toBeVisible();
    expect(((await canvas.findByTestId("test21close1")) as HTMLInputElement).value).toBe("X");
    await userEvent.click(canvas.getByRole("button"));
    await delay(500);
    expect((canvasElement.childNodes[0] as Comment).data).toEqual("v-if");
    // expect(await canvas.findByTestId("test21")).not.toBeVisible();
    await STORE.commit("show", true);

    expect(await canvas.getByTestId("test21")).toBeVisible();
    expect(((await canvas.findByTestId("test21close1")) as HTMLInputElement).value).toBe("X");
    await userEvent.click(canvas.getByRole("button"));
    await delay(500);
    await STORE.commit("show", true);

    //    updateArgs({ ...args, show: true, });
    expect(await canvas.getByTestId("test21")).toBeVisible();
    expect(((await canvas.findByTestId("test21close1")) as HTMLInputElement).value).toBe("X");
    await userEvent.click(canvas.getByRole("button"));
    await delay(500);
  },
};
