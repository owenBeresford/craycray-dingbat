// import 'reflect-metadata';
// chatbot wanted this, its not actually needed, so I commented it :-)
import { Directive, defineComponent, ref } from "vue";
import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";
import { mount, RouterLinkStub, config } from "@vue/test-utils";
import Vue3TouchEvents from "vue3-touch-events";
import { JsonSerializer, throwError, JsonProperty, JsonObject } from 'typescript-json-serializer';
import type { ListStruct, Listable } from "../types/ListCollection";
import { AList } from "../services/AList";
import { SaveStruct } from "../types/Saveable";

// This is just a test object.
@JsonObject()
class Book {
  @JsonProperty({ name:'name', required: true, type: String})
  name: string;

  @JsonProperty({ name:'publishYear', required: true, type: Number}) 
  publishYear: number;
}

describe("test on json object (to see if tech works)", () => {
  it("Can load service", () => {
    const book: Book = new Book();
    book.name= "Moby Dick"; 
    book.publishYear= 1892;
    expect(typeof book).toBe("object");
    console.log("working book (check values):", book);
    assertType<Book>(book);

    let book2: Book;
    try {
      book2 = new Book();
      book2.name= "FAIL";
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

    let tt=new AList();
    tt.nom= "fgdf";
      tt.créé = new Date();
      tt.modifié = new Date();
     tt.énumérer= 2;
      tt.id=1;
      tt.éléments= [] as Array<string>;
    expect( tt ).toBeTruthy();
  });
});
