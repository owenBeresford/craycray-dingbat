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
        <li style="text-align: right">
          <span
            class="obmenu bigger"
            aria-haspopup="menu"
            role="button"
            @click="onMenu"
            v-touch="onMenu"
            @keypress="onMenu"
            :title="menu.actualMenuTitle"
            v-html="menuLabel"
          ></span>
          <menu :class="menuState" role="navigation" :data-testId="menuId">
            <li :title="menu.installTitle">
              <a :class="buttonEnabled" v-touch="onInstall" @click.once="onInstall" @keypress="onInstall">
                {{ menu.installName }}
              </a>
            </li>
            <li :title="menu.helpTitle">
              <a class="button" v-touch="onIntersitial" @click.once="onIntersitial" @keypress="onIntersitial">{{
                menu.helpName
              }}</a>
            </li>
            <li :title="menu.renameTitle">
              <a disabled="{!currentData}" class="button" v-touch="onName" @click="onName" @keypress="onName">{{
                menu.renameName
              }}</a>
            </li>
            <li :title="menu.dupeTitle">
              <a
                disabled="{!currentData}"
                class="button"
                v-touch="onDuplicate"
                @click="onDuplicate"
                @keypress="onDuplicate"
                >{{ menu.dupeName }}</a
              >
            </li>
            <li :title="menu.uniqTitle">
              <a disabled="{!currentData}" class="button" v-touch="onUnique" @click="onUnique" @keypress="onUnique">{{
                menu.uniqName
              }}</a>
            </li>
            <li :title="menu.saveTitle">
              <a disabled="{!currentData}" class="button" v-touch="onSave" @click="onSave" @keypress="onSave">{{
                menu.saveName
              }}</a>
            </li>
            <li :title="menu.revertTitle">
              <a
                disabled="{!currentData}"
                v-touch.once="onRevert"
                @click.once="onRevert"
                @keypress.once="onRevert"
                class="button"
              >
                {{ menu.revertName }}
              </a>
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
import { defineComponent } from "vue";

import { useStore } from "../services/Store";
import { StaticRoutes } from "./Routing";
import { AList } from "../services/AList";
//import { ListService } from "../services/ListService";
import { ListData } from "../services/DataFactory";
import EnterInput from "./EnterInput.vue";
import { useCacheWrapper, CacheWrapper } from "../workers/InstallWorker";
import type { GuessEvent } from "../types/infill-DOM-types-for-tests";
import { mapURL } from "../services/URLs";
import { UI_EN_GB, useUIText } from "../services/Localisation";
import { TabBarProps } from "../types/ComponentProps";

const TEXT = useUIText();
const { currentData, initData } = ListData;
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
  },
  data(): TabBarProps {
    const CACHE: CacheWrapper = useCacheWrapper();
    let tt = "button";
    if (location.protocol !== "https:") {
      tt += " disabled";
    } else if (CACHE.check()) {
      tt += " disabled";
    }

    return {
      menuLabel: MENU_OPEN,
      menuState: "hide",
      getInput: "",
      $store: useStore(),
      visible: false,
      CB: Function as any,
      mapURL,
      CACHE: CACHE,
      buttonEnabled: tt,
      EIK: this.$props.currentStateKey + "false",
      inputId: this.testId + "input1",
      menuId: this.testId + "Menu1",
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
    };
  },

  methods: {
    onIntersitial(e: GuessEvent): boolean {
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        return false;
      }

      console.log("Trying to show help", this.$route.path);
      if (this.$store.state.currentURL !== this.$route.path) {
        console.warn("The state.currentURL hasn't updated!");
        this.$store.commit("setPath", this.$route.path);
      }
      this.$store.commit("show", true);
      return false;
    },

    onInstall(e: GuessEvent) {
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        // suppress dupe events
        return false;
      }
      if (location.protocol !== "https:") {
        console.log("Install button is disabled, you need to use HTTPS.");
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
      console.log("TO TEST make unique");

      const llist = currentData.get(this.$store.state.currentId);
      if (llist) {
        llist.unique();
        currentData.put(this.$store.state.currentId, llist);
      }

      return false;
    },

    onDuplicate(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }
      const llist = currentData.get(this.$store.state.currentId);

      if (llist) {
        const extra = Object.assign(AList.manual(`DUP: ${llist.nom}`, currentData.count()), llist);
        extra.editName(`DUP: ${llist.nom}`);
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

      const list = currentData.get(this.$store.state.currentId);
      if (!list) {
        console.warn("EDIT NAME: got bad id, don't know how to proceed");
        return false;
      }
      this.getInput = list.nom ?? TEXT.get("menu.renameSupport");

      this.CB = (d1: string | null): any => {
        if (d1 === null) {
          this.visible = false;
          return;
        }
        list.editName(d1);
        currentData.put(this.$store.state.currentId, list);
        this.visible = false;
        StaticRoutes.push({ name: "list-everything" });
      };
      this.visible = true;
      return false;
    },

    onSave(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }
      console.log("Saving list to local cache list, for all lists");

      currentData.saveAllLists();
      return false;
    },
    onRevert(e: GuessEvent): boolean {
      e.preventDefault();
      if (!currentData) {
        return false;
      }

      console.log("Rebuilding data from cache for all lists");
      currentData.loadAllLists();
      return false;
    },
    onMenu(e: GuessEvent): boolean {
      e.preventDefault();
      if (e.type && e.type === "mouseup") {
        return false;
      }
      if (this.menuLabel === MENU_OPEN) {
        this.menuLabel = MENU_CLOSE;
        this.menuState = "obmenu";
      } else {
        this.menuLabel = MENU_OPEN;
        this.menuState = "hide";
      }
      return false;
    },
  },
});
</script>
