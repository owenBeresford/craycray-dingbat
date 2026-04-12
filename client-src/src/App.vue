<template>
  <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
    <TabBar currentStateKey="tabar1" :testid="tabId"  />
    <router-view class="view" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { nextId } from "./services/util";
import TabBar from "./components/TabBar.vue";

export default defineComponent({
  name: "App",
  components: { TabBar },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, default: nextId() },
  },
  provide: {
    helpText: "menu",
    canSeeHelp: false,
    ttl: 5000,
  },
  data() {
    return {
      tabId:this.$props.instanceId+"TabBar1",
     };
  },
});
</script>
