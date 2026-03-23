import type { Meta, StoryObj } from '@storybook/vue3-vite';
import  {expect, within } from 'storybook/test';
// import  {expect, fn, userEvent, within } from 'storybook/test';
// import { expect, assert, it, describe } from 'vitest';
// import {within} from '@testing-library/dom'
// import { screen, fireEvent } from '@testing-library/vue';

import UnknownRoute from "../components/UnknownRoute.vue";

/*
I can import
- storybook/test       ~ this doesnt exist in the correct version, but due to monorepo is present in the samples so I'm using it. 
- vue/test-util        ~ should work with Vue without issue :-)
- testing-library/dom  ~ as it links well with other tools, and is easy to use
- playwright/???       ~ as storybook uses these libs.

*/
const meta:Meta<typeof UnknownRoute> = {
  component: UnknownRoute,
  title: 'error catching in UnknownRoute',
} satisfies Meta<typeof UnknownRoute>;

export default meta;
type Story = StoryObj<typeof UnknownRoute>;

export const EntirelyPassive: Story = {
  args: {   // this is obj1
    currentStateKey:"test1",
    errpath:"/spam-for-me",
  },
};

export const ExpectedRendering: Story = {
  args: {  // this is obj2
    currentStateKey:"test2",
    errpath:"/spam-for-me",
  },

// this test has no behaviour, its just a static report
    play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
 // might need to add .resolves. to expect statements if they are slow to run

    const flakey1 = await canvas.getByTestId('obj2');
    expect(flakey1).toHaveClass('error');
    expect(await canvas.findByLabelText('❌')).toBeVisible();
    // expect(flakey1).queryByText("❌").toBeInTheDocument();

    expect(await canvas.findAllByText('Return to a valid URL')).toBeVisible();
    // IOIO get relevant aria attribs...
    expect(await canvas.findAllByText("/spam-for-me")).toBeVisible();
    expect(await canvas.findAllByText("/spam-for-me")).toHaveClass('bigger');

 },
};

// export const AllActionsRunning: Story =

/* DOCS for storybook/test are weak.   Move this to better location
*** Expect allows ***  (I think uses testing-library features)
length: 0
name: "expect" 
__originalFn__: function expect4(value, message)
any: Proxy { <target>: methodWrapper(), <handler>: {…} }
anything: function key(args)
arrayContaining: function key(args)
assertions: function key(args)
closeTo: function key(args)
extend: function key(args)
fail: function key(args)
getState: function key(args)
hasAssertions: function key(args)
not: Object { stringContaining: key(args), objectContaining: key(args), arrayContaining: key(args), … }
objectContaining: function key(args)
setState: function key(args)
soft: function key(args)
stringContaining: function key(args)
stringMatching: function key(args)
toAppearAfter: function key(args)
toAppearBefore: function key(args)
toBeChecked: function key(args)
toBeDisabled: function key(args)
toBeEmpty: function key(args)
toBeEmptyDOMElement: function key(args)
toBeEnabled: function key(args)
toBeInTheDOM: function key(args)
toBeInTheDocument: function key(args)
toBeInvalid: function key(args)
toBeOneOf: function key(args)
toBePartiallyChecked: function key(args)
toBePartiallyPressed: function key(args)
toBePressed: function key(args)
toBeRequired: function key(args)
toBeValid: function key(args)
toBeVisible: function key(args)
toContainElement: function key(args)
toContainHTML: function key(args)
toHaveAccessibleDescription: function key(args)
toHaveAccessibleErrorMessage: function key(args)
toHaveAccessibleName: function key(args)
toHaveAttribute: function key(args)
toHaveClass: function key(args)​
toHaveDescription: function key(args)
toHaveDisplayValue: function key(args)
toHaveErrorMessage: function key(args)
toHaveFocus: function key(args)
toHaveFormValues: function key(args)
toHaveRole: function key(args)
toHaveSelection: function key(args)
toHaveStyle: function key(args)
toHaveTextContent: function key(args)
toHaveValue: function key(args)
toSatisfy: function key(args)
unreachable: function key(args)

**** canvas allows **** (uses playwright)
findAllByAltText: function key(args)
findAllByDisplayValue: function key(args)
findAllByLabelText: function key(args)
findAllByPlaceholderText: function key(args)
findAllByRole: function key(args)
findAllByTestId: function key(args)
findAllByText: function key(args)
findAllByTitle: function key(args)
findByAltText: function key(args)
findByDisplayValue: function key(args)
findByLabelText: function key(args)
findByPlaceholderText: function key(args)
findByRole: function key(args)
findByTestId: function key(args)
findByText: function key(args)
findByTitle: function key(args)
getAllByAltText: function key(args)
getAllByDisplayValue: function key(args)
getAllByLabelText: function key(args)
getAllByPlaceholderText: function key(args)
getAllByRole: function key(args)
getAllByTestId: function key(args)
getAllByText: function key(args)
getAllByTitle: function key(args)
getByAltText: function key(args)
getByDisplayValue: function key(args)
getByLabelText: function key(args)
getByPlaceholderText: function key(args)
getByRole: function key(args)
getByTestId: function key(args)
getByText: function key(args)
getByTitle: function key(args)
queryAllByAltText: function key(args)
queryAllByDisplayValue: function key(args)
queryAllByLabelText: function key(args)
queryAllByPlaceholderText: function key(args)
queryAllByRole: function key(args)
queryAllByTestId: function key(args)
queryAllByText: function key(args)
queryAllByTitle: function key(args)
queryByAltText: function key(args)
queryByDisplayValue: function key(args)
queryByLabelText: function key(args)
queryByPlaceholderText: function key(args)
queryByRole: function key(args)
queryByTestId: function key(args)
queryByText: function key(args)
queryByTitle: function key(args)

*/

