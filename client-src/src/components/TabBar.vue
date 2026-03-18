<template>
  <div id="tabBar" class="tabBar buttonRow" :data-testid="instanceId" :key="currentStateKey">
    <div>
      <p>Shopping list</p>
    </div>
    <div>
      <ul>
        <li class="button" title="Render a list of current shopping lists">
          <router-link :to="urls[0]">List All</router-link>
        </li>
        <li class="button" title="Start a new shopping list">
          <router-link :to="urls[1]">New</router-link>
        </li>
        <li style="text-align: right">
          <span
            class="obmenu bigger"
            @click="onMenu"
            v-touch="onMenu"
            @keypress="onMenu"
            title="Show or hide the extra features."
            v-html="menuLabel"
          ></span>
          <ul :class="menuState">
            <li
              :class="buttonEnabled"
              title="Copy app to your phone, for offline usage. Needed once"
              @click="onInstall"
            >
              Install
            </li>
            <li title="Show a help overlay...">
              <a class="button" v-touch="onIntersitial" @click.once="onIntersitial" @keypress="onIntersitial"
                >Show help</a
              >
            </li>
            <li title="Give the current list a name">
              <a class="button" v-touch="onName" @click="onName" @keypress="onName"> Rename list</a>
            </li>
            <li title="Duplicate current list">
              <a class="button" v-touch="onDuplicate" @click="onDuplicate" @keypress="onDuplicate"> Duplicate list</a>
            </li>
            <li title="Feature to allow copying items from one list to another">
              <a class="button" v-touch="onUnique" @click="onUnique" @keypress="onUnique"> Make unique</a>
            </li>
            <li title="Save current lists">
              <a class="button" v-touch="onSave" @click="onSave" @keypress="onSave"> Save all</a>
            </li>
            <li title="Change the list back to its initial state">
              <a v-touch.once="onRevert" @click.once="onRevert" @keypress.once="onRevert" class="button">
                Revert all
              </a>
            </li>
            <li><br /><small>Add more as needed</small></li>
          </ul>
        </li>
      </ul>
    </div>
    <EnterInput :val="getInput" :visible="visible" :cb="CB" :data-testid="-1" :currentStateKey="inputTabBarfalse" ></EnterInput>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "../services/Store";
import { StaticRoutes } from "./Routing";
import { AList } from "../services/AList";
import { ListService } from "../services/ListService";
import { DataFactory } from "../services/DataFactory";
import EnterInput from "./EnterInput.vue";
import { useCacheWrapper } from "../workers/InstallWorker";
import { GuessEvent } from "../services/util";
import { mapURL } from "../services/URLs";
import { UI_EN_GB, useUIText } from "../services/Localisation";
import { nextId } from "../services/util";

const TEXT = useUIText();
const MENU_OPEN = TEXT.get("menu");
const MENU_CLOSE = TEXT.get("cross");

export default defineComponent({
  name: "TabBar",
  components: { EnterInput },
  props:{
    currentStateKey: { type: String, required: true },
  },
  async data() {
    const CACHE = useCacheWrapper();
    let tt = "button";
    if (location.protocol !== "https:") {
      tt += " disabled";
    } else if (CACHE.check()) {
      tt += " disabled";
    }

    return {
      instanceId: nextId(),
      conn: await DataFactory(),
      menuLabel: MENU_OPEN,
      menuState: "hide",
      getInput: "",
      $store: useStore(),
      visible: false,
      CB: Function as any,
      mapURL,
      CACHE,
      buttonEnabled: tt,
      urls: [mapURL("allList", null), mapURL("aList", -1)],
    };
  },

  methods: {
    onIntersitial(e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        return false;
      }

      console.log("Trying to show help", this.$route.path);
      if (this.$store.state.currentURL !== this.$route.path) {
        console.warn("The state.currentURL hasn't updated!");
        this.$store.commit("setPath", this.$route.path);
      }
      this.$store.commit("show", true);
      e.preventDefault();
      return false;
    },

    onInstall(e: GuessEvent) {
      if (e.type && e.type === "mouseup") {
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
      console.log("TO TEST make unique");

      const llist = this.conn.get(this.$store.state.currentId);
      if (llist) {
        llist.unique();
        this.conn.put(this.$store.state.currentId, llist);
      }

      e.preventDefault();
      return false;
    },

    onDuplicate(e: GuessEvent): boolean {
      const llist = this.conn.get(this.$store.state.currentId);
      if (llist) {
        const extra = Object.assign(AList.manual(`DUP: ${llist.nom}`, this.conn.catalog.length), llist);
        extra.editName(`DUP: ${llist.nom}`);
        this.conn.append(extra);
      }
      StaticRoutes.push({ name: "list-everything" });
      e.preventDefault();
      return false;
    },

    onName(e: GuessEvent): boolean {
      const list = this.conn.get(this.$store.state.currentId);
      if (!list) {
        console.warn("EDIT NAME: got bad id, don't know how to proceed");
        return false;
      }
      this.getInput = list.nom ?? "pls retype";

      this.CB = (d1: string | null): any => {
        if (d1 === null) {
          this.visible = false;
          return;
        }
        list.editName(d1);
        this.conn.put(this.$store.state.currentId, list);
        this.visible = false;
        StaticRoutes.push({ name: "list-everything" });
      };
      this.visible = true;
      e.preventDefault();
      return false;
    },

    onSave(e: GuessEvent): boolean {
      console.log("Saving list to local cache list, for all lists");
      this.conn.saveAllLists();
      e.preventDefault();
      return false;
    },
    onRevert(e: GuessEvent): boolean {
      console.log("Rebuilding data from cache for all lists");
      this.conn.loadAllLists();
      e.preventDefault();
      return false;
    },
    onMenu(e: GuessEvent): boolean {
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
      e.preventDefault();
      return false;
    },
  },
});
</script>
