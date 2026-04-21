<template>
  <div id="tabBar" class="tabBar buttonRow" :key="currentStateKey" :data-testId="testId">
    <div>
      <p v-html="menu.header"></p>
    </div>
    <div role="navigation">
      <ul>
        <li class="button" :title="menu.listAllTitle">
          <router-link :to="urls[0]">{{ menu.listAllName }}</router-link>
        </li>
        <li class="button" :title="menu.newTitle">
          <router-link :to="urls[1]">{{ menu.newName }}</router-link>
        </li>
        <li>
          <span
            class="obmenu foldPoint"
            aria-haspopup="menu"
            :aria-pressed="menuOpen"
            role="button"
            @click="onMenu"
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
                v-touch="onInstall"
                @click.once="onInstall"
                @keypress="onInstall"
              >
                {{ menu.installName }}
              </span>
            </li>
            <li>
              <span
                role="button"
                class="button"
                :title="menu.helpTitle"
                v-touch="onIntersitial"
                @click.once="onIntersitial"
                @keypress="onIntersitial"
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
                @click="onName"
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
                v-touch="onDuplicate"
                @click="onDuplicate"
                @keypress="onDuplicate"
                >{{ menu.dupeName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                class="button"
                role="button"
                :title="menu.uniqTitle"
                v-touch="onUnique"
                @click="onUnique"
                @keypress="onUnique"
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
                @click="onSave"
                @keypress="onSave"
                >{{ menu.saveName }}</span
              >
            </li>
            <li>
              <span
                :aria-disabled="hasData"
                v-touch.once="onRevert"
                :title="menu.revertTitle"
                role="button"
                @click.once="onRevert"
                @keypress.once="onRevert"
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

import { useStore } from "../services/Store";
import { AList } from "../services/AList";
import { ListData } from "../services/DataFactory";
import { useCacheWrapper, CacheWrapper } from "../workers/InstallWorker";
import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";
import { StaticRoutes } from "./Routing";
import { hashState } from '../../../common/util';
import EnterInput from "./EnterInput.vue";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { TabBarProps } from "../types/ComponentProps";

const TEXT = useUIText();
const { currentData, updateData, initData } = ListData;
const MENU_OPEN = TEXT.get("menu.symbol");
const MENU_CLOSE = TEXT.get("cross");

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
  data(): TabBarProps {
    const CACHE: CacheWrapper = useCacheWrapper();
    let état = "button";
    if (location.protocol !== "https:") {
      état += " disabled";
    } else if (CACHE.check()) {
      état += " disabled";
    }

    return {
      menuLabel: MENU_OPEN,
      menuState: "hide",
      menuOpen: false,
      getInput: "",
      visible: false,
      CB: Function as any,
      mapURL,
      CACHE: CACHE,
      installEnabled: état,
      EIK: this.$props.currentStateKey + "false",
      inputId: this.testId + "input1",
      menuId: this.testId + "Menu1",
      hasData: currentData != undefined,
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
    this.loadedStateKey=hashState(currentData.list() );
  },
  methods: {
    onIntersitial(e: GuessEvent): boolean {
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        return false;
      }

      console.log("Trying to show help", this.$route.path);
      if (this.shopStore && this.shopStore.state.currentURL !== this.$route.path) {
        console.warn("The state.currentURL hasn't updated!", this.shopStore.state.currentURL, this.$route.path);
        this.shopStore.commit("setPath", this.$route.path);
      }
      if (this.shopStore) {
        this.shopStore.commit("show", true);
      }
      return false;
    },

    onInstall(e: GuessEvent) {
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        // suppress dupe events
        return false;
      }
      if (location.protocol !== "https:") {
        console.warn("Install button is disabled, you need to use HTTPS.");
        return;
      }
      if (this.CACHE.check()) {
        console.warn("App thinks its already installed.");
        return;
      }

      console.log("Trying to install App to local device.");
      this.CACHE.install();
    },

    onUnique(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }
      if (_LOGGING_) {
        console.log("TO TEST make unique");
      }
      if (!this.shopStore) {
        throw new Error("2344568746356986 Impossible");
      }

      const liste = currentData.get(this.shopStore.state.currentId);
      if (liste) {
        liste.unique();
        currentData.put(this.shopStore.state.currentId, liste);
      }

      return false;
    },

    onDuplicate(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }
      if (!this.shopStore) {
        throw new Error("83456423493433 Impossible");
      }
      const liste = currentData.get(this.shopStore.state.currentId);

      if (liste) {
        const extra = Object.assign(AList.manual(`DUP: ${liste.nom}`, currentData.count()), liste);
        extra.editName(`DUP: ${liste.nom}`);
        currentData.append(extra);
      }
      StaticRoutes.push({ name: "list-everything" });
      return false;
    },

    onName(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }
      if (!this.shopStore) {
        throw new Error("2357675675357578 Impossible");
      }

      const liste = currentData.get(this.shopStore.state.currentId);
      if (!liste) {
        console.warn("EDIT NAME: got bad id, don't know how to proceed");
        return false;
      }
      this.getInput = liste.nom ?? TEXT.get("menu.renameSupport");

      this.CB = (d1: string | null): any => {
        if (d1 === null) {
          this.visible = false;
          return;
        }
        if (!this.shopStore) {
          throw new Error("2357675675357578 Impossible");
        }
        liste.editName(d1);
        currentData.put(this.shopStore.state.currentId, liste);
        this.visible = false;
        StaticRoutes.push({ name: "list-everything" });
      };
      this.visible = true;
      return false;
    },

    onSave(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData || !this.shopStore) {
        throw new Error("3598345234242 Impossible");
      }

      if( this.loadedStateKey===hashState(currentData.list()) ) {
        console.log("Data is identical as last save ");
        return false;
      } 
      console.log("Saving list to local cache list, for all lists");
      this.loadedStateKey=hashState(currentData.list());
      currentData.saveAllLists();
      return false;
    },

    onRevert(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData || !this.shopStore) {
        throw new Error("9845645234372323 Impossible");
      }
     
      if( this.loadedStateKey===hashState(currentData.list()) ) {
        console.log("Data is identical to initial state ");
        return false;
      }
      console.log("Rebuilding data from cache for all lists");
      currentData.loadAllLists();
      return false;
    },

    onMenu(e: GuessEvent): boolean {
      // IOIO can simplify this code to be CSS rendering, and just menu state set here
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        return false;
      }
      if (this.menuLabel === MENU_OPEN) {
        this.menuLabel = MENU_CLOSE;
        this.menuState = "obmenu";
        // ".tabBar.buttonRow .obmenu.foldPoint"
        this.menuOpen = true;
      } else {
        this.menuLabel = MENU_OPEN;
        this.menuState = "hide";
        this.menuOpen = false;
      }
      return false;
    },
  },
});
</script>
