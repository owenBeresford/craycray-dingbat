<template>
  <ThisList currentStateKey="{id}" :shopStore="store" :factory="factory"></ThisList>
</template>
<script lang="ts">
//
// this class exists as a one-hnd-clapping version of the App, to match the inject/provide thing
//      as that was making errors in the unbit tests
// inject/ provide saves typing, but is horrid for tests
//
import { defineComponent, vue } from "vue";
import { Store } from "vuex";

import type { ShopState } from '../types/ShopState';
import { useStore } from "../services/Store";
import { AList } from "../services/AList";
import type { PromiseSucceed, PromiseReject } from "../types/promises";
import ThisList from "./ThisList.vue";

const FakeCollection = {
  /*  
  create(nom: string): number {}
  poll(): Promise<boolean> {}
  count(): number {}
  delete(id: number): boolean {} 
  list(): Array<ListStruct> {}
  get(id: number): AList | null {} 
  put(id: number, ret: AList): boolean {} 
  store(ret: AList, offset: number): boolean {} 
  saveAllLists(): boolean {}
  loadAllLists(): boolean {}
*/
  create: function (nom) {
    return this;
  },
  count: function () {
    return 2;
  },
  delete: function (id) {
    return true;
  },
  put: function (id, ret) {
    return true;
  },
  store: function (ret, offset) {
    return true;
  },
  saveAllLists: function () {
    return true;
  },
  loadAllLists: function () {
    return true;
  },

  poll: function () {
    return new Promise((good: PromiseSucceed, bad: PromiseReject) => {
      good(false);
    });
  },

  list: function () {
    return [
      {
        nom: "test1",
        créé: new Date(),
        modifié: new Date(),
        énumérer: 1,
        id: 1,
      },
      {
        nom: "test2",
        créé: new Date(),
        modifié: new Date(),
        énumérer: 1,
        id: 2,
      },
    ]; //  as Array<ListStruct>
  },

  get: function (id) {
    return AList.manual("test1", 1);
  },
} as Listable;
// const getFakeFactory=function () { return FakeCollection.create(); };

// I can't find return type data
// export function createTestWrapper(id:string, store:Store<ShopState>, factory:ListCollection ) {

export default defineComponent({
  name: "PlaceholderThislist",
  components: { ThisList },
  provide: {
    // https://v1.test-utils.vuejs.org/api/options.html#provide
    // this is "the slow syntax", but its a test not production code
    helpText: "menu",
    canSeeHelp: false,
    ttl: 5000,
  },
  data() {
    return {
      id: "test1",
      store: useStore(),
      factory: FakeCollection.create(),
    };
  },
});
</script>
