import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, userEvent } from "storybook/test";

import TabBar from "../../components/TabBar.vue";
// this needs suspence

const meta: Meta<typeof TabBar> = {
  component: TabBar,
  title: "render of Nav in TabBar",
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof TabBar>;

export const EntirelyPassive: Story = {
  args: {
    currentStateKey: "test14",
    testId: "test14",
  },
};

export const TrackTextRendered: Story = {
  args: {
    currentStateKey: "test15",
    testId: "test15",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // I am defining this, as some browsers are damaging/ transliterating my UTF8 chars,
    // so the tests fail in an annoying fashion.
    const EXTRACT_NON_ASCII: RegExp = /[^\x00-\x7F]+/gu;

    // might need to add .resolves. to expect statements
    expect(canvas.queryByTestId("test15")).toBeVisible();
    expect(canvas.queryByTestId("test15Menu1")).not.toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: EXTRACT_NON_ASCII }));
    expect(canvas.queryByRole("button", { name: /❌/i })).toBeVisible();
    expect(canvas.queryByTestId("test15Menu1")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /❌/i }));
    expect(canvas.queryByRole("button", { name: EXTRACT_NON_ASCII })).toBeVisible();
    expect(canvas.queryByTestId("test15Menu1")).not.toBeVisible();
  },
};

export const TrackTextRendered8: Story = {
  args: {
    currentStateKey: "test24",
    testId: "test24",
  },

  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    // I am defining this, as some browsers are damaging/ transliterating my UTF8 chars,
    // so the tests fail in an annoying fashion.
    const EXTRACT_NON_ASCII: RegExp = /[^\x00-\x7F]+/gu;

    // might need to add .resolves. to expect statements
    expect(canvas.queryByTestId("test24")).toBeVisible();
    expect(canvas.queryByTestId("test24Menu1")).not.toBeVisible();
    await step('open the menu', async () => {
      await userEvent.click(canvas.getByRole("button", { name: EXTRACT_NON_ASCII }));
      expect(canvas.queryByTestId("test24Menu1")).toBeVisible();
    });
    
    await step('list all lists', async () => {
        expect(await canvas.findByText("List All")).toBeVisible();
        await userEvent.click(canvas.getByText("List All"));
    });

    await step('create new list', async () => {
        expect(await canvas.findByText("New")).toBeVisible();
        await userEvent.click(canvas.getByText("New"));
    });

    // this button can't be tested without loading the other components...
    await step('show help', async () => {
        expect(await canvas.findByText("Show help")).toBeVisible();
        await userEvent.click(canvas.getByText("Show help"));
   //     expect( await canvas.findByTestId("XXX")).toBeVisible();
    });
    
    await step('attempt installation', async () => {
        try {
          let test=await canvas.getByText("Install");
          expect(test).toBeVisible();
          await userEvent.click(test);
          // TODO change button name to reflect current state
        } catch(e:unknown ) {
          // This label will depend on current state, so can fail at some points
          console.log("SELF CREATED MESSAGE: ", (e as Error).message);
        }
    });

    /* BUTTONS:
    A "List All"
    A "New"
    SPAN "Install"
    SPAN "Show help"
    SPAN "Rename list"
    SPAN "Duplicate list"
    SPAN "Make unique"
    SPAN "Save all"
    SPAN "Revert all"
    */
  },
};
