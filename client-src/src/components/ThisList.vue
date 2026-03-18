<template>
  <div class="aList" :data-testid="instanceId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="{ betterId }" />
    <ul class="buttonRow">
      <li class="bigger">{{ list.nom }}:</li>
      <li title="Add a new item to current list">
        <span v-touch.once="onAdd" @click.once="onAdd" class="button" @keypress.once="onAdd"> Add item </span>
      </li>
    </ul>
    <EnterInput
      :val="getInput"
      :visible="canSeeInput"
      :cb="cb"
      :data-testid="-1"
      currentStateKey="inputThisListfalse"
    />
    <ul class="aList">
      <li v-for="(i, j) in actualList" :key="j" title="Desktop: long touch to edit, swipe left to delete.">
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
import { useStore } from "../services/Store";
import { DataFactory } from "../services/DataFactory";
import { ListService } from "../services/ListService";
import { SaveStruct } from "../types/Saveable";
import { AList } from "../services/AList";
import { UI_EN_GB } from "../services/Localisation";
import { isMobile, clearSelection, GuessEvent } from "../services/util";
import { MotionStream } from "../services/MotionStream";
import { nextId } from "../services/util";
// import { ListService } from "../services/ListService";
import { Storable } from "../service/Storable";
import { Motionable } from "../types/Motionable";

import EnterInput from "./EnterInput.vue";
import InterstitialView from "./InterstitialView.vue";

interface LocalData {
  instanceId: string;
  id: number;
  list: AList;
  getInput: string;
  canSeeInput: boolean;
  cb: Function;
  stream: Motionable;
  offset: number;
  bisMobile: boolean;
}

const NEW_LIST = -1;
const DUMMY_LIST: AList = {} as AList;
// this class is using a shared function pointer, as in vue2 the event bus is too slow
// if you do parent state updates via it; they take 100ms to propagate, and you see flickers
// it is possible that vue3 event bus is faster

// according to the manuals I found; doing it like this is the approved solution.
// this type whoffle is because someone said this could be an array. #leSigh
function extractId(src: string | string[] | null): number {
  if (src === null) {
    throw new Error("Illegal shopping list id " + src);
  }
  let cp: number;

  if (Array.isArray(src)) {
    cp = parseInt(src[0], 10);
  } else {
    cp = parseInt(src, 10);
  }
  if (cp < 1) {
    throw new Error("Illegal shopping list id " + src);
  }
  return cp - 1;
}

export default defineComponent({
  name: "ThisList",
  components: { EnterInput, InterstitialView },
  props: {
    currentStateKey: { type: String, required: true },
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    }, // "Store<ShopState>"
    factory: {
      type: Object,
      default: async () => {
        return await DataFactory();
      },
    }, // "ListService"
  },
  created() {
    // console.log("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW created()",  );
    const ll = this.$props.factory;
    // console.log("WWWWWWW created()", {"id": this.$route.params.index, "size":ll.count() });

    //console.log("UIOUIOUIO", this.$route.params, extractId(this.$route.params.index) );
    try {
      this.id = extractId(this.$route.params.index);
      this.list = ll.get(this.id) ?? DUMMY_LIST;
    } catch (e) {
      let backupId = ll.create("New list");
      // the second branch is stupid, but shouldnt be possible
      this.list = ll.get(backupId) ?? DUMMY_LIST;
      this.id = backupId;
    }

    if (ll.count() === 0) {
      // if this reference doesn't happen to be the first mention, it will have API content
      // I wish I could use Promises.then, but I can't really make the data() async
      // API should never take more than 500ms, as its not doing much, as its on LAN

      setTimeout(() => {
        this.list = ll.get(this.id) ?? DUMMY_LIST;
      }, 500);
    }
  },
  mounted() {
    //console.log("WWWWWWW mounted()", this.$props.shopStore );
    this.$props.shopStore.commit("setPath", this.$route.path);
    this.$props.shopStore.commit("setId", this.id);
  },
  inject: ["helpText", "canSeeHelp", "ttl"],
  data(): LocalData {
    const tt = new MotionStream();
    tt.register("0", this.finalise.bind(this));
    return {
      instanceId: nextId(),
      id: NEW_LIST,
      list: DUMMY_LIST,
      getInput: "",
      canSeeInput: false,
      cb: Function as any,
      stream: tt,
      offset: -1,
      bisMobile: isMobile() === "hide",
    } as LocalData;
  },
  computed: {
    betterId(): string {
      return this.$props.currentStateKey + "view";
    },
    actualList(): Array<SaveStruct> {
      if (this.list instanceof AList) {
        return this.list.export();
      }
      return [] as Array<SaveStruct>;
    },
  },
  methods: {
    onSave(e: GuessEvent): void {
      e.preventDefault();
      this.$props.factory.saveAllLists();
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
