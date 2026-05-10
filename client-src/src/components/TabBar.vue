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
            @click.prevent="onFind"
            v-touch.prevent="onFind"
            @keypress="onFind"
          >{{ menu.findItem }}</span>
        </li>
        
        <li>
          <span
            class="obmenu foldPoint"
            aria-haspopup="menu"
            :aria-pressed="menuOpen"
            role="button"
            @click.prevent="onMenu"
            v-touch="onMenu"
            @keypress="onMenu"
            :title="menu.actualMenuTitle"
            v-html="menuLabel"
          ></span>
          <menu :class="menuState" role="navigation" :data-testId="menuId">
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
    <EnterInput :val="getInput" :visible="visible" :cb="CB" :testid="inputId" :currentStateKey="EIK"></EnterInput>
  </div>
</template>

<script lang="ts">
// https://github.com/josueggh/a11y-cheatsheet
import { defineComponent } from "vue";
import type { MethodOptions } from 'vue';
import { useRoute } from 'vue-router';

import { useStore } from "../services/Store";
import { AList } from "../services/AList";
import { ListData, setupCurrentList } from "../services/DataFactory";
import { useCacheWrapper, CacheWrapper } from "../workers/InstallWorker";
import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";
import { useUserActions } from '../services/UserActions';
import type { ExternalMethods } from '../services/UserActions';
import { StaticRoutes } from "./Routing";
import EnterInput from "./EnterInput.vue";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { TabBarProps } from "../types/ComponentProps";

const TEXT = useUIText();
// a:shopStore, b:FactoryArtefact, c:CacheWrapper, d:RouteRecordNormalized 
const stack:ExternalMethods = useUserActions(useStore(), setupCurrentList(undefined), useCacheWrapper(), useRoute() );


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
  inject: [ 'dataOnLoad' ],
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
      visible: false,
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
        outro: TEXT.get("menu.outro"),
      },
    } satisfies TabBarProps;
  },
  mounted() {
    if (!this.shopStore) {
      throw new Error("You must hava a real Store (Vuex Object, not a actual shop) to run the App.");
    }
    console.log("This should have some data in it.  ListData.currentData");
    console.dir(ListData.currentData);
    console.log([mapURL("allList", null), mapURL("aList", -1)]);

  },
  methods: stack.mount([
    // These functions are mounted to the component object inside mount() call.
    // The TS error checking isn't seeing runtime behaviour
    function onMenu(e: GuessEvent): boolean {
      // IOIO can simplify this code to be CSS rendering, and just menu state set here
      if (this.menuLabel ===  TEXT.get("menu.symbol")) {
        this.menuLabel = TEXT.get("cross");
        this.menuState = "obmenu";
        // ".tabBar.buttonRow .obmenu.foldPoint"
        this.menuOpen = true;
      } else {
        this.menuLabel =  TEXT.get("menu.symbol");
        this.menuState = "hide";
        this.menuOpen = false;
      }
      return false;
    },
   function onName( ): boolean {
      const liste = ListData.currentData.get(this.shopStore.state.currentId);
      if (!liste) {
        console.warn("EDIT NAME: got bad id, don't know how to proceed");
        return false;
      }
      this.getInput = liste.nom ?? TEXT.get("menu.renameSupport");
      const SELF=this;
      this.CB = (d1: string | null): any => {
        if (d1 === null) {
          SELF.visible = false;
          return;
        }
        if (!SELF.shopStore) {
          throw new Error("2357675675357578 Impossible");
        }
        liste.editName(d1);
        ListData.currentData.put(SELF.shopStore.state.currentId, liste);
        SELF.visible = false;
        StaticRoutes.push({ name: "list-everything" });
      };
      this.visible = true;
      return false;
    },
    function onSearch(e: GuessEvent): boolean {
       this.getInput ="";
       const SELF=this;
       // this is an arrow function, so 
       this.CB = (d1: string | null): any => {
        if (d1 === null || d1==="") {
          SELF.visible = false;
          return;
        }
 
        let newList=AList.serps( 
            ListData.currentData.searchItems( d1)
            );
        SELF.visible = false;
        StaticRoutes.push({ name: "serps", state: { payload: newList } });
      };
        SELF.visible=true;
        return false;
    },    
   ], this),
});
</script>
