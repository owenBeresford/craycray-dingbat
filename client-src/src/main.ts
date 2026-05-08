// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin } from "vue";
import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE } from "./Constants";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";
import { createDataFactory, ListData, setupCurrentList } from './services/DataFactory';
import {fixture1 } from '../../common/fixture-lists';  // IOIO
import type { FactoryArtefact } from "./services/DataFactory";
import type { ListCollection } from "./types/ListCollection";

const TOOL = createApp(ShoppingApp, { currentStateKey:"scr1", instanceId:"v1.1" });
TOOL.use(StaticRoutes);
TOOL.use(Vue3TouchEvents as Plugin);
TOOL.use(STORE);

//IOIO  
// const ListData2=setupCurrentList();
const tmp= createDataFactory(fixture1())

// the fixture is alway present, no race condition possible
ListData.updateData( tmp.currentData ?? {} as ListCollection );
console.log("In initial ShoppingApp main", ListData);

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
