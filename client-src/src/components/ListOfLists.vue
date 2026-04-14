<template>
  <div class="ListOfList" :data-testid="instanceId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="betterId" :testId="viewId" />
    <ul :data-testId="listId">
      <li v-for="i in shoppingLists" :key="i.id" :title="`Display the ${i.nom} list.`">
        <span class="centre">
          <router-link :to="`${mapURL('aList', i.id)}`" class="button">{{ i.nom }}</router-link>
          &nbsp;&nbsp; ~ from {{ i.créé.getUTCDate() }}-{{ i.créé.getUTCMonth() + 1 }}-{{ i.créé.getUTCFullYear() }},
          {{ i.énumérer }} items
        </span>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { DELAY_FOR_API } from "../Constants";
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
  computed: {
    betterId() {
      return this.$props.currentStateKey + "view";
    },
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
    // IOIO XXX thats not a realtime view, I might need to replace this, to a prop
    let ll: Array<ListStruct> = [];
    if (ListData.currentData) {
      ll = ListData.currentData.list();
    }
    return {
      instanceId: this.$props.testId,
      viewId: this.$props.testId + "View1",
      listId: this.$props.testId + "List1",

      shoppingLists: ll,
      mapURL,
    } as ListOfListsProps;
  },
});
</script>
