import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, userEvent } from "storybook/test";

import TabBar from "../../components/TabBar.vue";
import { ListData, createDataFactory } from "../../services/DataFactory";
import { CacheWrapper } from '../../workers/InstallWorker';
import { useStore } from "../../services/Store";
import { fixture1, fixture2, fixture3, fixture4, fixture5 } from "../fixture-lists";
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
    expect(canvas.queryByRole("button", { name: EXTRACT_NON_ASCII })).toBeVisible();
    expect(canvas.queryByTestId("test15Menu1")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: EXTRACT_NON_ASCII }));
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
        // Story may break here
    });

    await step('create new list', async () => {
        expect(await canvas.findByText("New")).toBeVisible();
        await userEvent.click(canvas.getByText("New"));
        // Story may break here
    });

    // this button can't be tested without loading the other components...
    await step('Show help', async () => {
        const STORE=useStore(); 
      
        expect(await canvas.findByText("Show help")).toBeVisible();
        expect(STORE.state.showHelp).toBe(false);
        await userEvent.click(canvas.getByText("Show help"));
        expect(STORE.state.showHelp).toBe(true);
   //     expect( await canvas.findByTestId("XXX")).toBeVisible();
   // interstitial not in navbar itself, so cannot trigger anything just here 
    });
    
    await step('attempt installation', async () => {
        try {
          let test=await canvas.getByText("Install");
          expect(test).toBeVisible();
          expect(await CacheWrapper.isInstalled()).toBe(false);
          await userEvent.click(test);
          expect(await CacheWrapper.isInstalled()).toBe(true);
             
          // TODO change button name to reflect current state
        } catch(e:unknown ) {
          // This label will depend on current state, so can fail at some points
          console.log("SELF CREATED MESSAGE: ", (e as Error).message);
        }
    });

    await step('Rename list', async () => {
        expect(await canvas.findByText("Rename list")).toBeVisible();
        const NEWDATA= createDataFactory(fixture2());
        if(!NEWDATA.currentData) { throw new Error("No data found after fixture loaded??"); }
      
        const liste1 = NEWDATA.currentData.get(1);
        expect( liste1?.nom).toBe( "list 1");
     //   let image=liste1?.nom;
        await userEvent.click(canvas.getByText("Rename list"));
        expect( liste1?.nom).not.toBe( "list 1");
   //     expect( await canvas.findByTestId("XXX")).toBeVisible();
     });

    await step('Duplicate list', async () => {
        expect(await canvas.findByText("Duplicate list")).toBeVisible();
        const NEWDATA= createDataFactory(fixture2());
        if(!NEWDATA.currentData) { throw new Error("No data found after fixture loaded??"); }
        let before=NEWDATA.currentData.count();

        await userEvent.click(canvas.getByText("Duplicate list"));
        expect( NEWDATA.currentData.count() - before).toBe(1);
    });
    
    await step('Make unique', async () => {
        expect(await canvas.findByText("Make unique")).toBeVisible();
        const NEWDATA= createDataFactory(fixture5());
        const STORE=useStore(); 
        if(!NEWDATA.currentData) { throw new Error("No data found after fixture loaded??"); }
        STORE.setId(1);

        let before=NEWDATA.currentData.get(1)?.export();
        await userEvent.click(canvas.getByText("Make unique"));
        expect( before!.length ).toBeGreaterThan( NEWDATA.currentData.get(1)!.export().length );

    });

   await step('Save all', async () => {
        expect(await canvas.findByText("Save all")).toBeVisible();  
        // TODO: need to extend this one 
   });

   await step('Revert all', async () => {
        expect(await canvas.findByText("Revert all")).toBeVisible();    
        // TODO: need to extend this one 
   });
   
  },
};
