<template>
  <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
    <TabBar currentStateKey="tabar1" :data-testid="tabId" />
    <router-view class="view" />
    <MessageBar :msgs="log" :testId="msgId" :currentStateKey="msgState" :enabled="loggingEnabled" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { TTL_FOR_HELP, DEFAULT_HELP_SHOW, LOGGING_ENABLED } from "./Constants";
import { useLog } from "./services/LogStack";
import type { FactoryArtefact } from "./services/DataFactory";
import type { ListCollection } from "./types/ListCollection";
import type { MainAppProps } from "./types/ComponentProps";
import { createDataFactory, ListData, setupCurrentList } from "./services/DataFactory";
import { fixture1 } from "../../common/fixture-lists"; // IOIO

import TabBar from "./components/TabBar.vue";
import MessageBar from "./components/MessageBar.vue";

//IOIO
// const ListData2=setupCurrentList();
const tmp: FactoryArtefact = createDataFactory(fixture1(), location);

// the fixture is alway present, no race condition possible
ListData.updateData(tmp.currentData ?? ({} as ListCollection<string>));

const log = useLog();

export default defineComponent({
  name: "ShoppingApp",
  components: { TabBar, MessageBar },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, required: true },
  } satisfies MainAppProps,
  provide: {
    helpText: "menu",
    canSeeHelp: DEFAULT_HELP_SHOW,
    ttl: TTL_FOR_HELP,
    dataOnLoad: tmp.currentData.count() > 0,
    log: log,
  },
  data() {
    // IOIO XXX maybe lineup state-keys to show net status in later builds

    return {
      tabId: this.$props.instanceId + "TabBar1",
      msgId: this.$props.instanceId + "Msg1",
      msgState: this.$props.currentStateKey + "Msg1",
      log: log,
      loggingEnabled: LOGGING_ENABLED,
    };
  },
});
</script>
