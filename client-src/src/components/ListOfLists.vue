<template>
  <div class="listage" :data-testid="instanceId" :key="currentStateKey">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="{ betterId }" />
    <ul>
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
import { DataFactory } from "../services/DataFactory";
import { mapURL } from "../services/URLs";
import { ListService } from "../services/ListService";
import { AList } from "../services/AList";
import { API_RETRY } from "../Constants";
import { nextId } from "../services/util";
import InterstitialView from "./InterstitialView.vue";
import type { ListStruct } from '../types/ListCollection';
import type { ListOfListsProps } from '../types/ComponentProps';
// IOIO the first time you compile this; comment the link to routing; this is a dep loop
// I will build a better solution
// import {StaticRoutes} from './Routing';

const DATA = await DataFactory();
  /**
   * ListOfLists
   * A component for a small form to enter a singular text field.  
   * Used to add items to the lists, or names of list etc
	- the params listed are props to the component.  None here.
	- the functions below are described in the Vue docs, and they are predictable.
 
   * @public
   * @return {string}
   */
export default defineComponent({
  name: "ListOfLists",
  components: { InterstitialView },
  mounted() {
    //    if (this.$route.path === '/') {
    //      StaticRoutes.push({ name: 'list-everything' });
    //    }
    this.$store.commit("setPath", this.$route.path);
    this.$store.commit("setId", -1);
    if (DATA.count() === 0) {
      // if this reference doesn't happen to be the first mention, it will have API content
      // I wish I could use Promises.then, but I can't really make the data() async
      // API should never take more than 500ms, as its not doing much, as its on LAN
      setTimeout(() => {
        if (this.$data.shoppingLists) {
          this.$data.shoppingLists = [...DATA.list()];
        } else {
          this.$data.shoppingLists = DATA.list();
        }
      }, 500);
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
  },
  data(): LocalData {
    return {
      instanceId: nextId(),
      shoppingLists: DATA.list() ?? [],
      mapURL,
    } as LocalData;
  },
});
</script>
