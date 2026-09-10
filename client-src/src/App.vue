<template>
  <VErrorBoundary
    :fall-back="safeFailover"
    :params="{ testid: 'eb-failOver1', currentStateKey: currentStateKey, error_info: 'info', id: listId }"
    :on-error="tellMeMore"
    stop-propagation
  >
    <Suspense :key="currentStateKey">
      <template #default>
        <div class="wholePage" :data-testid="instanceId" :key="currentStateKey">
          <TabBar currentStateKey="tabar1" :data-testid="tabId" />
          <router-view class="view" />
          <MessageBar :msgs="LOG" :testId="msgId" :currentStateKey="msgState" :enabled="loggingEnabled" />
        </div>
      </template>

      <template #fallback>
        <h3 data-testId="suspense-fallback1">Data still is loading. Pls hold.</h3>
      </template>
    </Suspense>
  </VErrorBoundary>
</template>

<script lang="ts">
import { defineComponent, Suspense, shallowRef, inject, onErrorCaptured } from "vue";
import { useRoute } from "vue-router";
import VErrorBoundary from "vue-error-boundary";

import { LOGGING_ENABLED } from "./Constants";
import type { MainAppProps, MainAppStaticData, MainAppState } from "./types/ComponentProps";
import type { Loggable } from "./types/Loggable";

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
      tabId: this.$props.instanceId + "TabBar1",
      msgId: this.$props.instanceId + "Msg1",
      msgState: this.$props.currentStateKey + "Msg1",
      loggingEnabled: LOGGING_ENABLED,
    } satisfies MainAppStaticData;
  },
  setup(): MainAppState {
    const safeFailover = shallowRef(Failover);
    const LOG: Loggable = inject<Loggable>("log");
    const ROUTE = useRoute();

    onErrorCaptured((err: Error): boolean => {
      console.warn("BASIC OWN code reporter", err.message);
      // Return false to stop propagation (default is true to propagate)
      return false;
    });

    let id = 0;
    if (ROUTE.params && ROUTE.params.index) {
      id = parseInt(ROUTE.params.index, 10);
    }
    return { safeFailover, LOG, listId: id };
  },
  methods: {
    tellMeMore(error: Error, instance: Object, info: string): void {
      console.warn("TRY HARDER ", error, info);
    },
  },
});
</script>
