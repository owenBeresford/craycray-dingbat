<template>
  <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
    <TabBar currentStateKey="tabar1" :testid="tabId" />
    <router-view class="view" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// import { nextId } from "./services/util";
import { TTL_FOR_HELP, DEFAULT_HELP_SHOW } from './Constants';
import TabBar from "./components/TabBar.vue";
 
export default defineComponent({
  name: "ShoppingApp",
  components: { TabBar },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, required:true },
  },
  provide: {
    helpText: "menu",
    canSeeHelp: DEFAULT_HELP_SHOW,
    ttl: TTL_FOR_HELP,
  },
  data() {
// maybe lineup state-keys to show net status in latyer builds    
    return {
      tabId: this.$props.instanceId + "TabBar1",
    };
  },
});
</script>
