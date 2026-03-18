import { Store } from "vuex";
import { ShopState } from "../services/Store";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: Store<ShopState>;
  }
}
