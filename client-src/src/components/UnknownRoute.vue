<template>
  <div class="unknownRoute" id="unknownRoute" :data-testId="instanceId" :key="currentStateKey">
    <div :data-testid="crossId" class="error" :aria-label="text.crossLabel" v-html="cross"></div>
    <div>
      <p >{{ text.text1 }}</p>
      <p class="bigger">{{ errpath }}</p>
      <p>
        <router-link :to="`${mapURL('allList', null)}`">{{ text.text2 }}</router-link>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
// import { RouterLink, createRouter } from 'vue-router';

import { useStore } from "../services/Store";
import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";

const TEXT = useUIText();
   /**
   * UnknownRoute
   * A component to render bad URLs, with an error mesage
	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @param {string ="**UNKNOWN**"} errpath 
   * @param {string} currentStateKey
   * @public
   * @returns {string} - eventually
   */
export default defineComponent({
  name: "UnknownRoute",
  props: {
    errpath: { type: String, default: "**UNKNOWN**" },
    currentStateKey: { type: String, required: true },
    testId: {type:String, default:"test0" },
  },
  data() {
    let id=this.$props.testId;
    let temp={ mapURL, cross: TEXT.get("cross"), instanceId: id,
              crossId:id+"d1",
               text:{ 
                crossLabel:TEXT.get('unknown.crossLabel'),
                text1:TEXT.get('unknown.text1'), 
                text2:TEXT.get('unknown.text2'),
              }
            };
    return temp;        
  },
  mounted() {
  //  createRouter();
    this.$store = useStore();
    this.$store.commit("setId", -1);
  },
});

</script>
