import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect, fn, within, waitFor, userEvent } from "storybook/test";
import { TEST_LOCATION_URL } from "../../Constants";

const meta: Meta = {
  title: "in browser test for CORs headers",
  parameters: {
    layout: "centered",
    controls: { disable: true },
    docs: { disable: true },
  },
} satisfies Meta;
export default meta;

// runCORSameHost
// launch server, open TEST_LOCATION_URL+"/?cors-test=1", read JS console for assert statememts

export const runCORSdifferentHost: StoryObj = {
  render: () => ({
    template: `<iframe
          id="test-frame"
          src="${TEST_LOCATION_URL}"
          style="width:100%; height:600px; border:3px solid #ccc;"
        ></iframe>
    
    
    <div>{{ result }}</div>`,
    data() {
      return { result: " ✔ No sync tests" };
    },
    async mounted() {
      const frame: HTMLIFrameElement = document.getElementById("test-frame") as HTMLIFrameElement;
      try {
        let RET = await window.fetch(TEST_LOCATION_URL + "/asset/shopping.es.min.mjs");
        let result: string = " ✔ All async test items passed";
        if (!RET.ok) {
          result = "❌ Asset '" + TEST_LOCATION_URL + "/asset/shopping.es.min.mjs' can NOT d/l to 3rd party client";
        }
        if (!(await RET.text())) {
          result = "❌ Asset '" + TEST_LOCATION_URL + "/asset/shopping.es.min.mjs' can NOT d/l to 3rd party client";
        }

        /*
   // looking at headers doesnt work, and doesnt actually add value to the data user
    @see https://fetch.spec.whatwg.org/#concept-filtered-response-cors
    @see https://fetch.spec.whatwg.org/#http-access-control-expose-headers 

    else if(! RET.headers.get('Access-Control-Allow-Origin') ) {
       result=  "❌ Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' has Access-Control-Allow-Origin = "+RET.headers.get('Access-Control-Allow-Origin');

    } else if ( RET.headers.get('Access-Control-Request-Method') ) { 
       result=  "❌ Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' has Access-Control-Request-Method = "+RET.headers.get('Access-Control-Request-Method');
    } else if (RET.headers.get('Access-Control-Allow-Headers') ) {
        result= "❌ Asset '"+TEST_LOCATION_URL+"/asset/shopping.es.min.mjs' Access-Control-Allow-Headers = "+RET.headers.get('Access-Control-Allow-Headers');
    }
    */
        this.result += "<br /> " + result;
      } catch (err: unknown) {
        this.result += "<br /> ❌ Test failed: " + (err as Error).message;
      }
    },
  }),
};
