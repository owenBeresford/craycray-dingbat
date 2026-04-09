<template>
  <dialog class="enterInput" id="enterinput" v-if="visible" :data-testid="instanceId" :key="currentStateKey" open>
    <form action="" method="dialog">
      <div class="labelRow">
        <label for="txt">{{ text.label1 }}</label>
        <span
          class="cancel"
          @click="onCancel"
          @touch.prevent="onCancel"
          @keypress.once="onCancel"
          :title="text.title2"
          :aria-label="text.title2"
          v-html="cross"
          :data-testid="cancelId"
          role="button"
        >
        </span>
      </div>
      <p>
        <input
          v-if="bIsMobile"
          name="txt"
          id="txt"
          v-model="oVal"
          :placeholder="text.placeholder1"
          ref="enterIt"
          @keydown.enter="onUpdate"
          @keydown.esc="onCancel"
          :data-testid="mobileId"
        />
        <input
          v-else
          name="txt"
          id="txt"
          :placeholder="text.placeholder1"
          ref="enterIt"
          @keydown.enter="onUpdate"
          @keydown.esc="onCancel"
          v-model="oVal"
          @input.lazy="mapValue"
          :data-testid="desktopId"
        />

        <input
          type="button"
          role="button"
          @click.once.prevent="onUpdate"
          @touch.once.prevent="onUpdate"
          :title="text.title1"
          :value="text.value1"
          :data-testid="commitId"
        />
      </p>
    </form>
  </dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
// https://stackoverflow.com/questions/50617865/vue-v-model-input-change-mobile-chrome-not-work
import { isMobile } from "../services/util";
import type { GuessEvent } from "../types/infill-DOM-types-for-tests";
import { useUIText } from "../services/Localisation";

const TEXT = useUIText();
/**
   * EnterInput
   * A component for a small form to enter a singular text field.  
   * Used to add items to the lists, or names of list etc
	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @param {string =""} val 
   * @param {Function } cb 
   * @param {boolean =false} visible
   * @param {string} currentStateKey
   * @public
   * @returns {string}
   */
export default defineComponent({
  name: "EnterInput",
  components: {},
  props: {
    val: { type: String, default: "" },
    cb: { type: Function, required: true },
    visible: { type: Boolean, default: false },
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
  },
  data() {
    //    let id=nextId();
    let id = this.$props.testId;
    let temp = {
      oVal: "",
      bIsMobile: isMobile(),
      cross: TEXT.get("cross"),
      instanceId: id,
      desktopId: id + "desk1",
      commitId: id + "commit1",
      mobileId: id + "mob1",
      cancelId: id + "cancel1",
      text: {
        label1: TEXT.get("enter.label1"),
        placeholder1: TEXT.get("enter.placeholder1"),
        title1: TEXT.get("enter.title1"),
        value1: TEXT.get("enter.value1"),
        title2: TEXT.get("enter.title2"),
      },
    };
    return temp;
  },
  watch: {
    val(val, oldVal) {
      if( _LOGGING_) {
         console.log(`EnterInput: Running watch ${oldVal} => ${val}.`);
      }
      this.oVal = val;
    },
    visible(val, oldVal) {
      if (val) {
        setTimeout(() => {
          const élément: HTMLInputElement = this.$refs.enterIt as HTMLInputElement;
          élément && élément.focus();
        }, 100);
      }
    },
  },
  methods: {
    mapValue(e: Event): void {
      const élément: HTMLInputElement = e.currentTarget as HTMLInputElement;
      this.oVal = élément.value;
    },

    onCancel(e: GuessEvent): void {
      this.cb(null);
      this.oVal = "";
      (document.querySelector("dialog#enterinput") as HTMLDialogElement).open = false;
      // this.visible = false;
      e.preventDefault();
    },

    onUpdate(e: GuessEvent): void {
      e.preventDefault();
      if (!this.visible) {
        return;
      }

      // eslint-disable-next-line
      const chaîne = "" + this.oVal;
      this.oVal = "";
      this.cb(chaîne);
    },
  },
});
</script>
