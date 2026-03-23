<template>
  <div class="unknownRoute" id="unknownRoute" :data-testid="instanceId" :key="currentStateKey">
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
import { RouterLink, createRouter } from 'vue-router';

import { useStore } from "../services/Store";
import { mapURL } from "../services/URLs";
import { nextId } from "../services/util";
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
   * @return {string} - eventually
   */
export default defineComponent({
  name: "UnknownRoute",
  props: {
    errpath: { type: String, default: "**UNKNOWN**" },
    currentStateKey: { type: String, required: true },
  },
  data() {
    let temp={ mapURL, cross: TEXT.get("cross"), instanceId: nextId(),
              text:{ 
                crossLabel:TEXT.get('unknown.crossLabel'),
                text1:TEXT.get('unknown.text1'), 
                text2:TEXT.get('unknown.text2'),
              }
            };
    temp.crossId=temp.instanceId +"marker";
    return temp;        
  },
  mounted() {
  //  createRouter();
    this.$store = useStore();
    this.$store.commit("setId", -1);
  },
});

</script>
