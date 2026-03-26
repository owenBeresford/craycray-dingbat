import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, userEvent } from "storybook/test";

import TabBar from "../components/TabBar.vue";

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
    // might need to add .resolves. to expect statements
    expect(canvas.queryByTestId("test15menu1")).not.toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /☰/i }));
    expect(canvas.queryByRole("button", { name: /❌/i })).toBeVisible();
    expect(canvas.queryByTestId("test15menu1")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /❌/i }));
    expect(canvas.queryByRole("button", { name: /☰/i })).toBeVisible();
    expect(canvas.queryByTestId("test15menu1")).not.toBeVisible();
  },
};

// the other behaviour is all outbound, need to do an app test, not component test.
