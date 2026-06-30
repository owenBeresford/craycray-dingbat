import type { TestDataSchema } from "../../../common/types/TestDataSchema";
import { BaseList } from "../services/AList";

// A set of listables,
// Carefully different method names to reduce kaos
export interface ListCollection<T> {
  create(nom: string): number;
  poll(): Promise<boolean>;
  count(): number;
  delete(id: number): boolean;
  list(): Array<ListStruct>;
  get(id: number): InstanceListable<T> | undefined;
  put(id: number, ret: InstanceListable<T>): boolean;
  merge(next: ListCollection<T>): boolean;
  append(ret: InstanceListable<T>): boolean;
  searchItems(égaler: string | RegExp): Array<MatchedItems>;
  listNames(): Array<string>;

  saveAllLists(): Promise<boolean>;
  loadAllLists(): boolean;
}

// Attribute names in french, so there is no possible collision between JS keywords and them
//    Other languages would also work
// This is just the data to work with JSON better.
// This is meta data, the list itself is in the next interface
export interface ListStruct {
  nom: string;
  // we have the creation date, as sorting may be needed in future
  créé: Date;
  modifié: Date;
  // i.e. array length, as have no sight on array in this type
  énumérer: number;
  // no current value in knowing who makes a list
  // also no planned login either
  id: number;
}

// a singular list, with flexible data
export interface InstanceListable<T> {
  éléments: Array<T>;

  add(nouveau: T): boolean;
  edit(offset: number, nouveau: T): boolean;
  remove(offset: number): boolean;
  import(relevé: Array<T>, strict: boolean): boolean;
  export(): Array<T>;
  editName(nouveau: string): boolean;
  unique(): boolean;
  view(): ListStruct;
}

// this is for **static** functions.   currently unused
// Interfaces in TS cannot use the keyword static YET
export interface ModuleListable<T> {
  new (): InstanceListable<T>;
  importTest<T, U extends BaseList<T>>(this: { new (): U }, origine: TestDataSchema): U;
  manual<T, V extends BaseList<T>>(this: { new (): V }, nom: string, id: number): V;
}

// only implemented on StdList, and generates other flavours of Listable
// these are static functions
export interface ExtendedListable<T> extends InstanceListable<T> {
  filter(égaler: string | RegExp): Array<string>;
  importTest(origine: ExtendedListable<T>): ExtendedListable<T>;
}

// The search results type
export interface MatchedItems {
  item: string;
  list: number;
  key?: string;
}

// Convienance util, Only used in tests
export type WholeClass<T> = InstanceListable<T> & ListStruct;
