import type { Store } from "vuex";
import type { ShopState } from "../types/ShopState";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    store: Store<ShopState>;
  }
}
