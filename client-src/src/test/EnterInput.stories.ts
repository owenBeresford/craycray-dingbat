import type { Meta, StoryObj } from '@storybook/vue3-vite';
import  {expect, fn, within } from 'storybook/test';

// import  {expect, fn, userEvent, within } from 'storybook/test';
// import { expect, assert, it, describe } from 'vitest';
// import {within} from '@testing-library/dom'
// import { screen, fireEvent } from '@testing-library/vue';

import EnterInput from "../components/EnterInput.vue";
import { isMobile, nextId } from "../services/util";

const meta:Meta<typeof EnterInput> = {
  component: EnterInput,
  title: 'simple data capture via EnterInput',
} satisfies Meta<typeof EnterInput>;

export default meta;
type Story = StoryObj<typeof EnterInput>;

export const EntirelyPassive: Story = {
  args: {   // this is obj1 or obj3
    val: "",
    cb: fn,
    visible: true,
    currentStateKey: "test3"
  },
};

export const ExpectedRendering: Story = {
  args: {  // this is obj2 or obj4
    val: "heyyo",
    cb: fn,
    visible: true,
    currentStateKey: "test4"
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
 // might need to add .resolves. to expect statements

    expect( await canvas.getByTestId('obj4')).toBeVisible();
    expect(await canvas.findByLabelText("Enter your new value: ")).toBeVisible();
    expect(await canvas.findByLabelText('❌')).toBeVisible();
    expect(await canvas.findAllByPlaceholderText("Enter value")).toBeVisible(); 
    expect(await canvas.findAllByText("Set")).toBeVisible();      

    if(isMobile()) {
 // add inputevents
    } else {

    }
 },
};