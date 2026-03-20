<template>
  <div class="interstitial" v-if="iShow" @interstitial="changeText" :data-testid="instanceId" :key="currentStateKey2">
    <ul>
      <li class="closeUp" title="Close this interstitial">
        <input class="button" name="closeUp" @keypress="hide" @click="hide" value="X" />
      </li>
      <li v-for="(i, j) in list" :key="j" v-html="i"></li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useStore, mapForHelp } from "../services/Store";
import { useUIText } from "../services/Localisation";
import { useLocal } from "../services/LocalCopy";
import type { GuessEvent } from "../types/infill-DOM-types-for-tests";
import { StrictArray } from "../services/util";
import { nextId } from "../services/util";
import { KNOWN_PHONE } from '../Constants';

const TEXT = useUIText();
  /**
   * InterstitialView
   * A component to render an overlay with some help text

	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.

   * @param {Number =0} ttl 
   * @param {String } display 
   * @param {boolean =false} show
   * @param {string} currentStateKey
   * @public
   * @return {string}
   */
export default defineComponent({
  name: "InterstitialView",
  components: {}, 
  props: {
    ttl: { type: Number, default: 0 },
    display: { type: String, required: true },
    show: { type: Boolean, default: false },
    currentStateKey: { type: [String, Object], required: true },
  },
  data() {
    let tmp = "";
    if (typeof this.$props.currentStateKey === "string") {
      tmp = this.$props.currentStateKey;
    } else {
      tmp = this.$props.currentStateKey.betterId;
    }

    return {
      instanceId: nextId(),
      local: useLocal(),
      iShow: false,
      list: [] as StrictArray,
      firstPass: false,
      urlsStack: [] as Array<string>,
      currentStateKey2: tmp,
    };
  },
  mounted() {
    this.$store = useStore();
    this.local = useLocal();
    // these two are currently hidden, and have no local state
    // No support for arrays in this.display todate
    const inner2 = () => {
      this.list.splice(0, this.list.length);
      this.iShow = false;
    };

    const inner1 = () => {
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(this.display));
      if (this.list.length === 0 || this.list[0] === "") {
        this.iShow = false;
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
        }, this.ttl);
      }
    },

    show(val, oldVal): void {
      this.iShow = val;
    },
    // https://stackoverflow.com/questions/57934943/how-to-watch-for-vuex-state
    "$store.state.currentURL": {
      deep: true,
      handler(val: string, oldVal: string): void {
        if (this.firstPass && !this.urlsStack.includes(val)) {
          this.urlsStack.push(val);
          this.iShow = true;
          this.applyBody();
        }
      },
    },

    "$store.state.showHelp": function (val, oldVal) {
      this.iShow = val;
      this.applyBody();
    },
  },
  methods: {
    applyBody(): void {
      const templateName = mapForHelp(this.$store, "/");
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(templateName));
      if (this.list.length === 0 || this.list[0] === "") {
        console.log("Ran store->showHelp(), but have no content to show?");
        this.iShow = false;
      }
    },

    hide(e: GuessEvent): void {
      this.iShow = false;
      e.preventDefault();
    },

    changeText(what: string): void {
      const templateName = mapForHelp(this.$store, what);
      this.list.splice(0, this.list.length);
      this.list.push(...TEXT.getTemplate(templateName));
      if (this.list.length === 0 || this.list[0] === "") {
        this.iShow = false;
      }
    },
  },
});
</script>
