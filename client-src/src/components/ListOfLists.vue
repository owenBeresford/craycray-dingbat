<template>
  <div class="ListOfList" :data-testid="instanceId" :key="smartKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="secondId" :testId="viewId" />
    <ul :data-testId="listId">
      <li
        v-for="i in shoppingLists"
        :key="i.id"
        :title="`Access the ${i.nom} list `"
        class="row flex-container flex-dir-row flex-wrap"
      >
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
    <span class="hide" v-html="smartKey"></span>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useRoute } from "vue-router";

import { DELAY_FOR_API, LOGO_PATH } from "../Constants";
import { useStore, type COMPLETE_STORE } from "../services/Store";
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
  },
  inject: ["helpText", "canSeeHelp", "ttl", "listData", "dataOnLoad"],
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    shopStore: {
      type: Object,
      default: (): COMPLETE_STORE => {
        return useStore();
      },
    },
    fixPath: { type: Function, required: true },
  },
  data(): ListOfListsProps {
    //console.debug("ListOfLists->data", this.dataOnLoad   );
    return {
      instanceId: this.$props.testId,
      viewId: this.$props.testId + "View1",
      listId: this.$props.testId + "List1",
      secondId: this.$props.currentStateKey + "View",
      logoPath: LOGO_PATH,
      mapURL,
    } satisfies ListOfListsProps;
  },
  computed: {
    smartKey: function (): string {
      return (
        this.$props.currentStateKey + "_" + this.dataOnLoad.listCountRef.value + "_" + this.listData.currentData.count()
      );
    },

    shoppingLists: function (): Array<ListStruct> {
      // console.debug("ListOfLists->shoppingLists", this.dataOnLoad.listCountRef.value);
      // this is a NECESSARY magic side-effect.  As the value is read, this gets recomnputed
      // DO NOT DELETE, unless making the this.listData.currentData reactive and inside the Vue engine
      let _ = this.dataOnLoad.listCountRef.value;
      let chose: Array<ListStruct> = [];
      if (this.listData.currentData) {
        chose = this.listData.currentData.list();
      }
      return chose;
    },
  },
});
</script>
