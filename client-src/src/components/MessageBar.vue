<template>
  <details id="msgBar" class="msgBar" :key="currentStateKey" :data-testId="testId">
    <summary>Log messages</summary>
    <ul :data-testId="msgBodyId" clsss="scrollBlock">
      <li><strong>Log messages that you can see on mobile</strong></li>
      <!-- li><span class="button" :data-testId="refreshId" @click.prevent="refresh" @tap.prevent="refresh" @keypress.prevent="refresh">Refresh the log.</span></li -->
      <li v-for="(i, j) in messages" :key="j" v-html="i"></li>
    </ul>
  </details>
</template>

<script lang="ts">
// https://github.com/josueggh/a11y-cheatsheet
import { defineComponent, inject, ref } from "vue";

import { useLog } from "../services/LogStack";
import { useUIText } from "../services/Localisation";
import type { MsgBarStaticData, MsgBarProps } from "../types/ComponentProps";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { Loggable } from "../types/Loggable";

const TEXT = useUIText();

export default defineComponent({
  name: "MessageBar",
  props: {
    currentStateKey: { type: String, default: "logging1" },
    testId: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    msgs: {
      type: Object,
      default: (): Loggable => {
        return useLog();
      },
    },
  } satisfies MsgBarProps,
  data(): MsgBarStaticData {
    return {
      msgBodyId: this.$props.testId + "Msgs1",
      refreshId: this.$props.testId + "Refresh1",
    } satisfies MsgBarStaticData;
  },
  methods: {
    refresh: function (e: GuessEvent): void {
      console.log("Data pretend refresh");
    },
  },
  computed: {
    // keying structure isnt complex, BUT logging shouldnt change, so keys shouldnt change
    messages: function (): Array<string> {
      if (this.msgs) {
        return this.msgs.readWhole().log;
      } else {
        return [];
      }
    },
  },
});
</script>
