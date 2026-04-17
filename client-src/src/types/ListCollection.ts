import { AList } from "../services/AList";

export interface ListCollection {
  create(nom: string): number;
  poll(): Promise<boolean>;
  count(): number;
  delete(id: number): boolean;
  list(): Array<ListStruct>;
  get(id: number): AList | undefined;
  put(id: number, ret: AList): boolean;
  merge(next: ListCollection): boolean;
  append(ret: AList): boolean;
  //  store(ret: AList, offset: number): boolean;
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

export interface Listable {
  éléments: Array<string>;

  add(nouveau: string): boolean;
  edit(offset: number, nouveau: string): boolean;
  remove(offset: number): boolean;
  import(relevé: Array<string>): boolean;
  export(): Array<string>;
  editName(nouveau: string): boolean;
  unique(): boolean;
  view(): ListStruct;
}

export interface TestDataSchema {
  name: string;
  created: Date;
  edited: Date;
  count: number;
  id: number;
  list: Array<string>;
}
