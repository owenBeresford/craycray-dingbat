<template>
  <div class="interstitial" v-if="iShow" :data-testid="instanceId" :key="currentStateKey2">
    <ul>
      <li class="closeUp">
        <input
          class="button"
          name="closeUp"
          @keypress.prevent="hide"
          @click.prevent="hide"
          :value="text.label1"
          :data-testId="closeId"
          :aria-label="text.close1"
          role="button"
          type="button"
        />
      </li>
      <li v-for="(i, j) in list" :key="j" v-html="i"></li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore, mapForHelp } from "../services/Store";
import { useUIText, HELP_TEXT_NAMES } from "../services/Localisation";
import { useLocal } from "../services/LocalCopy";
import { KNOWN_PHONE } from "../Constants";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { StrictArray, InterstitialStaticData, InterstitialProps } from "../types/ComponentProps";

const TEXT = useUIText();
/**
   * InterstitialView
   * A component to render an overlay with some help text

	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.

   * @param {Number =0} ttl   - interstitial should vanish after this duration, in ms
   * @param {String } display - the localisation id for the text being displayed
   * @param {boolean =false} show
   * @param {string} currentStateKey
   * @param {string} testId
   * @public
   * @returns {string} - after rendering :-)
   */
export default defineComponent({
  name: "InterstitialView",
  props: {
    ttl: { type: Number, default: 0 },
    display: { type: String, required: true },
    show: { type: Boolean, default: false },
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
  } satisfies InterstitialProps,
  inject: ["log"],

  data(): InterstitialStaticData {
    let id = this.$props.testId;
    let chaine = this.$props.currentStateKey;

    // this is an override, so the props are applied at loadtime if running inside Storybook,
    // which only applies a partial stack
    let shouldShow = false;
    if ("__STORYBOOK_MODULE_TEST__" in window && window.__STORYBOOK_MODULE_TEST__) {
      shouldShow = true;
    }

    return {
      instanceId: id,
      closeId: id + "close1",
      local: useLocal(),
      store: useStore(),
      iShow: shouldShow ? this.$props.show : false,
      // this is the buffer for the help text currently rendered
      list: [] as StrictArray,
      firstPass: false,
      // there is an different help text for each screen, I aim to show each once
      urlsStack: [] as StrictArray,
      text: {
        close1: TEXT.get("interstitial.close1"),
        label1: TEXT.get("interstitial.label1"),
      },
      currentStateKey2: chaine,
    } satisfies InterstitialStaticData;
  },
  
  mounted() {
    // this.local = useLocal();
    // these two are currently hidden, and have no local state
    // No support for arrays in this.display todate
    const inner2 = () => {
      this.list.splice(0, this.list.length);
      this.iShow = false;
      this.store.commit("show", false);
    };

    const inner1 = () => {
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(this.display));
      if (this.list.length === 0 || this.list[0] === "") {
        this.iShow = false;
        this.store.commit("show", false);
      }
      setTimeout(inner2, this.ttl);
    };

    if ((this.local.loadProperty(KNOWN_PHONE) ?? "").length === 0) {
      this.iShow = true;
      this.firstPass = true;
      this.list.push(...TEXT.getTemplate("firstUse"));
      if (this.ttl) {
        setTimeout(inner1, this.ttl);
      }
      this.local.saveProperty(KNOWN_PHONE, "yes");
    } else {
      this.list.push(...TEXT.getTemplate(this.display));
      if (this.list.length === 0 || this.list[0] === "") {
        this.iShow = false;
        this.store.commit("show", false);
      } else if (this.ttl) {
        setTimeout(inner2, this.ttl);
      }
    }
  },

  watch: {
    display(val, oldVal): void {
      // allow infinite displays as ttl=0, just like networking
      if (val && this.ttl) {
        setTimeout(() => {
          this.iShow = false;
          this.store.commit("show", false);
        }, this.ttl);
      }
    },

    show(val, oldVal): void {
      this.iShow = val;
    },
    // https://stackoverflow.com/questions/57934943/how-to-watch-for-vuex-state
    "store.state.currentURL": {
      deep: true,
      handler(val: string, oldVal: string): void {
        if (this.firstPass && !this.urlsStack.includes(val)) {
          this.urlsStack.push(val);
          this.iShow = true;
          this.applyBody();
        }
      },
    },

    "store.state.showHelp": function (val, oldVal) {
      this.iShow = val;
      this.firstPass = true;
      this.urlsStack.splice(0, this.urlsStack.length);
      this.applyBody();
      this.iterateText();
    },
  },

  methods: {
    applyBody(): void {
      const nom = mapForHelp(this.store, "/");
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(nom));
      if (this.list.length === 0 || this.list[0] === "") {
        this.log.addRaw("Ran store->showHelp(), but have no content to show?", "warn");
        this.iShow = false;
        this.store.commit("show", false);
      }
    },

    hide(e: GuessEvent): void {
      this.iShow = false;
      this.store.commit("show", false);
    },

    changeText(what: string): void {
      const nom = mapForHelp(this.store, what);
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(nom));
      if (this.list.length === 0 || this.list[0] === "") {
        this.iShow = false;
        this.store.commit("show", false);
      }
    },

    iterateText(): void {
      for (let i = 0; i < HELP_TEXT_NAMES.length; i++) {
        setTimeout(() => {
          this.store.commit("show", true);
          console.log("Trying help text: " + HELP_TEXT_NAMES[i], mapForHelp(this.store, HELP_TEXT_NAMES[i]), i);
          return this.changeText(HELP_TEXT_NAMES[i]);
        }, (i + 1) * this.ttl);
      }
    },
  },
});
</script>
