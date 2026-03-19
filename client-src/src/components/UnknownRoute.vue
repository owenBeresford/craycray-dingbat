<template>
  <div class="unknownRoute" id="unknownRoute" :data-testid="instanceId" :key="currentStateKey">
    <div class="error" v-html="cross"></div>
    <div>
      <p>Unknown URL, did you manually type it?</p>
      <p class="bigger">{{ errpath }}</p>
      <p>
        <router-link :to="`${mapURL('allList', null)}`">Return to a valid URL</router-link>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
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
    return { mapURL, cross: TEXT.get("cross"), instanceId: nextId() };
  },
  mounted() {
    this.$store = useStore();
    this.$store.commit("setId", -1);
  },
});
</script>
