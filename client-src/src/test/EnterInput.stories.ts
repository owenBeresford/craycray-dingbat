import type { Meta, StoryObj } from '@storybook/vue3-vite';
import  {expect, fn, within } from 'storybook/test';

import EnterInput from "../components/EnterInput.vue";
import { isMobile } from "../services/util";

const meta:Meta<typeof EnterInput> = {
  component: EnterInput,
  title: 'simple data capture via EnterInput',
} satisfies Meta<typeof EnterInput>;

export default meta;
type Story = StoryObj<typeof EnterInput>;

export const EntirelyPassive: Story = {
  args: { 
    val: "",
    cb: fn,
    visible: true,
    currentStateKey: "test3",
    testId:"test3",
  },
 };

export const Invisible1: Story = {
  args: { 
    val: "",
    cb: fn,
    visible: false,
    currentStateKey: "test3.5",
    testId:"test3.5",
  },
 };

export const ExpectedRendering: Story = {
  args: {   
    val: "heyyo",
    cb: fn,
    visible: true,
    currentStateKey: "test4",
     testId:"test4",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
 // might need to add .resolves. to expect statements

    expect( await canvas.getByTestId('test4')).toBeVisible();
    expect(await canvas.findByLabelText("Enter your new value: ")).toBeVisible();
    expect(await canvas.findByLabelText('❌')).toBeVisible();
    expect(await canvas.findAllByPlaceholderText("Enter value")).toBeVisible(); 
    expect(await canvas.findAllByText("Set")).toBeVisible();      

    if(isMobile()) {
        expect( await canvas.getByTestId('test4mob1')).toBeVisible(); 
        expect( await canvas.getByTestId('test4desk1')).not.toBeTruthy();
    } else {
        expect( await canvas.getByTestId('test4mob1')).not.toBeTruthy(); 
        expect( await canvas.getByTestId('test4desk1')).toBeVisible(); 
    }
 },
};

export const ExpectedRendering2: Story = {
  args: {   
    val: "heyyo",
    cb: fn,
    visible: true,
    currentStateKey: "test5",
     testId:"test5",
  },

  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
 // might need to add .resolves. to expect statements
    expect( await canvas.getByTestId('test5')).toBeVisible();
      
// check all the functions on the component 
 },
};