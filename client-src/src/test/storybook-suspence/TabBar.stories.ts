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

// the other behaviour is all outbound, need to do an app test, not component test.
