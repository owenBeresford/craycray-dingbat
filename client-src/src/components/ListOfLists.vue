<template>
  <div class="ListOfList" :data-testid="instanceId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="secondId" :testId="viewId" />
    <ul :data-testId="listId">
      <li v-for="i in shoppingLists" :key="i.id" :title="`Access the ${i.nom} list `" class="row flex-container flex-dir-row flex-wrap">
        <span class="flex-child-auto">
          <img
            width="30"
            height="30"
            :src="logoPath"
            aria-hidden="true"
            role="presentation"
            alt="The app logo - Improve text here"
          />
        </span>
        <span class="centre flex-child-auto" role="button" :title="`This links leads to the list called '${i.nom}'`">
          <router-link :to="`${mapURL('aList', i.id)}`" class="button">{{ i.nom }}</router-link>
        </span>
        <span class="flex-child-auto">
          ~ from {{ i.créé.getUTCDate() }}-{{ i.créé.getUTCMonth() + 1 }}-{{ i.créé.getUTCFullYear() }},
          {{ i.énumérer }} items.
        </span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { DELAY_FOR_API, LOGO_PATH } from "../Constants";
import { useStore } from "../services/Store";
import { ListData } from "../services/DataFactory";
import { mapURL } from "../services/URLs";
import InterstitialView from "./InterstitialView.vue";
import type { ListStruct } from "../types/ListCollection";
import type { ListOfListsProps } from "../types/ComponentProps";

/**
   * ListOfLists
   * A component for a small form to enter a singular text field.
   * Used to add items to the lists, or names of list etc
	- the params listed are props to the component.  None here.
	- the functions below are described in the Vue docs, and they are predictable.

   * @public
   * @returns {string}
   */
export default defineComponent({
  name: "ListOfLists",
  components: { InterstitialView },
  mounted() {
    const itinéraire = useRoute();
    this.$props.fixPath(itinéraire);
    if (this.$props.shopStore) {
      this.$props.shopStore.commit("setPath", itinéraire.path);
    } else if (this.shopStore) {
      this.shopStore.commit("setPath", itinéraire.path);
    }

    if (ListData.currentData && ListData.currentData.count() === 0) {
      // if this reference doesn't happen to be the first mention, it will have API content
      // I wish I could use Promises.then, but I can't really make the data() async
      // API should never take more than 500ms, as its not doing much, as its on LAN
      setTimeout(() => {
        if (!ListData.currentData) {
          throw new Error("Check server is running");
        }

        if (this.$data.shoppingLists) {
          this.$data.shoppingLists = [...ListData.currentData.list()];
        } else {
          this.$data.shoppingLists = ListData.currentData.list();
        }
      }, DELAY_FOR_API);
    }
  },
  inject: ["helpText", "canSeeHelp", "ttl"],
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    },
    fixPath: { type: Function, required: true },
  },
  data(): ListOfListsProps {
    // IOIO XXX thats not a realtime view, I might need to replace this, with a prop
    // i normally do a page refresh to get a fresh set of data.
    let chose: Array<ListStruct> = [];
    if (ListData.currentData) {
      chose = ListData.currentData.list();
    }
    return {
      instanceId: this.$props.testId,
      viewId: this.$props.testId + "View1",
      listId: this.$props.testId + "List1",
      secondId: this.$props.currentStateKey + "View",

      logoPath: LOGO_PATH,
      shoppingLists: chose,
      mapURL,
    } satisfies ListOfListsProps;
  },
});
</script>
