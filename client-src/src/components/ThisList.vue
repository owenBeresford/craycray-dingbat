<template>
  <div class="aList" :data-testid="testId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="betterId" :testId="viewId" />
    <ul class="buttonRow">
      <li class="bigger">{{ list.nom }}</li>
      <li :title="text.addTitle">
        <span
          role="button"
          v-touch.once="onAdd"
          @click.once="onAdd"
          class="button"
          @keypress.once="onAdd"
          v-html="text.addName"
        ></span>
      </li>
    </ul>
    <EnterInput :val="getInput" :visible="canSeeInput" :cb="cb" :testId="nextTestId" :currentStateKey="childId" />
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
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import EnterInput from "./EnterInput.vue";
import InterstitialView from "./InterstitialView.vue";

import { useStore } from "../services/Store";
import { useUIText } from "../services/Localisation";
import { ListData, setupCurrentList, idOf } from "../services/DataFactory";
import { AList, EMPTY_LIST } from "../services/AList";
import { MotionStream } from "../services/MotionStream";
import { isMobile, clearSelection, extractId } from "../services/util";

import type { GuessEvent } from "../types/infill-DOM-types-for-tests";
import type { ThisListProps } from "../types/ComponentProps";
// import { ListService } from "../services/ListService";
// import type { SaveStruct } from "../types/Saveable";
// import { UI_EN_GB } from "../services/Localisation";
// import type { Storable } from "../types/Saveable";
// import type { Motionable } from "../types/Motionable";
// import { ListService } from "../services/ListService";

const TEXT = useUIText();
const { currentData, updateData, initData } = ListData;
if (ListData.currentData) {
  console.log("KKK ThisList global scope ListData.currentData id:", idOf(ListData.currentData));
}
console.log("KKK ThisList global scope ListData id:", idOf(ListData));

const NEW_LIST = -1;
// this class is using a shared function pointer, as in vue2 the event bus is too slow
// if you do parent state updates via it; they take 100ms to propagate, and you see flickers
// it is possible that vue3 event bus is faster

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
  async created() {
    this.list = setupCurrentList(undefined);
    if (currentData) {
      console.log("KKK thisList.created  ListData.currentData id:", idOf(currentData));
    }
    console.log("KKK ThisList global scope ListData id:", idOf(ListData));
  },
  mounted() {
    const itinéraire = useRoute();
    if (this.$props.shopStore) {
      this.$props.shopStore.commit("setPath", itinéraire.path);
      this.$props.shopStore.commit("setId", this.id);
    } else if (this.shopStore) {
      this.shopStore.commit("setPath", itinéraire.path);
      this.shopStore.commit("setId", this.id);
    }
  },
  inject: ["helpText", "canSeeHelp", "ttl"],
  data(): ThisListProps {
    const tt = new MotionStream();
    tt.register("0", this.finalise.bind(this));

    return {
      id: NEW_LIST,
      list: EMPTY_LIST,
      getInput: "",
      canSeeInput: false,
      cb: Function as any,
      stream: tt,
      offset: -1,
      bisMobile: isMobile(),
      text: {
        addTitle: TEXT.get("list.additemTitle"),
        currentTitle: TEXT.get("list.curListsTitle"),
        addName: TEXT.get("list.addItemName"),
      },
      childId: this.$props.testId + "Child1",
      nextTestId: this.$props.testId + "Input1",
      aListId: this.$props.testId + "List1",
      viewId: this.$props.testId + "View1",
    } as ThisListProps;
  },
  computed: {
    betterId(): string {
      return this.$props.currentStateKey + "view";
    },
    actualList(): Array<string> {
      if (this.list instanceof AList) {
        return this.list.export();
      }
      return [] as Array<string>;
    },
  },
  methods: {
    onSave(e: GuessEvent): void {
      e.preventDefault();
      if (currentData) {
        currentData.saveAllLists();
      }
    },

    onAdd(e: GuessEvent): boolean {
      this.getInput = "";
      e.preventDefault();
      this.cb = (d1: string | null): void => {
        if (d1 === null) {
          this.canSeeInput = false;
          return;
        }
        this.list.add(d1);
        this.canSeeInput = false;
      };
      this.canSeeInput = true;
      return false;
    },

    onEdit(e: GuessEvent): boolean {
      const annoying = e!.currentTarget as HTMLElement;
      this.getInput = `${annoying!.innerText}`;
      e.preventDefault();

      this.cb = (d1: string | null): void => {
        if (d1 === null) {
          this.canSeeInput = false;
          return;
        }

        const offset = parseInt(annoying!.getAttribute("data-offset") ?? "-1", 10);
        if (offset >= 0 && offset < this.list.énumérer) {
          this.list.edit(offset, d1);
          this.canSeeInput = false;
        } else {
          console.log(`Cannot update list item; bad offset value ${annoying.innerText}`);
        }
      };

      this.canSeeInput = true;
      return false;
    },

    onSwipe(dir: string, e: TouchEvent): void {
      const annoying = e!.currentTarget as HTMLElement;
      e.preventDefault();
      this.offset = parseInt(annoying!.getAttribute("data-offset") ?? "-1", 10);
      console.log(`Deleting list element [${this.offset}] = ${annoying.innerText}`);
      this.finalise();
    },

    finalise(): void {
      if (this.offset >= 0 && this.offset < this.list.énumérer) {
        this.list.remove(this.offset);
      } else {
        console.log(`Cannot delete this offset ${this.offset}`);
      }
    },

    onDragStart(e: MouseEvent): void {
      e.preventDefault();
      const annoying = e!.currentTarget as HTMLElement;
      this.offset = parseInt(annoying!.getAttribute("data-offset") ?? "-1", 10);
      this.stream.start(e);
    },

    onDragStop(e: MouseEvent): void {
      e.preventDefault();
      const annoying = e!.currentTarget as HTMLElement;
      this.stream.end(e);
      clearSelection();
    },

    onDragExit(e: FocusEvent): void {
      e.preventDefault();
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
      // new MouseEvent(typeArg, mouseEventInit);
      let e3: HTMLElement = e.relatedTarget as HTMLElement;
      let e2 = new MouseEvent("mouseup", {
        screenX: e3.scrollLeft,
        screenY: e3.scrollTop,
        clientX: e3.scrollLeft,
        clientY: e3.scrollTop,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
        buttons: 1,
      } as MouseEventInit);

      this.stream.end(e2);
      clearSelection();
    },

    onDragMove(e: MouseEvent): void {
      e.preventDefault();
      this.stream.addEvent(e);
    },
  },
});
</script>
