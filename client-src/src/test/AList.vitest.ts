// import 'reflect-metadata';
// chatbot wanted this, its not actually needed, so I commented it :-)
import { Directive, defineComponent, ref } from "vue";
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";
import { mount, RouterLinkStub, config } from "@vue/test-utils";
import Vue3TouchEvents from "vue3-touch-events";
import { JSONObject, map, required, optional, array, integer, custom } from "ts-json-object";

import { AList, ListStruct, Listable } from "../services/AList";
import { SaveStruct } from "../types/Saveable";

// This is just a test object.
// some TS tools strip meta data, and that invaldates my use of "ts-json-object"
// So I fail here, early, with a less confusing error message,
class Book extends JSONObject {
  @required
  @map("name")
  name: string;

  @required
  @integer
  @map("publishYear")
  publishYear: number;
}

describe("test on json object (to see if tech works)", () => {
  it("Can load service", () => {
    const book: Book = new Book({ name: "Moby Dick", publishYear: 1892 });
    expect(typeof book).toBe("object");
    console.log("working book (check values):", book);
    assertType<Book>(book);

    let book2: Book;
    try {
      book2 = new Book({ name: "FAIL" });
      expect(typeof book2).toBe("object");
    } catch (e: unknown) {
      console.warn("Partial data object is expected to fail, and...BOOM!", (e as Error).message);
    }
  });
});

// the real unit-test
describe("test on AList", () => {
  it("Can load service", () => {
    // https://copyprogramming.com/howto/typescript-check-if-object-is-of-interface
    // https://github.com/vitest-dev/vitest/issues/8387
    assertType<ListStruct>(AList.manual("test0", 1));
    expect(AList.manual("test1", 1)).toBeTruthy();
    expect(
      new AList(
        { name: "fgdf", created: new Date(), edited: new Date(), count: 2, id: 1, list: [] as Array<string> } // as SaveStruct
      )
    ).toBeTruthy();
  });
});
