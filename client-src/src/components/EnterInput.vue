<template>
  <dialog class="enterInput" id="enterinput" v-if="{ visible }" :data-testid="instanceId" :key="currentStateKey">
    <form action="" method="dialog">
      <div class="labelRow">
        <label for="txt"> Enter your new value: </label>
        <span class="cancel" @click="onCancel" @touch.prevent="onCancel" @keypress.once="onCancel" v-html="cross">
        </span>
      </div>
      <p>
        <input
          v-if="bIsMobile"
          name="txt"
          id="txt"
          v-model="oVal"
          placeholder="Enter value"
          ref="enterIt"
          @keydown.enter="onUpdate"
          @keydown.esc="onCancel"
        />
        <input
          v-else
          name="txt"
          id="txt"
          placeholder="Enter value"
          ref="enterIt"
          @keydown.enter="onUpdate"
          @keydown.esc="onCancel"
          :value="oVal"
          @input.lazy="mapValue"
        />

        <input
          type="button"
          @click.once.prevent="onUpdate"
          @touch.once.prevent="onUpdate"
          title="Enter your new value.."
          value="Set"
        />
      </p>
    </form>
  </dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
// https://stackoverflow.com/questions/50617865/vue-v-model-input-change-mobile-chrome-not-work
import { isMobile, nextId } from "../services/util";
import type { GuessEvent } from "../types/infill-DOM-types-for-tests";
import { UI_EN_GB, useUIText } from "../services/Localisation";

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
   * @return {string}
   */
export default defineComponent({
  name: "EnterInput",
  components: {},
  props: {
    val: { type: String, default: "" },
    cb: { type: Function, required: true },
    visible: { type: Boolean, default: false },
    currentStateKey: { type: String, required: true },
  },
  data() {
    return { oVal: "", bIsMobile: isMobile(), cross: TEXT.get("cross"), instanceId: nextId() };
  },
  watch: {
    val(val, oldVal) {
      console.warn("running watch");
      this.oVal = val;
    },
    visible(val, oldVal) {
      if (val) {
        setTimeout(() => {
          const theField: HTMLInputElement = this.$refs.enterIt as HTMLInputElement;
          theField.focus();
        }, 100);
      }
    },
  },
  methods: {
    mapValue(e: Event): void {
      const tt: HTMLInputElement = e.currentTarget as HTMLInputElement;
      this.oVal = tt.value;
    },

    onCancel(e: GuessEvent): void {
      this.cb(null);
      this.oVal = "";
      e.preventDefault();
    },

    onUpdate(e: GuessEvent): void {
      e.preventDefault();
      if (!this.visible) {
        return;
      }

      // eslint-disable-next-line
      const tmp = "" + this.oVal;
      this.oVal = "";
      this.cb(tmp);
    },
  },
});
</script>
