import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {expect, within } from 'storybook/test';

import UnknownRoute from "../components/UnknownRoute.vue";

const meta:Meta<typeof UnknownRoute> = {
  component: UnknownRoute,
  title: 'error catching in UnknownRoute',
//  argTypes: {   backgroundColor: { control: 'color' },   },  
} satisfies Meta<typeof UnknownRoute>;

export default meta;
type Story = StoryObj<typeof UnknownRoute>;

export const EntirelyPassive: Story = {
  args: {   // this is obj1
    currentStateKey:"test1",
    errpath:"/spam-for-me",
    testId:"test1",
  },
};

export const ExpectedRendering: Story = {
  args: {  // this is obj2
    currentStateKey:"test2",
    errpath:"/spam-for-me",
    testId:"test2",
  },

// this test has no behaviour, its just a static report
    play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
 // might need to add .resolves. to expect statements if they are slow to run

    const flakey1 = await canvas.getByTestId('test2d1');
    expect(flakey1).toHaveClass('error');
    expect(await canvas.findByLabelText('❌')).toBeVisible();
    // expect(flakey1).queryByText("❌").toBeInTheDocument();

    expect(await canvas.findAllByText('Return to a valid URL')).toBeVisible();
    // IOIO get relevant aria attribs...
    expect(await canvas.findAllByText("/spam-for-me")).toBeVisible();
    expect(await canvas.findAllByText("/spam-for-me")).toHaveClass('bigger');

 },
};


