<template>
  <div class="aList" :data-testid="testId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="helpId" :testId="viewId" />
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
// import { extractId } from "../services/util";
import { isMobile, clearSelection } from "../../../common/util";
import { LOGO_PATH } from "../Constants";

import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ThisListProps } from "../types/ComponentProps";

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
  created() {
    if (currentData && _LOGGING_) {
      console.log("KKK thisList.created  ListData.currentData id:", idOf(currentData));
    }
    if (_LOGGING_) {
      console.log("KKK ThisList global scope ListData id:", idOf(ListData));
    }
  },
  mounted() {
    const itinéraire = useRoute();
    this.list.importTest( setupCurrentList(itinéraire) as AList );
    if (this.shopStore) {
      this.shopStore.commit("setPath", itinéraire.path);
      this.shopStore.commit("setId", this.id);
    } else {
      console.assert(this.shopStore, "ThisList: At mounted() stage, do not have a state storage?!");
    }
    const flux = new MotionStream();
    flux.register("0", this.finalise.bind(this));
    this.flux = flux;
  },
  inject: ["helpText", "canSeeHelp", "ttl"],
  data(): ThisListProps {
    return {
      id: NEW_LIST,
      list: EMPTY_LIST,
      getInput: "",
      canSeeInput: false,
      cb: Function as any,
      offset: -1,
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
    } satisfies ThisListProps;
  },
  computed: {
    helpId(): string {
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
    onAdd(e: GuessEvent): boolean {
      this.getInput = "";
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
      const agaçant = e!.currentTarget as HTMLElement;
      this.getInput = `${agaçant!.innerText}`;
      e.preventDefault();

      this.cb = (d1: string | null): void => {
        if (d1 === null) {
          this.canSeeInput = false;
          return;
        }

        const indice = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
        if (indice >= 0 && indice < this.list.énumérer) {
          this.list.edit(indice, d1);
          this.canSeeInput = false;
        } else {
          console.log(`Cannot update list item; bad offset value ${agaçant.innerText}`);
        }
      };

      this.canSeeInput = true;
      return false;
    },

    onSwipe(dir: string, e: TouchEvent): void {
      const agaçant = e!.currentTarget as HTMLElement;
      e.preventDefault();
      this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      console.log(`Deleting list element [${this.offset}] = ${agaçant.innerText}`);
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
      const agaçant = e!.currentTarget as HTMLElement;
      this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      this.flux.start(e);
    },

    onDragStop(e: MouseEvent): void {
      e.preventDefault();
      const agaçant = e!.currentTarget as HTMLElement;
      this.flux.end(e);
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

      this.flux.end(e2);
      clearSelection();
    },

    onDragMove(e: MouseEvent): void {
      e.preventDefault();
      this.flux.addEvent(e);
    },
  },
});
</script>
