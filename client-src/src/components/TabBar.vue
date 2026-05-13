<template>
  <div id="tabBar" class="tabBar buttonRow" :key="currentStateKey" :data-testId="testId">
    <div>
      <p v-html="menu.header"></p>
    </div>
    <div role="navigation">
      <ul>
        <li :title="menu.listAllTitle">
          <router-link class="button" :to="urls[0]">{{ menu.listAllName }}</router-link>
        </li>
        <li :title="menu.newTitle">
          <router-link class="button" :to="urls[1]">{{ menu.newName }}</router-link>
        </li>
        <li :title="menu.findTitle">
          <span class="button"
            role="button"
            @click.prevent="onSearch"
            v-touch.prevent="onSearch"
            @keypress="onSearch"
          >{{ menu.findItem }}</span>
        </li>

        <li>
          <span
            class="menuTrigger"
            aria-haspopup="menu"
            :aria-pressed="menuStateRef"
            role="button"
            @click.prevent="onMenu"
            v-touch="onMenu"
            @keypress="onMenu"
            :title="menu.actualMenuTitle"
          ></span>
          <menu class="menuTrigger" role="navigation" :data-testId="menuId" :aria-hidden="!menuStateRef">
            <li>
              <span
                role="button"
                :title="menu.installTitle"
                :class="installEnabled"
                v-touch.prevent="onInstall"
                @click.prevent.once="onInstall"
                @keypress.prevent="onInstall"
              >
                {{ menu.installName }}
              </span>
            </li>
            <li>
              <span
                role="button"
                class="button"
                :title="menu.helpTitle"
                v-touch.prevent="onIntersitial"
                @click.prevent.once="onIntersitial"
                @keypress.prevent="onIntersitial"
                >{{ menu.helpName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                role="button"
                :title="menu.renameTitle"
                class="button"
                v-touch="onName"
                @click.prevent="onName"
                @keypress="onName"
                >{{ menu.renameName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                :title="menu.dupeTitle"
                class="button"
                role="button"
                v-touch.prevent="onDuplicate"
                @click.prevent="onDuplicate"
                @keypress.prevent="onDuplicate"
                >{{ menu.dupeName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                class="button"
                role="button"
                :title="menu.uniqTitle"
                v-touch.prevent="onUnique"
                @click.prevent="onUnique"
                @keypress.prevent="onUnique"
                >{{ menu.uniqName }}</span
              >
            </li>
            <li>
              <span
                :title="menu.saveTitle"
                :aria-disabled="hasData"
                role="button"
                class="button"
                v-touch="onSave"
                @click.prevent="onSave"
                @keypress.prevent="onSave"
                >{{ menu.saveName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                v-touch.once="onRevert"
                :title="menu.revertTitle"
                role="button"
                @click.prevent.once="onRevert"
                @keypress.prevent.once="onRevert"
                class="button"
              >
                {{ menu.revertName }}
              </span>
            </li>
            <li>
              <br /><small>{{ menu.outro }}</small>
            </li>
          </menu>
        </li>
      </ul>
    </div>
    <EnterInput :val="getInputRef" :visible="visibleRef" :cb="CBRef" :testid="inputId" :currentStateKey="EIK"></EnterInput>
  </div>
</template>

<script lang="ts">
// https://github.com/josueggh/a11y-cheatsheet
import { defineComponent, inject, ref } from "vue";
import type { MethodOptions } from 'vue';
import { useRoute } from 'vue-router';

import { useStore } from "../services/Store";
import type { COMPLETE_STORE } from '../services/Store';
import { AList } from "../services/AList";
import { ListData, setupCurrentList } from "../services/DataFactory";
import { useCacheWrapper, CacheWrapper } from "../workers/InstallWorker";
import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";
import { useUserActions, noop } from '../services/UserActions';
import type { ExternalMethods, CBType } from '../services/UserActions';
import { StaticRoutes } from "./Routing";
import EnterInput from "./EnterInput.vue";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { TabBarProps } from "../types/ComponentProps";

const TEXT = useUIText();

/**
   * TabBar
   * A component for the top menu
	- the params listed are props to the component.
	- the functions below are described in the Vue docs, and they are predictable.

   * @param {string} currentStateKey
   * @public
   * @returns {string} - eventually :-)
   */
export default defineComponent({
  name: "TabBar",
  components: { EnterInput },
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    },
  },
 // inject: [ 'dataOnLoad' ],
  setup() {
    const dataOnLoad:boolean=inject<boolean>('dataOnLoad');
    const visibleRef = ref<boolean>(false);
    const getInputRef= ref<string>("") ;
    const CBRef= ref<CBType>(noop); 
    const storeRef =ref<COMPLETE_STORE>(useStore());   
    const menuStateRef= ref<boolean>( false);

    let stack:ExternalMethods;
    try {
      stack = useUserActions(useStore(), ListData, useCacheWrapper(), useRoute() );
      let annoying =stack.mount( {visibleRef, getInputRef, CBRef, storeRef, menuStateRef, ListData} );
      return { extraMethods:annoying, dataOnLoad, menuStateRef, visibleRef, getInputRef, CBRef, storeRef, ctx:{visibleRef, getInputRef, CBRef, storeRef, menuStateRef} };
    } catch(e:unknown) {
      console.log("TabBar.setup():",  (e as Error).message );
    }
  },
  data(): TabBarProps {
    const CACHE: CacheWrapper = useCacheWrapper();
    let état = "button";
    if (location.protocol !== "https:") {
      état += " disabled";
    } else if (CACHE.check()) {
      état += " disabled";
    }

    return {
      menuLabel:  TEXT.get("menu.symbol"),
      menuState: "hide",
      menuOpen: false,
      getInput: "",
      loadedStateKey:"",
      CB: Function as any,
      installEnabled: état,
      EIK: this.$props.currentStateKey + "false",
      inputId: this.testId + "input1",
      menuId: this.testId + "Menu1",
      hasData:  this.dataOnLoad,
      urls: [mapURL("allList", null), mapURL("aList", -1)],
      menu: {
        header: TEXT.get("menu.header1"),
        symbol: TEXT.get("menu.symbol"),
        listAllTitle: TEXT.get("menu.listAllTitle"),
        listAllName: TEXT.get("menu.listAllName"),
        newTitle: TEXT.get("menu.newTitle"),
        newName: TEXT.get("menu.newName"),
        actualMenuTitle: TEXT.get("menu.actualMenuTitle"),
        installTitle: TEXT.get("menu.installTitle"),
        installName: TEXT.get("menu.installName"),
        helpTitle: TEXT.get("menu.helpTitle"),
        helpName: TEXT.get("menu.helpName"),
        renameTitle: TEXT.get("menu.renameTitle"),
        renameName: TEXT.get("menu.renameName"),
        dupeTitle: TEXT.get("menu.dupeTitle"),
        dupeName: TEXT.get("menu.dupeName"),
        uniqTitle: TEXT.get("menu.uniqTitle"),
        uniqName: TEXT.get("menu.uniqName"),
        saveTitle: TEXT.get("menu.saveTitle"),
        saveName: TEXT.get("menu.saveName"),
        revertTitle: TEXT.get("menu.revertTitle"),
        revertName: TEXT.get("menu.revertName"),
        findItem: TEXT.get("menu.findItem"),
        findTitle:  TEXT.get("menu.findTitle"),
        outro: TEXT.get("menu.outro"),
      },
    } satisfies TabBarProps;
  },
  mounted() {
    if (!this.shopStore) {
      throw new Error("You must hava a real Store (Vuex Object, not a actual shop) to run the App.");
    }
    this.initGeneratedMethods();
  },
  methods: {
  ...(() => ({}))(), // placeholder to keep Vue happy
  initGeneratedMethods() {
    Object.assign(this, this.extraMethods);
  }
},
});
</script>
