import { directive, defineComponent, ref } from "vue";
import { assert, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Vue3TouchEvents from "vue3-touch-events";
 
import EnterInput from "../components/EnterInput.vue";
import { isMobile,  nextId } from "../services/util";
import { UI_EN_GB, useUIText } from "../services/Localisation";

// IOIO docs say need to swap find() -> findComponent()
// https://v1.test-utils.vuejs.org/api/wrapper/getComponent.html
// OR const button = findByText(wrapper, 'button', /foo/).at(0);
// https://stackoverflow.com/questions/48310927/how-to-get-button-text-in-vue-test-utils

describe("Simple component test 1", () => {
  it("Can load EnterInput", () => {
    const str = "";
    let canSeeInput = false;
    const cb = (d1) => {
      if (d1 === null) {
        canSeeInput = false;
        return;
      }
      console.log("ENTERINPUT: Imma doin' a fing!!!");
      canSeeInput = false;
    };

    const BLOB = mount(EnterInput, {
      props: {
        val: str,
        visible: canSeeInput,
        cb: cb,
        currentStateKey: "test1",
      },
      sync: true,
      global: {
        stubs: ["vue3-touch-events"],
        UI_EN_GB,
        useUIText,
      },
    });
    //  screen.debug() says this isn't mounted to a DOM, but this is Node so that doesnt mean much..

    expect(BLOB.find("dialog[data-testid=obj1]").exists()).toBe(true);
    expect(BLOB.find("span.cancel").exists()).toBe(true);
    expect(BLOB.find('input[type="button"]').exists()).toBe(true);
    expect(BLOB.vm.oVal).toEqual("");

    // "cancel button that Vue sometimes mangles"
    expect(BLOB.find("span.cancel").text()).toBe("❌");
    expect(BLOB.find("#txt").attributes("placeholder")).toBe("Enter value");
  });

  it("test ids work", () => {
    const str = "";
    let canSeeInput = false;
    const cb = (d1) => {
      if (d1 === null) {
        canSeeInput = false;
        return;
      }
      console.log("ENTERINPUT: Imma doin' a fing!!!");
      canSeeInput = false;
    };

    const BLOB = mount(EnterInput, {
      props: {
        val: str,
        visible: canSeeInput,
        cb: cb,
        currentStateKey: "test1",
      },
      global: {
        stubs: ["vue3-touch-events"],
        UI_EN_GB,
        useUIText,
      },
    });

    expect(BLOB.find("dialog[data-testid=obj2]").exists()).toBe(true);
  });

/*
  it("test content feedback works", async (done) => {
    const cb = (d1) => {
      if (d1 === null) {
        canSeeInput = false;
        return;
      }
      console.log("ENTERINPUT: Imma doin' a fing!!!");
      canSeeInput = false;
    };
    const SEARCH="dialog[data-testid=obj3]";
    const FakeProps = {
      val: "",
      visible: false,
      cb: cb,
      currentStateKey: "test1",
    };
 
    const BLOB = mount(EnterInput, {
      props: FakeProps,
      global: {
        stubs: ["vue3-touch-events"],
        UI_EN_GB,
        useUIText,
      },
    });
    expect(BLOB.find(SEARCH).exists()).toBe(true);

    const FakeProps2 = {
      val: "hello world",
      visible: true,
      cb: cb,
      currentStateKey: "test1helloworld",
    };
    console.log(" real before", BLOB.html());

    await BLOB.setProps(FakeProps2);

    console.log("before", BLOB.html()  );
    await BLOB.vm.$forceUpdate();
    await BLOB.vm.$nextTick();
    BLOB.find(SEARCH+" #txt").trigger('input');

    await delay(1000);
    expect(BLOB.find(SEARCH).exists()).toBe(true);
    console.log("after", BLOB.html() );
  
    expect(BLOB.find(SEARCH).exists()).toBe(true); 
    expect(BLOB.find("#txt").text()).toBe("hello world"); 
  });

  it("test visibility works", async (done) => {
    let canSeeInput = false;
    const cb = (d1) => {
      if (d1 === null) {
        canSeeInput = false;
        return;
      }
      console.log("ENTERINPUT: Imma doin' a fing!!!");
      canSeeInput = false;
    };
    const FakeProps = {
      val: "",
      visible: canSeeInput,
      cb: cb,
      currentStateKey: "test1",
    };
    const SEARCH="dialog[data-testid=obj4]";
    const BLOB = mount(EnterInput, {
      props: FakeProps,
      global: {
        stubs: ["vue3-touch-events"],
        UI_EN_GB,
        useUIText,
      },
    });

    expect( Boolean( BLOB.vm) ).toBe(true);
    expect(BLOB.find(SEARCH).exists()).toBe(true);
    expect(getComputedStyle(BLOB.find(SEARCH).element).getPropertyValue('display')).toBe('none');

    canSeeInput=true;
    FakeProps.visible = true;
    FakeProps.currentStateKey = "test2" + FakeProps.val;
    console.log("before", (new Date()).getTime(), BLOB.html());
    await BLOB.setProps(FakeProps);
    BLOB.find("#txt").trigger('input');
    expect(BLOB.props() ).toBe(true);
    console.log("middle", (new Date()).getTime(), BLOB.html());

 //    await BLOB.vm.$forceUpdate();
    BLOB.vm.$nextTick((done2) => {
        expect(BLOB.find(SEARCH).exists()).toBe(true);
        console.log("after", (new Date()).getTime(), BLOB.html());

        expect(BLOB.find(SEARCH).exists()).toBe(true);  
        expect(getComputedStyle(BLOB.find(SEARCH).element).getPropertyValue("display")).toBe("block");
        done2();
    });
  });
*/

 });
