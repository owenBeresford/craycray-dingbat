<template>
  <div id="theFail" class="failOverContainer" :data-testid="testId" :key="currentStateKey">
    <h3>Existing lists have not been found yet.</h3>
    <p>
      Please <strong>do not refresh</strong> the page as this will not help access your local server. This App does
      actively attempt to get data and be useful.
    </p>

    <p>Returning to the <router-link class="button" :to="linkAll"> catalogue screen</router-link> may have data.</p>
    <p v-if="id">
      Alternatively you where previously on
      <router-link class="button" :to="singleListURL"> a list edit screen</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import type { Ref } from "vue";

import {mapURL } from '../services/URLs';
import { extractId } from "../services/util";

export default defineComponent({
  name: "Failover",
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    id: { type: Number, default: 0 },  // Default is flag value.  0 is not a valid id.
  },
  data() {
    const itinéraire: RouteLocationNormalizedLoadedGeneric = useRoute();
    let id=0;
    if(this.$props.id) { 
        id=this.$props.id; 
    } else if(itinéraire.name === "a-list") {
      if(itinéraire.params.index>=1) {
        id=extractId(itinéraire.params.index);
      }
    }

    return {
      linkAll: mapURL("allList", null),
      singleListURL: mapURL('aList', id),
    };
  },

});
</script>
