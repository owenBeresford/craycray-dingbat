<template>
  <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
    <TabBar currentStateKey="tabar1" :data-testid="tabId" />
    <router-view class="view" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

// import { nextId } from "./services/util";
import { TTL_FOR_HELP, DEFAULT_HELP_SHOW } from "./Constants";
import type { FactoryArtefact } from "./services/DataFactory";
import type { ListCollection } from "./types/ListCollection";
import type { MainAppProps } from "./types/ComponentProps";
import { createDataFactory, ListData, setupCurrentList } from "./services/DataFactory";
import { fixture1 } from "../../common/fixture-lists"; // IOIO

import TabBar from "./components/TabBar.vue";

//IOIO
// const ListData2=setupCurrentList();
const tmp: FactoryArtefact = createDataFactory(fixture1());

// the fixture is alway present, no race condition possible
ListData.updateData(tmp.currentData ?? ({} as ListCollection<string>));

export default defineComponent({
  name: "ShoppingApp",
  components: { TabBar },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, required: true },
  } satisfies MainAppProps,
  provide: {
    helpText: "menu",
    canSeeHelp: DEFAULT_HELP_SHOW,
    ttl: TTL_FOR_HELP,
    dataOnLoad: tmp.currentData.count() > 0,
  },
  data() {
    // maybe lineup state-keys to show net status in latyer builds
    return {
      tabId: this.$props.instanceId + "TabBar1",
    };
  },
});
</script>
