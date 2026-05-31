import { JsonSerializer, throwError, JsonProperty, JsonObject } from "typescript-json-serializer";

import { EMPTY_LIST_NAME } from "../Constants";
import type {
  InstanceListable,
  ModuleListable,
  ListStruct,
  MatchedItems,
  ExtendedListable,
} from "../types/ListCollection";
import type { TestDataSchema } from "../../../common/types/TestDataSchema";

/**
 * convertEpoch2Date
 * Just type conversion function
 
 * @param {number} i
 * @public
 * @returns {Date}
 */
function convertEpoch2Date(i: number): Date {
  return new Date(i);
}

/**
 * BaseList<T> 
 * A common ancestor for more valuable implementations.
 * Never instantiated by itelf
 
 * @public
 * @returns {BaseList<T>}
 */
export class BaseList<T> implements InstanceListable<T>, ListStruct {
  @JsonProperty({ name: "name", required: true })
  public nom: string;

  @JsonProperty({ name: "created", required: true, type: Number, beforeDeserialize: convertEpoch2Date })
  public créé: Date;

  @JsonProperty({ name: "edited", required: true, type: Number, beforeDeserialize: convertEpoch2Date })
  public modifié: Date;

  @JsonProperty({ name: "count", required: true, type: Number })
  public énumérer: number;

  @JsonProperty({ name: "id", required: true, type: Number })
  public id: number;

  @JsonProperty({ name: "list", required: true, type: Array })
  public éléments: Array<T>;

  /**
   * manual
   * like a con'tor, named as the super class needs the con'tor slot.

   * @param { "new (): V" } this - TS magic to have correct type at runtime for any child class
   * @param {string} nouveau
   * @public
   * @returns {StdList}
   */
  public static manual<V1, V extends BaseList<V1>>(this: { new (): V }, nom: string, id: number): V {
    let liste = new this();
    liste.nom = nom;
    liste.créé = new Date();
    liste.modifié = new Date();
    liste.énumérer = 0;
    liste.id = id;
    liste.éléments = [] as Array<V1>;
    return liste;
  }

  /**
   * importTest
   * a util func to get Fixtures into the local StdList[]
   * Hope the type magic holds in tests etc.  This *should* genericly choose the correct type.
   * THIS IS STATIC, and makes a new object.   There is also StdList->importTest which mutates that object.
 
   * @param { "new (): V" } this - TS magic to have correct type at runtime for any child class
   * @param {TestDataSchema} origine
   * @public
   * @returns {U} - probably U=Stdlist, but this is reusable
   */
  public static importTest<T, U extends BaseList<T>>(this: { new (): U }, origine: TestDataSchema): U {
    const liste = new this();
    liste.nom = origine.name;
    liste.créé = origine.created;
    liste.modifié = origine.edited;
    liste.énumérer = origine.count;
    liste.id = origine.id;
    liste.éléments = [...(origine.list as Array<T>)];
    return liste;
  }

  /**
   * editName
   * Alter the lists name
 
   * @param {string} nouveau
   * @public
   * @returns {boolean}
   */
  public editName(nouveau: string): boolean {
    if (nouveau.length === 0) {
      return false;
    }
    this.nom = nouveau;
    return true;
  }

  /**
   * add
   * It only makes sense for building lists with.
   * Add another item to the current list
 
   * @param  {T} nouveau - often T=string
   * @public
   * @returns {boolean}
   */
  public add(nouveau: T): boolean {
    this.éléments.push(nouveau);
    // lint complains when I use ++
    this.énumérer += 1;
    this.modifié = new Date();
    return true;
  }

  /**
   * edit
   * Change an entry in the list
   * It only makes sense for building lists with.
   * Maybe should rename to editItem() ?
 
   * @param {number} indice
   * @param {T} nouveau
   * @public
   * @returns {boolean}
   */
  public edit(indice: number, nouveau: T): boolean {
    if (indice < 0 || indice > this.énumérer) {
      return false;
    }
    this.éléments[indice] = nouveau;
    this.modifié = new Date();
    return true;
  }

  /**
   * remove
   * Remove an element ...
 
   * @param {number} indice
   * @public
   * @returns {boolean}
   */
  public remove(indice: number): boolean {
    if (indice < 0 || indice > this.énumérer) {
      return false;
    }
    this.éléments.splice(indice, 1);
    this.modifié = new Date();
    return true;
  }

  /**
   * import
   * Append a list of items to this list (as one call)
 
   * @param {Array<T>} relevé - probably T=string 
   * @param {boolean} strict 
   * @public
   * @returns {boolean}
   */
  public import(relevé: Array<T>, strict: boolean): boolean {
    if (strict) {
      this.éléments.splice(0, this.éléments.length);
      this.énumérer = 0;
    }
    this.éléments.push(...relevé);
    this.énumérer += relevé.length;
    this.modifié = new Date();
    return true;
  }

  /**
   * export
   * Return a dupe of this list's items, as Array, not a class
 
   * @public
   * @returns {Array<T>} - often T=string
   */
  public export(): Array<T> {
    return [...this.éléments];
  }

  /**
   * unique
   * Mutate current list to remove dupes
 
   * @public
   * @returns {boolean}
   */
  public unique(): boolean {
    let s1: Set<T> = new Set<T>(this.éléments);
    this.éléments.splice(0, this.éléments.length);
    this.éléments.push(...s1);
    this.modifié = new Date();
    return true;
  }

  /**
   * view
   * Return a copy of the list as a ListStruct
 
   * @public
   * @returns {ListStruct}
   */
  public view(): ListStruct {
    return { ...this } as ListStruct;
  }
}

/**
 * StdList 
 * An Entity to manage validation and serialisation for Shopping lists
 * Currently uses JSONObject^H^H^H^H^H^Htypescript-json-serializer for meta-data management.
 
 * @public
 */
JsonObject();
export class StdList extends BaseList<string> implements ExtendedListable<string>, ListStruct {
  /**
   * filter
   * A util to supply matching items from the list
   * According to current business logic, this MUST BE called on a StdList, as there is no case for searching on a Search result.
   * 
   * At runtime, it was shown that the data validation class had supplied an Object with number fields names, rather thana an Array.
   * Hence I use Array.from()
 
   * @param {string|RegExp} égaler
   * @public
   * @returns {Array<string>} 
   */
  public filter(égaler: string | RegExp): Array<string> {
    let term: RegExp;
    if (typeof égaler === "string") {
      term = new RegExp(égaler, "i");
    } else {
      term = égaler;
    }

    let ret: Array<string> = [];
    const FIX_TYPE: Array<string> = Array.from(this.éléments);
    for (let i = 0; i < FIX_TYPE.length; i++) {
      if (FIX_TYPE[i].match(term)) {
        ret.push(FIX_TYPE[i]);
      }
    }
    return ret;
  }

  /**
   * importTest
   * a util func to get Fixtures into the local StdList[]

   * @param {StdList} origine
   * @public
   * @returns {StdList}
   */
  public importTest(origine: StdList): StdList {
    this.nom = origine.nom;
    this.créé = origine.créé;
    this.modifié = origine.modifié;
    this.énumérer = origine.énumérer;
    this.id = origine.id;
    this.éléments = [...origine.éléments];
    return this;
  }
}

/**
 * SearchList 
 * An Entity to manage validation and serialisation for Shopping lists
 * Currently uses JSONObject^H^H^H^H^H^Htypescript-json-serializer for meta-data management.
 
 * I hope the other public bits get inherited, as it SHOULD DO. it would in Golang.
 * @public
 */
JsonObject();
export class SearchList extends BaseList<MatchedItems> implements InstanceListable<MatchedItems>, ListStruct {
  /**
 * serps
 * A method to convert a search result into an list object to be-able-to render it
  // each item also has an id,
  // need to add type, when add component
 
 * @param {Array<MatchedItems>} dat
 * @public
 * @return {SearchList }
 */
  public static serps(dat: Array<MatchedItems>): SearchList {
    let liste = new SearchList();
    liste.nom = "Search results";
    liste.créé = new Date();
    liste.modifié = new Date();
    liste.énumérer = dat.length;
    liste.id = -1; // not valid to save as is
    liste.éléments = [...dat];
    return liste;
  }
}

/**
 A handy list so there are no null-pointers 
 */
export const EMPTY_LIST: StdList = StdList.manual<string, StdList>(EMPTY_LIST_NAME, 1) as StdList;
