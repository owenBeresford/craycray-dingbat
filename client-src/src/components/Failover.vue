<template>
  <div id="theFail" class="failOverContainer" :data-testid="testId" :key="currentStateKey">
    <h3>Existing lists have not been found yet.</h3>
    <p>
      Please <strong>do not refresh</strong> the page as this will not help access your local server. This App does
      actively attempt to get data and be useful.
    </p>

    <p>Returning to the <router-link class="button" :to="linkAll"> catalogue screen</router-link> may have data.</p>
    <p v-if="id">
      Alternatively you where previolusly on
      <router-link class="button" :to="singleListURL"> catalogue screen</router-link>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import type { Ref } from "vue";

export default defineComponent({
  name: "Failover",
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    id: { type: String, default: "" },
  },
  data() {
    return {
      linkAll: "/list-all",
    };
  },

  computed: {
    singleListURL(): string {
      return "/list-" + this.$props.id;
    },
  },
});
</script>
