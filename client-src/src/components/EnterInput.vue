<template>
  <dialog class="enterInput" id="enterinput" :data-testid="instanceId" :key="currentStateKey" :open="bShow">
    <form action="" method="dialog">
      <div class="labelRow">
        <label for="txt">{{ text.label1 }}</label>
        <span
          class="cancel"
          @click.prevent="onCancel"
          @touch.prevent="onCancel"
          @keypress.once="onCancel"
          @keyup.esc="onCancel"
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
          @click.prevent="onUpdate"
          @touch.prevent="onUpdate"
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
import { isMobile } from "../../../common/util";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import { useUIText } from "../services/Localisation";
import type { EnterInputProps } from '../types/ComponentProps';

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
  data():EnterInputProps {
    let id = this.$props.testId;
    return {
      oVal: ""+this.$props.val,
      bIsMobile: isMobile(),
      bShow: this.$props.visible,
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
    } satisfies EnterInputProps;
  },
  watch: {
    val(nouveau:string, vieux:string ):void {
//      if (_LOGGING_) {
        console.log(`EnterInput: Running watch ${vieux} => ${nouveau}.`);
//      }
      this.oVal = nouveau;
    },
    visible(nouveau:string, vieux:string):void {
      this.bShow=!!nouveau;
console.log("XXX new value in viibility","new value", nouveau, this.bShow, "old value", vieux );
      if (this.bShow) {
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
      this.bShow = !this.bShow;
      (document.querySelector("dialog#enterinput") as HTMLDialogElement).open = false;
    },

    onUpdate(e: GuessEvent): void {
console.warn("EnterInput.onUpdate running again. ", e);      
      if (!this.bShow) {
console.warn("EnterInput.onUpdate  event this component isn't active, but has input events");
        return;
      }

      // eslint-disable-next-line
      const chaîne = "" + this.oVal;
      this.oVal = "";
      this.cb(chaîne);
      this.bShow=!this.bShow;
      (document.querySelector("dialog#enterinput") as HTMLDialogElement).open = false;

    },
  },
});
</script>
