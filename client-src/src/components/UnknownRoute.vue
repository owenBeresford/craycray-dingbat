<template>
  <div class="unknownRoute" id="unknownRoute" :data-testId="instanceId" :key="currentStateKey">
    <div :data-testid="crossId" class="error" :aria-label="text.crossLabel" v-html="cross"></div>
    <div>
      <p>{{ text.text1 }}</p>
      <p class="bigger">{{ errpath }}</p>
      <p>
        <router-link :to="`${mapURL('allList', null)}`">{{ text.text2 }}</router-link>
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

import { useStore } from "../services/Store";
import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";
import { EMPTY_LIST_ID } from '../Constants';
import type { UnknownRouteStaticData, UnknownRouteProps } from "../types/ComponentProps";

const TEXT = useUIText();
/**
   * UnknownRoute
   * A component to render bad URLs, with an error mesage
   * 
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
    testId: { type: String, default: "test0" },
  } as UnknownRouteProps,
  data(): UnknownRouteStaticData {
    let id = this.$props.testId;
    return {
      mapURL,
      store: useStore(),
      cross: TEXT.get("cross"),
      instanceId: id,
      crossId: id + "d1",
      text: {
        crossLabel: TEXT.get("unknown.crossLabel"),
        text1: TEXT.get("unknown.text1"),
        text2: TEXT.get("unknown.text2"),
      },
    } satisfies UnknownRouteStaticData;
  },
  mounted() {
    //  createRouter();
    this.store.commit("setId", EMPTY_LIST_ID);
  },
});
</script>
