<template>
  <div class="aList" :data-testid="testId" :key="currentStateKey">
    <InterstitialView :display="helpTextRef" :show="canSeeHelpRef" :ttl="ttlRef" :currentStateKey="helpId" :testId="viewId" />
    <ul class="buttonRow">
      <li class="bigger">
        <h3>{{ list.nom }}</h3>
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
    <EnterInput :val="getInputRef" :visible="canSeeInputRef" :cb="CBRef" :testId="nextTestId" :currentStateKey="childId" />
    <ul class="aList" :data-testId="aListId">
      <li v-for="(i, j) in actualList" :key="j" :title="text.currentTitle">
        <span
          v-if="bisMobile"
          class="button info"
          v-touch="onEdit"
          :data-offset="j"
          v-touch:swipe.left="onSwipe"
          v-touch-options="{ swipeTolerance: 80, rollOverFrequency: 500 }"
        >
          {{ i }}
        </span>
        <span
          v-else
          class="button info"
          v-touch:longtap="onEdit"
          :data-offset="j"
          v-on:mouseleave="onDragStop"
          v-touch-options="{ dragTolerance: 200, longTapTimeInterval: 1000, rollOverFrequency: 400 }"
          v-on:mousedown="onDragStart"
          @blur="onDragExit"
        >
          {{ i }}
        </span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref} from "vue";
import { useRoute } from "vue-router";
import type { Ref } from 'vue';

import EnterInput from "./EnterInput.vue";
import InterstitialView from "./InterstitialView.vue";

import { useStore } from "../services/Store";
import { useUIText } from "../services/Localisation";
import { ListData, setupCurrentList, idOf } from "../services/DataFactory";
import { StdList, EMPTY_LIST } from "../services/AList";
import { MotionStream } from "../services/MotionStream";
import { isMobile, clearSelection } from "../../../common/util";
import { LOGO_PATH } from "../Constants";
import {  noop, ThisListActions, useThisListActions } from "../services/ThisListActions";

import type { ExternalMethods, CBType, FakeThis } from "../types/Actionables";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ThisListStaticData } from "../types/ComponentProps";

const TEXT = useUIText();
const { currentData, updateData, initData } = ListData;
if (ListData.currentData && _LOGGING_) {
  console.log("KKK ThisList global scope ListData.currentData id:", idOf(ListData.currentData));
}
if (_LOGGING_) {
  console.log("KKK ThisList global scope ListData id:", idOf(ListData));
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
  },
  setup(props: ThisListProps) {
    const helpTextRef: string = inject<string>("helpText");
    const canSeeHelpRef: boolean = inject<boolean>("canSeeHelp");
    const ttlRef: string = inject<number>("ttl");
    const itinéraire = useRoute();
    const getInputRef:Ref<string> = ref<string>("");
    const CBRef:Ref<CBType> = ref<CBType>(noop);

    let stack: ExternalMethods;
    try {
      const flux = new MotionStream();
      const list=EMPTY_LIST;
      list.importTest<string, StdList>(setupCurrentList(itinéraire) as StdList);

      stack = useThisListActions(list, flux, ListData);
      return {
        extraMethods: stack.mount({}, stack),
        helpTextRef,
        canSeeHelpRef,
        ttlRef,
        getInputRef,
        CBRef,
        list,
        ctx: { canSeeHelpRef, getInputRef, CBRef, list } as FakeThis,  
      };
    } catch (e: unknown) {
      console.log("SearchResults.setup():", (e as Error).message);
    }
  },

  created() {
    if (currentData && _LOGGING_) {
      console.log("KKK thisList.created  ListData.currentData id:", idOf(currentData));
    }
    if (_LOGGING_) {
      console.log("KKK ThisList global scope ListData id:", idOf(ListData));
    }
    this.initGeneratedMethods();
  },
  mounted() {
    if (this.shopStore) {
      this.shopStore.commit("setPath", itinéraire.path);
      this.shopStore.commit("setId", this.id);
    } else {
      console.assert(this.shopStore, "ThisList: At mounted() stage, do not have a state storage?!");
    }
  
  },
  data(): ThisListStaticData {
    return {
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
      if (this.list instanceof StdList) {
        return this.list.export<string>();
      }
      return [] as Array<string>;
    },

  },

  methods: {
      ...(() => ({}))(), // placeholder to keep TSC happy

    initGeneratedMethods() {
      Object.assign(this, this.extraMethods);
    },
  },
});
</script>
