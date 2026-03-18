// https://github.com/robinrodricks/vue3-touch-events/issues/2

//import Vue from "vue";
//declare module "vue" {
//  export type PluginObject<T> = (app: Vue.App, ...options: any[]) => any;
//}

declare module "vue3-touch-events" {
  import { Plugin as VuePlugin } from "vue";
  const plugin: VuePlugin;
  export default plugin;
}

