<template>
  <div id="serpsContainer" class="serps" :key="currentStateKey" :data-testId="testId">
    <InterstitialView :display="helpText" :show="canSeeHelp" :ttl="ttl" :currentStateKey="helpId" :testId="viewId" />
    <p>{{ text.intro }}</p>
    <ul class="buttonRow">
      <li>
        <h3>{{ list.nom }}</h3>
      </li>
      <li><img width="40" height="40" :src="logoPath" aria-hidden="true" role="presentation" :alt="text.imgAlt" /></li>
      <li>
        <span
          :data-testId="saveId"
          class="button"
          role="button"
          :title="text.saveTitle"
          v-html="text.saveLabel"
          v-touch.prevent="onSave"
          @click.prevent="onSave"
          @keypress.prevent="onSave"
        ></span>
      </li>
    </ul>

    <ul class="aList" :data-testId="aListId">
      <li v-html="text.nout" v-show="!hasData"></li>
      <li v-for="(i, j) in initList" :key="i.key" :title="text.itemTitle">
        <span role="button" :title="text.listLink">
          From
          <router-link :to="`${mapURL('aList', i.list)}`" class="button"
            >{{ listTitles[i.list] }} (List#{{ i.list }})
          </router-link>
        </span>
        <span
          v-if="bisMobile"
          class="button info"
          :title="text.itemMBTitle"
          :data-offset="j"
          v-touch:swipe.left="onSwipe"
          v-touch-options="{ swipeTolerance: 80, rollOverFrequency: 500 }"
        >
          {{ i.item }}
        </span>
        <span
          v-else
          class="button info"
          :title="text.itemDTTitle"
          :data-offset="j"
          v-on:mouseleave="onDragStop"
          v-touch-options="{ dragTolerance: 200, longTapTimeInterval: 1000, rollOverFrequency: 400 }"
          v-on:mousedown="onDragStart"
          @blur="onDragExit"
        >
          {{ i.item }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
// https://github.com/josueggh/a11y-cheatsheet
import { defineComponent, inject } from "vue";
import { useRoute } from "vue-router";
import type { RouteRecordNormalized } from "vue-router";
import type { MethodOptions } from "vue";

import InterstitialView from "./InterstitialView.vue";
import { LOGO_PATH } from "../Constants";
import { isMobile } from "../../../common/util";
import { useStore } from "../services/Store";
import { StdList, SearchList, BaseList } from "../services/AList";

import { mapURL } from "../services/URLs";
import { useUIText } from "../services/Localisation";
import { MotionStream } from "../services/MotionStream";
import { LogService } from "../services/LogStack";
import { useSearchActions, SearchActions } from "../services/SearchActions";

import type { FactoryArtefact } from "../services/DataFactory";
import type { ExternalMethods, SearchCtx } from "../types/Actionables";
import type { COMPLETE_STORE } from "../services/Store";
import type { SearchProps, SearchStaticData } from "../types/ComponentProps";

const TEXT = useUIText();
export default defineComponent({
  name: "SearchList",
  components: { InterstitialView },
  props: {
    currentStateKey: { type: String, required: true },
    testId: { type: String, default: "test0" },
    term: { type: String, default: "" },
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    },
    route: {
      type: Object,
      default: () => {
        return useRoute();
      },
    },
  },
  setup(props: SearchProps) {
    const helpText: string = inject<string>("helpText");
    const canSeeHelp: boolean = inject<boolean>("canSeeHelp");
    const ttl: string = inject<number>("ttl");
    const log: LogService = inject<LogService>("log");
    const listData:FactoryArtefact = inject<FactoryArtefact >("listData");  

    let stack: ExternalMethods;
    try {
      const flux = new MotionStream<SearchCtx>();
      const list: SearchList = SearchList.serps(listData.currentData.searchItems(props.term));

      stack = useSearchActions(list, flux, listData);
      log.addRaw("User query: " + props.term, "info");
      return {
        extraMethods: stack.mount({}, stack),
        helpText,
        canSeeHelp,
        ttl,
        list,
        log,
        listData,
        ctx: {} as SearchCtx, // empty!!
      };
    } catch (e: unknown) {
      log.addRaw(
        "SearchResults.setup(): " + (e as Error).message + "  " + (e as Error).stack.substring(0, 200),
        "error"
      );
    }
  },
  data(): SearchStaticData {
    return {
      aListId: this.$props.testId + "Results1",
      viewId: this.$props.testId + "View1",
      saveId: this.$props.testId + "Save1",

      logoPath: LOGO_PATH,
      mapURL,
      bisMobile: isMobile(),
      listTitles: this.listData.listNames(),

      text: {
        imgAlt: TEXT.get("serps.imgAlt"),
        nout: TEXT.get("serps.nout"),
        intro: TEXT.get("serps.intro"),
        itemTitle: TEXT.get("serps.itemTitle"),
        listLink: TEXT.get("serps.listLink"),
        itemDTTitle: TEXT.get("serps.itemDTTitle"),
        itemMBTitle: TEXT.get("serps.itemMBTitle"),
        saveLabel: TEXT.get("serps.saveLabel"),
        saveTitle: TEXT.get("serps.saveTitle"),
      },
    } satisfies SearchStaticData;
  },
  computed: {
    // here 'init' is a contraction of 'initialised'.  Maybe I should have written i10d
    initList(): Array<MatchedItems> {
      if ("list" in this && this.list instanceof SearchList) {
        let tmp = this.list.export<string>();
        for (let i in tmp) {
          let tmp2 = tmp[i].item;
          tmp2 = tmp2.replace(/[ \t\"\']/g, "_");
          tmp[i].key = `item_${tmp2}${tmp[i].list}`;
        }
        return tmp;
      }
      return [] as Array<MatchedItems>;
    },
    hasData(): boolean {
      if ("list" in this && this.list instanceof SearchList) {
        return this.list.énumérer > 0;
      }
      return false;
    },
    helpId(): string {
      return this.$props.currentStateKey + "view";
    },
  },
  mounted() {
    this.$props.shopStore.commit("setPath", this.route.path);
    this.initGeneratedMethods();
  },
  methods: {
    ...(() => ({}))(), // placeholder to keep TSC happy

    initGeneratedMethods() {
      Object.assign(this, this.extraMethods);
    },
  },
});
</script>
