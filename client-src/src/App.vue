<template>
<ErrorBoundary>
<Suspense :key="currentStateKey">
  <template #default>
      <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
        <TabBar currentStateKey="tabar1" :data-testid="tabId" />
        <router-view class="view" />
        <MessageBar :msgs="log" :testId="msgId" :currentStateKey="msgState" :enabled="loggingEnabled" />
      </div>
  </template>

  <template #fallback>
    <h3 >Data still is loading. Pls hold.</h3>
  </template>
</Suspense>
</ErrorBoundary>
</template>

<script lang="ts">
import { defineComponent, ErrorBoundary, Suspense, provide } from "vue";
import { useRoute } from 'vue-router';

import { TTL_FOR_HELP, DEFAULT_HELP_SHOW, LOGGING_ENABLED } from "./Constants";
import { useLog } from "./services/LogStack";
import type { FactoryArtefact } from "./services/DataFactory";
import type { MainAppProps, MainAppStaticData, MainAppSetup } from "./types/ComponentProps";
import {  currentNetworkConfig, createEmptyFactory } from "./services/DataFactory";

import TabBar from "./components/TabBar.vue";
import MessageBar from "./components/MessageBar.vue";


export default defineComponent({
  name: "ShoppingApp",
  components: { TabBar, MessageBar, ErrorBoundary, Suspense },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, required: true },
  } satisfies MainAppProps,
 
  data():MainAppStaticData { 
    // IOIO XXX maybe lineup state-keys to show net status in later builds
    return {
      tabId: this.$props.instanceId + "TabBar1",
      msgId: this.$props.instanceId + "Msg1",
      msgState: this.$props.currentStateKey + "Msg1",
      loggingEnabled: LOGGING_ENABLED,
    } satisfies MainAppStaticData;
  },

  async setup():Promise<MainAppSetup>  {
    // need a further patch, as now double creating the networky things
    const data: FactoryArtefact = createEmptyFactory( );
    await currentNetworkConfig(location, data);
    provide('helpText', "menu");
    provide('canSeeHelp',  DEFAULT_HELP_SHOW);
    provide('ttl', TTL_FOR_HELP);
    provide('dataOnLoad', data.currentData.count() > 0);
    provide('listData', data); 
    
    return { 
      data:data, 
      log: useLog(),
     } satisfies MainAppSetup ;
  }
});
</script>
