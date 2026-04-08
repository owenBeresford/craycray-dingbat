import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, waitFor, userEvent } from "storybook/test";

import IntersttitialView from "../../components/InterstitialView.vue";
import { isMobile, delay } from "../../services/util";

const meta: Meta<typeof IntersttitialView> = {
  component: IntersttitialView,
  title: "user training screen with IntersttitialView",
} satisfies Meta<typeof IntersttitialView>;

export default meta;
type Story = StoryObj<typeof IntersttitialView>;

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
