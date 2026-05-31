<template>
  <div class="aList" :data-testid="testId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="helpId" :testId="viewId" />
    <ul class="buttonRow">
      <li class="bigger">
        <h3>{{ ctx.listRef.value.nom }}</h3>
      </li>
      <li><img width="40" height="40" :src="logoPath" aria-hidden="true" role="presentation" :alt="text.imgAlt" /></li>
      <li :title="text.addTitle">
        <span
          role="button"
          class="button"
          v-touch.prevent.once="onAdd"
          @click.prevent.once="onAdd"
          @keypress.prevent.once="onAdd"
          v-html="text.addName"
        ></span>
      </li>
    </ul>
    <EnterInput
      :val="ctx.getInputRef.value"
      :visible="ctx.canSeeInputRef.value"
      :cb="ctx.CBRef.value"
      :testId="nextTestId"
      :currentStateKey="childId"
    />
    <ul class="aList" :data-testId="aListId">
      <li v-for="(i, j) in actualList" :key="j" :title="text.currentTitle">
        <span
          v-if="bisMobile"
          tabindex="0" 
          class="button info"
          :aria-selected="ctx.draggingRef.value[j]"
          v-touch-class="'touchActive'" 
          :data-offset="j"
          v-touch="onEdit"
          @touchstart.prevent="noop"
          v-touch:swipe.left="onSwipe"
          v-touch:swipe.up="onDragStart"
          v-touch:swipe.down="onDragStart"
          v-touch-options="{ swipeTolerance: 20, rollOverFrequency: 500, swipeConeSize:0.4 }"
        >
          {{ i }}
        </span>
        <span
          v-else
          class="button info"
          :aria-selected="ctx.draggingRef.value[j]"
          :data-offset="j"
          v-touch-options="{ dragTolerance: 200, rollOverFrequency: 400 }"
          v-longpress="onEdit"
          v-on:mousedown.passive="onDragStart"
          v-on:mouseleave.passive="onDragStop"
          @blur.passive="onDragExit"
        >
          {{ i }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, inject, toRaw, shallowRef } from "vue";
import { useRoute } from "vue-router";
import type { Ref, ShallowRef } from "vue";

import EnterInput from "./EnterInput.vue";
import InterstitialView from "./InterstitialView.vue";

import { useStore } from "../services/Store";
import { useUIText } from "../services/Localisation";
import { extractId } from '../services/util'; 
import { ListData, setupCurrentList, idOf } from "../services/DataFactory";
import { StdList, EMPTY_LIST } from "../services/AList";
import { MotionStream } from "../services/MotionStream";
import { isMobile, clearSelection } from "../../../common/util";
import { LOGO_PATH } from "../Constants";
import { noop, ThisListActions, useThisListActions } from "../services/ThisListActions";

import type { ExternalMethods, CBType, FakeThis } from "../types/Actionables";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ThisListStaticData, ThisListProps } from "../types/ComponentProps";

const TEXT = useUIText();
if (_LOGGING_) {
  console.debug("KKK ThisList global scope ListData id:", idOf(ListData));
}

const NEW_LIST = -1;
// This class is using a shared function pointer, as in vue2 the event bus is too slow.
// If you do parent state updates via it; they take 100ms to propagate, and you see flickers.
// It is possible that vue3 event bus is faster.

/**
   * Thislist
   * A component to render the currently edited list.

	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.
   * @param {Object} shopStore
   * @param {string} currentStateKey
   * @public
   * @returns {string} - after rendering :-)
   */
export default defineComponent({
  name: "ThisList",
  components: { EnterInput, InterstitialView },
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    }, // TS: "Store<ShopState>"
  } satisfies ThisListProps,

  setup(props: ThisListProps) {
    const itinéraire = useRoute();

    const helpText: string = inject<string>("helpText");
    const canSeeHelp: boolean = inject<boolean>("canSeeHelp");
    const ttl: string = inject<number>("ttl");
    const canSeeInputRef: Ref<boolean> = ref<boolean>(false);
    const log: Loggable = inject<Loggable>("log");
    const getInputRef: Ref<string> = ref<string>("");
    const CBRef: Ref<CBType> = ref<CBType>(noop);

    let stack: ExternalMethods;
    try {
      const flux = new MotionStream();
      const liste: StdList = Object.assign(Object.create(Object.getPrototypeOf(EMPTY_LIST)), EMPTY_LIST) as StdList;
      liste.importTest(setupCurrentList(itinéraire));
      const listRef: Ref<StdList> = ref<StdList>(liste);
      let dragging: Array<boolean> = Array(liste.énumérer);
      dragging.fill(false);
      const draggingRef: Ref<Array<boolean>> = ref<Array<boolean>>(dragging);

      stack = useThisListActions(flux, ListData);
      return {
        extraMethods: stack.mount({ getInputRef, CBRef, draggingRef, canSeeInputRef, listRef } as FakeThis, stack),
        helpText,
        canSeeHelp,
        ttl,
        ctx: { getInputRef, CBRef, draggingRef, canSeeInputRef, listRef } as FakeThis,
      };
    } catch (e: unknown) {
      console.warn("ThisList.setup():", (e as Error).message, (e as Error).stack.substring(0, 200), );
      log.addRaw("ThisList.setup():"+ (e as Error).message +"  " + (e as Error).stack.substring(0, 200), "error");
    }
  },

  created() {
     if (_LOGGING_) {
      console.debug("KKK ThisList global scope ListData id:", idOf(ListData));
    }
    this.initGeneratedMethods();
  },
  mounted() {
    if (this.shopStore) {
      const itinéraire = useRoute();
      this.shopStore.commit("setPath", itinéraire.path);
      this.id= extractId(itinéraire.params.index ) ?? NEW_LIST;

      this.shopStore.commit("setId", extractId(itinéraire.params.index ) ?? NEW_LIST );
    } else {
      console.assert(this.shopStore, "ThisList: At mounted() stage, do not have a state storage?!");
    }
  },
  data(): ThisListStaticData {
    return {
      noop,
      id: NEW_LIST,
      bisMobile: isMobile(),
      logoPath: LOGO_PATH,
      text: {
        addTitle: TEXT.get("list.additemTitle"),
        currentTitle: TEXT.get("list.curListsTitle"),
        addName: TEXT.get("list.addItemName"),
        imgAlt: TEXT.get("list.imgAlt"),
      },
      childId: this.$props.testId + "Child1",
      nextTestId: this.$props.testId + "Input1",
      aListId: this.$props.testId + "List1",
      viewId: this.$props.testId + "View1",
    } satisfies ThisListStaticData;
  },
  computed: {
    helpId(): string {
      return this.$props.currentStateKey + "view";
    },
    actualList(): Array<string> {
      if (this.ctx.listRef.value) {
        return this.ctx.listRef.value.export<string>();
      }
      return [] as Array<string>;
    },
  },

  methods: {
    ...(() => ({}))(), // placeholder to keep TSC + Bot happy.  This is not callable, as it has no name

    initGeneratedMethods() {
      Object.assign(this, this.extraMethods);
    },
  },
});
</script>
