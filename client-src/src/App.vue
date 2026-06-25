<template>
  <VErrorBoundary
    :fall-back="safeFailover"
    :params="{ testid: 'eb-failOver1', currentStateKey: currentStateKey }"
    stop-propagation
  >
    <Suspense :key="currentStateKey">
      <template #default>
        <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
          <TabBar currentStateKey="tabar1" :data-testid="tabId" />
          <router-view class="view" />
          <MessageBar :msgs="log" :testId="msgId" :currentStateKey="msgState" :enabled="loggingEnabled" />
        </div>
      </template>

      <template #fallback>
        <h3 data-testId="suspense-fallback1">Data still is loading. Pls hold.</h3>
      </template>
    </Suspense>
  </VErrorBoundary>
</template>

<script lang="ts">
import { defineComponent, Suspense, shallowRef } from "vue";
import VErrorBoundary from "vue-error-boundary";

import { TTL_FOR_HELP, DEFAULT_HELP_SHOW, LOGGING_ENABLED } from "./Constants";
import { useLog } from "./services/LogStack";
import type { MainAppProps, MainAppStaticData } from "./types/ComponentProps";

import TabBar from "./components/TabBar.vue";
import MessageBar from "./components/MessageBar.vue";
import Failover from "./components/Failover.vue";

/**
   * ShoppingApp
   * A component to render the vue features

	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.
   * @param {string} instanceId
   * @param {string} currentStateKey
   * @public
   * @returns {string} - after rendering :-)
   */
export default defineComponent({
  name: "ShoppingApp",
  components: { TabBar, MessageBar, VErrorBoundary, Suspense, Failover },
  props: {
    currentStateKey: { type: String, default: "root1" },
    instanceId: { type: String, required: true },
  } satisfies MainAppProps,

  data(): MainAppStaticData {
    // IOIO XXX maybe lineup state-keys to show net status in later builds
    return {
      //  fallBack: Failover,
      log: useLog(),

      tabId: this.$props.instanceId + "TabBar1",
      msgId: this.$props.instanceId + "Msg1",
      msgState: this.$props.currentStateKey + "Msg1",
      loggingEnabled: LOGGING_ENABLED,
    } satisfies MainAppStaticData;
  },
  setup() {
    const safeFailover = shallowRef(Failover);

    return { safeFailover };
  },
});
</script>
