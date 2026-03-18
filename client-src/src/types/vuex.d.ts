import type { Store } from "vuex";
import type { ShopState } from "../services/Store";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<ShopState>;
  }
}
