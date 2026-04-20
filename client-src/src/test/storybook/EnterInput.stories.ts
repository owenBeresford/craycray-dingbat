import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, userEvent } from "storybook/test";

import EnterInput from "../../components/EnterInput.vue";
import { isMobile } from "../../../../common/util";

const meta: Meta<typeof EnterInput> = {
  component: EnterInput,
  title: "simple data capture via EnterInput",
} satisfies Meta<typeof EnterInput>;

export default meta;
type Story = StoryObj<typeof EnterInput>;

const CB1=fn(function() {} );
export const EntirelyPassive: Story = {
  args: {
    val: "",
    cb: CB1,
    visible: true,
    currentStateKey: "test3",
    testId: "test3",
  },
};

export const Invisible1: Story = {
  args: {
    val: "",
    cb: CB1,
    visible: false,
    currentStateKey: "test3.5",
    testId: "test3.5",
  },
};

export const ExpectedRendering: Story = {
  args: {
    val: "heyyo",
    cb: CB1,
    visible: true,
    currentStateKey: "test4",
    testId: "test4",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements

    expect(await canvas.getByTestId("test4")).toBeVisible();
    expect(await canvas.findByText("Enter your new value:")).toBeVisible();
    expect(await canvas.queryByText(/new value:/)).toBeVisible();
    expect(await canvas.queryByText(/❌/)).toBeVisible();
    expect(await canvas.findByPlaceholderText("Enter value")).toBeVisible();
    expect(await canvas.findByText("Set")).toBeVisible();

    if (isMobile()) {
      expect(await canvas.getByTestId("test4mob1")).toBeVisible();
      expect(await canvas.queryByTestId("test4desk1")).not.toBeTruthy();
    } else {
      expect(await canvas.getByTestId("test4desk1")).toBeVisible();
      expect(await canvas.queryByTestId("test4mob1")).not.toBeTruthy();
    }
  },
};

export const ExpectedRendering2: Story = {
  args: {
    val: "heyyo",
    cb: CB1,
    visible: false,
    currentStateKey: "test5",
    testId: "test5",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements
    expect(canvas.getByTestId("test5")).toBeVisible();

    canvas.getByTestId("test5cancel1").click();
    expect((canvas.queryByTestId("test5") as HTMLDialogElement).open).not.toBeTruthy();
    // edit visible if possible...
  },
};

export const ExpectedRendering3: Story = {
  args: {
    val: "",
    cb: CB1,
    visible: true,
    currentStateKey: "test6",
    testId: "test6",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements
    expect(await canvas.getByTestId("test6")).toBeVisible();
    if (isMobile()) {
      return;
    } // TEST ABORT HERE, as MOBILE

    // https://markaicode.com/storybook-interaction-tests/#
    const input1 = canvas.getByTestId("test6desk1");
    await userEvent.type(input1, "a new thing");
    await userEvent.click(await canvas.findByDisplayValue("Set"));

    expect((canvas.queryByTestId("test6") as HTMLDialogElement).open).not.toBeTruthy();
    expect(await canvas.queryByTestId("test6")).not.toBeTruthy();
  },
};

export const ExpectedRendering4: Story = {
  args: {
    val: "",
    cb: CB1,
    visible: true,
    currentStateKey: "test7",
    testId: "test7",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements
    expect(await canvas.getByTestId("test7")).toBeVisible();
    if (!isMobile()) {
      return;
    } // TEST ABORT HERE, as NOT MOBILE

    // https://markaicode.com/storybook-interaction-tests/#
    const input1 = canvas.getByTestId("test7mob1");
    await userEvent.type(input1, "a new thing");
    await userEvent.click(await canvas.findByDisplayValue("Set"));

    expect(((await canvas.queryByTestId("test7")) as HTMLDialogElement).open).toBe( false);
  },
};

export const ToggleCapacity1: Story = {
  args: {
    val: "test1",
    cb: CB1,
    visible: true,
    currentStateKey: "test25",
    testId: "test25",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // might need to add .resolves. to expect statements
    expect(await canvas.getByTestId("test25")).toBeVisible();
    if (isMobile()) {
      return;
    } 

    // https://markaicode.com/storybook-interaction-tests/#
    const input1 = canvas.getByTestId("test25desk1");
    await userEvent.type(input1, "a new thing");
    await userEvent.click( await canvas.findByDisplayValue("Set"));

    expect(((await canvas.queryByTestId("test25")) as HTMLDialogElement).open).toBe(false);
    (await canvas.queryByTestId("test25") as HTMLDialogElement).open=true;
    await userEvent.type(input1, "another thing");
    await userEvent.click( await canvas.findByDisplayValue("Set"));
    expect(((await canvas.queryByTestId("test25")) as HTMLDialogElement).open).toBe(false);
    (await canvas.queryByTestId("test25") as HTMLDialogElement).open=true;
    await userEvent.type(input1, "keep going");
    await userEvent.click( await canvas.findByDisplayValue("Set"));
    expect(((await canvas.queryByTestId("test25")) as HTMLDialogElement).open).toBe(false);
  },
};


// IOIO XXX add test for open/close multiple times
