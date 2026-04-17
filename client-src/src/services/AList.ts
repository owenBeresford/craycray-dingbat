import { JsonSerializer, throwError, JsonProperty, JsonObject } from "typescript-json-serializer";
import type { Listable, ListStruct, TestDataSchema } from "../types/ListCollection";

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
 * AList 
 * An Entity to manage validation and serialisation for Shopping lists
 * Currently uses JSONObject for meta-data management.
 
 * @public
 */
JsonObject();
export class AList implements Listable, ListStruct {
  /*
  protected nom:string;
  protected créé:Date;
  protected modifié:Date;
  protected énumérer:number;
  protected id:number;
  protected éléments: Array<string>;
*/
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
  public éléments: Array<string>;

  /**
   * manual
   * like a con'tor, named as the super class needs the con'tor slot.
 
   * @param {string} nouveau
   * @public
   * @returns {AList}
   */
  public static manual(nom: string, id: number): AList {
    let liste = new AList();
    liste.nom = nom;
    liste.créé = new Date();
    liste.modifié = new Date();
    liste.énumérer = 0;
    liste.id = id;
    liste.éléments = [] as Array<string>;
    return liste;
  }

  /**
   * importTest
   * a util func to get Fixtures into the local AList[]
 
   * @param {TestDataSchema} origine
   * @public
   * @returns {AList}
   */
  public static importTest(origine: TestDataSchema): AList {
    const liste = new AList();
    liste.nom = origine.name;
    liste.créé = origine.created;
    liste.modifié = origine.edited;
    liste.énumérer = origine.count;
    liste.id = origine.id;
    liste.éléments = [...origine.list];
    return liste;
  }

  /**
   * importTest
   * a util func to get Fixtures into the local AList[]

   * @param {AList} origine
   * @public
   * @returns {AList}
   */
  public importTest(origine: AList): AList {
    this.nom = origine.nom;
    this.créé = origine.créé;
    this.modifié = origine.modifié;
    this.énumérer = origine.énumérer;
    this.id = origine.id;
    this.éléments = [...origine.éléments];
    return this;
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
   * Add another item to the current list
 
   * @param  {string} nouveau
   * @public
   * @returns {boolean}
   */
  public add(nouveau: string): boolean {
    this.éléments.push(nouveau);
    // lint complains when I use ++
    this.énumérer += 1;
    this.modifié = new Date();
    return true;
  }

  /**
   * edit
   * change an entry in the list
   * Maybe should rename to editItem() ?
 
   * @param {number} indice
   * @param {string} nouveau
   * @public
   * @returns {boolean}
   */
  public edit(indice: number, nouveau: string): boolean {
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
 
   * @param {Array<string>} relevé 
   * @public
   * @returns {boolean}
   */
  public import(relevé: Array<string>): boolean {
    this.éléments.push(...relevé);
    this.énumérer += relevé.length;
    this.modifié = new Date();
    return true;
  }

  /**
   * export
   * Return a dupe of this list's items
 
   * @public
   * @returns {Array<string>}
   */
  public export(): Array<string> {
    return [...this.éléments];
  }

  /**
   * unique
   * Edit current list to remove dupes
 
   * @public
   * @returns {boolean}
   */
  public unique(): boolean {
    const s1: Set<string> = new Set<string>(this.éléments);
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

export const EMPTY_LIST = AList.manual("New Empty list", 1);
