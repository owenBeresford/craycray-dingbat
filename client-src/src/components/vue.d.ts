declare module "src/components/*" {
  import Vue = require("vue");
  const value: Vue.ComponentOptions<Vue.Vue>;

  export type PluginObject<T> = (app: Vue.App, ...options: any[]) => any;
  export default value;
}
