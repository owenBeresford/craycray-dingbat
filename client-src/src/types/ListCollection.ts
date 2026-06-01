import type { TestDataSchema } from "../../../common/types/TestDataSchema";
import { BaseList } from "../services/AList";

// a set of listables, carefuly different method names to reduce kaos
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

  //  store(ret: StdList, offset: number): boolean;
  saveAllLists(): Promise<boolean>;
  loadAllLists(): boolean;
}

// attribute names in french, so there is no possible collision between JS keywords and them
// other languages would also work
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

export interface InstanceListable<T> {
  éléments: Array<T>;

  // instance functions
  add(nouveau: T): boolean;
  edit(offset: number, nouveau: T): boolean;
  remove(offset: number): boolean;
  import(relevé: Array<T>, strict: boolean): boolean;
  export(): Array<T>;
  editName(nouveau: string): boolean;
  unique(): boolean;
  view(): ListStruct;
}

// this is for static functions.  Interfaces in TS cannot use the keyword static
export interface ModuleListable<T> {
  //  new(): InstanceListable<T>;
  importTest<T, U extends BaseList<T>>(this: { new (): U }, origine: TestDataSchema): U;
  manual<T, V extends BaseList<T>>(this: { new (): V }, nom: string, id: number): V;
}

// only implemented on StdList, and generates other flavours of Listable
export interface ExtendedListable<T> extends InstanceListable<T> {
  filter(égaler: string | RegExp): Array<string>;
  importTest(origine: ExtendedListable<T>): ExtendedListable<T>;
}

export interface MatchedItems {
  item: string;
  list: number;
  key?: string;
}

export type WholeClass<T> = InstanceListable<T> & ListStruct;
