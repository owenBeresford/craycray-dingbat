<template>
  <div class="aList" :data-testid="testId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="helpId" :testId="viewId" />
    <ul class="buttonRow flex-container">
      <li class="bigger flex-child-auto shrink">
        <h3>{{ ctx.listRef.value.nom }}</h3>
      </li>
      <li class="flex-child-grow">
        <img width="40" height="40" :src="logoPath" aria-hidden="true" role="presentation" :alt="text.imgAlt" />
      </li>
      <li class="flex-child-grow" :title="text.addTitle">
        <span
          role="button"
          class="button"
          @click.prevent="onAdd"
          @keypress.prevent="onAdd"
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
      <li v-for="(i, j) in actualList" :key="j" :title="text.currentTitle" class="flex-container">
        <span
          :id="`dragHandler${j}`"
          v-html="dragSymbol"
          tabindex="0"
          v-if="bisMobile"
          class="dragstr"
          v-on:pointerdown="onSwipeStart"
          v-on:pointermove="onSwipeMove"
          v-on:pointerup="onSwipeStop"
          v-on:pointercancel="onSwipeStop"
          v-on:touchstart.prevent="noop"
          :data-offset="j"
          :data-gesture="ctx.gestureRef.value[j]"
          :aria-selected="ctx.draggingRef.value[j]"
        ></span>
        <span
          v-if="bisMobile"
          tabindex="0"
          class="button info flex-child-auto"
          :aria-selected="ctx.draggingRef.value[j]"
          v-longpress="onEdit"
          :data-offset="j"
        >
          {{ i }}
        </span>
        <span
          v-else
          class="button info flex-child-auto"
          :aria-selected="ctx.draggingRef.value[j]"
          :data-offset="j"
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
import { defineComponent, ref, inject } from "vue";
import { useRoute, type RouteLocationNormalizedLoadedGeneric } from "vue-router";
import type { Ref } from "vue";

import EnterInput from "./EnterInput.vue";
import InterstitialView from "./InterstitialView.vue";
 
import { useStore, type COMPLETE_STORE } from "../services/Store";
import { useUIText } from "../services/Localisation";
import { extractId } from "../services/util";
import { idOf, type FactoryArtefact } from "../services/DataFactory";
import { StdList, EMPTY_LIST } from "../services/AList";
import { MotionStream } from "../services/MotionStream";
import { isMobile, clearSelection } from "../../../common/util";
import { LOGO_PATH, DRAG_HANDLE_SYMBOL, EMPTY_LIST_ID } from "../Constants";
import { noop, ThisListActions, useThisListActions } from "../services/ThisListActions";

import type { Loggable } from "../types/Loggable";
import type { ExternalMethods, CBType, ThisListCtx } from "../types/Actionables";
// import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ThisListStaticData, ThisListProps, ThisListSetupValues } from "../types/ComponentProps";

const TEXT = useUIText();

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
      default: (): COMPLETE_STORE => {
        return useStore();
      },
    },
  } satisfies ThisListProps,

  //  setup(props: ThisListProps) {
  setup(): ThisListSetupValues {
    const itinéraire: RouteLocationNormalizedLoadedGeneric = useRoute();

    const helpText: string = inject<string>("helpText");
    const canSeeHelp: boolean = inject<boolean>("canSeeHelp");
    const listData: FactoryArtefact = inject<FactoryArtefact>("listData");
    const ttl: number = inject<number>("ttl");
    const log: Loggable = inject<Loggable>("log");

    const canSeeInputRef: Ref<boolean> = ref<boolean>(false);
    const getInputRef: Ref<string> = ref<string>("");
    const CBRef: Ref<CBType> = ref<CBType>(noop);

    let stack: ExternalMethods;
    try {
      const flux = new MotionStream<ThisListCtx>();
      const liste: StdList = listData.currentData.get(extractId(itinéraire.params.index ?? EMPTY_LIST_ID));

      const listRef: Ref<StdList> = ref<StdList>(liste);
      let dragging: Array<boolean> = Array(liste.énumérer);
      dragging.fill(false);
      const draggingRef: Ref<Array<boolean>> = ref<Array<boolean>>(dragging);
      let gesture: Array<string> = [liste.énumérer];
      gesture.fill("");
      const gestureRef: Ref<Array<string>> = ref<Array<string>>(gesture);

      stack = useThisListActions(flux, listData);
      return {
        extraMethods: stack.mount(
          { getInputRef, CBRef, draggingRef, canSeeInputRef, listRef, gestureRef } satisfies ThisListCtx,
          stack
        ),
        helpText,
        canSeeHelp,
        listRef,
        ttl,
        draggingRef,
        gestureRef,
        ctx: { getInputRef, CBRef, draggingRef, canSeeInputRef, listRef, gestureRef } as ThisListCtx,
      } satisfies ThisListSetupValues;
    } catch (e: unknown) {
      console.warn("ThisList.setup():", (e as Error).message, (e as Error).stack.substring(0, 200));
      log.addRaw("ThisList.setup():" + (e as Error).message + "  " + (e as Error).stack.substring(0, 200), "error");
    }
  },

  created() {
    if ( import.meta.env.VITEST ) {
      console.debug("KKK ThisList global scope ListData id:", idOf(this.listData));
    }
    this.initGeneratedMethods();
  },
  mounted() {
    if (this.shopStore) {
      const itinéraire = useRoute();
      this.shopStore.commit("setPath", itinéraire.path);
      this.id = extractId(itinéraire.params.index) ?? EMPTY_LIST_ID;

      this.shopStore.commit("setId", extractId(itinéraire.params.index) ?? EMPTY_LIST_ID);
    } else {
      console.assert(this.shopStore, "ThisList: At mounted() stage, do not have a state storage?!");
    }
  },
  data(): ThisListStaticData<ThisListCtx> {
    return {
      noop,
      id: EMPTY_LIST_ID,
      bisMobile: isMobile(),
      logoPath: LOGO_PATH,
      dragSymbol: DRAG_HANDLE_SYMBOL,
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
    } satisfies ThisListStaticData<ThisListCtx>;
  },
  computed: {
    helpId(): string {
      return this.$props.currentStateKey + "view";
    },
    actualList(): Array<string> {
      if (this.listRef.value) {
        return this.listRef.value.export<string>();
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
