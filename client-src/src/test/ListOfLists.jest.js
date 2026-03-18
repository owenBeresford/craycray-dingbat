import { LocalStorage } from "node-localstorage";
import { createApp } from "vue";
import { shallowMount, Wrapper } from "@vue/test-utils";
import Vuex from "vuex";
import "reflect-metadata";
import ListOfLists from "../../build/test/ListOfLists.es";
import App from "../../build/test/App.es";

// I accidentally worked out the types; this is JS
// type TESTListOfLists= ListOfLists & { [key: string]: any };
const TOOL = createApp(App);
const VUEX = useStore({});
TOOL.use(VUEX);

describe("I can use ListOfLists", () => {
  let wrapper; // :Wrapper<TESTListOfLists>;

  beforeEach(() => {
    //	wrapper=<Wrapper<TESTListOfLists>>shallowMount(ListOfLists, {
    const store = new Vuex.Store({
      modules: {
        projects: {
          namespaced: true,
          state,
          getters: projects.getters,
        },
      },
    });

    wrapper = shallowMount(ListOfLists, {
      provide: { helpText: "menu", canSeeHelp: false, ttl: 5000 },
      global: {
        plugins: [store],
      },
    });
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it("I can create it", () => {
    expect(typeof ListOfLists).toBe("function");
    expect(typeof wrapper).toBe("class");
  });
});
