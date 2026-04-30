// import "reflect-metadata";
import { createApp } from "vue";
import type { Plugin } from "vue";
import Vue3TouchEvents from "vue3-touch-events";
import { STORE } from "./services/Store";
import { APP_NAME, ROOT_NODE } from "./Constants";
import { StaticRoutes } from "./components/Routing";
import ShoppingApp from "./App.vue";
import type { FactoryArtefact } from "./services/DataFactory";
import { createDataFactory, ListData } from './services/DataFactory';
import {fixture1 } from '../../common/fixture-lists';

const TOOL = createApp(ShoppingApp, { currentStateKey:"scr1", instanceId:"v1.1" });
TOOL.use(StaticRoutes);
TOOL.use(Vue3TouchEvents as Plugin);
TOOL.use(STORE);

const tmp= createDataFactory(fixture1())
ListData.updateData( tmp.currentData );
console.log("In initial ShoppingApp main", ListData);

STORE.install(TOOL, APP_NAME);
TOOL.mount(ROOT_NODE);
