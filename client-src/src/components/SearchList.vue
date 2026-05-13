<template>
  <div id="serpsContainer" class="serps" :key="currentStateKey" :data-testId="testId">
    <p >{{ text.intro }}</p>
    <ul class="buttonRow">
      <li ><h3>{{ list.nom }}</h3></li>
      <li > <img width="40" height="40" :src="logoPath" aria-hidden="true" role="presentation" :alt="text.imgAlt"  /> </li>  
    </ul>

    <ul class="aList" :data-testId="aListId">
      <li v-html="text.nout" v-show="!hasData"></li>
      <li v-for="(i, j) in initList" :key="j" :title="text.itemTitle">
        <span role="button" :title="text.listLink">
          From <router-link :to="`${mapURL('aList', i.list)}`" class="button">{{ listTitles[i.list] }} (List#{{ i.list }}) </router-link>
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
import { defineComponent } from "vue";
import type { MethodOptions } from 'vue';
import { useRoute } from 'vue-router';

import {  LOGO_PATH } from "../Constants";
import { isMobile } from "../../../common/util";
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
export default defineComponent({
  name: "SearchList",
  props: {
    currentStateKey: { type: String, required: true },
    testId: {type:String, default:"test0"},
    shopStore: {
      type: Object,
      default: () => {
        return useStore();
      },
    }, 
    route:{
      type: Object,
      default: () => {
        return useRoute();
      },
    },  
  },
  inject: [  ],
  data() {
    let list:AList=this.$props.shopStore.state.serps;
    let hasData:boolean=list.énumérer >0;
    let nom:Array<string> =[];
    for (let i=0; i < ListData.currentData.count(); i++ ) {
      nom[i]=ListData.currentData.get(i).nom; 
    }
// console.log("This should be a list ", nom, list.éléments ); 

    return {
       aListId: this.$props.testId+"results1",
       logoPath: LOGO_PATH, 
       mapURL,
       list,
       hasData,
       bisMobile:isMobile(),
       listTitles: nom,

       text: {
        imgAlt: TEXT.get("serps.imgAlt"),
        nout: TEXT.get('serps.nout'),
        intro: TEXT.get('serps.intro'),
        itemTitle: TEXT.get('serps.itemTitle'),
        listLink: TEXT.get('serps.listLink'),
        itemDTTitle: TEXT.get('serps.itemDTTitle'),
        itemMBTitle: TEXT.get('serps.itemMBTitle'),

       }
      };
    },
  computed: {
    // here 'init' is a contraction of 'initialised'.  Maybe I should have written i10d
     initList(): Array<string> {
      if ('list' in this &&  this.list instanceof AList) {
        return this.list.export();
      }
      return [] as Array<string>;
    },
  },
  created() {
    // the state data in the link is populated in TabBar.onSearch
    // instant, as local to local
  },
  methods:{ 
    // ? see ThisList
  }
    
});
</script>
