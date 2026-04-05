 import { JsonSerializer, throwError, JsonProperty, JsonObject } from 'typescript-json-serializer';
 import type { Listable, ListStruct, TestDataSchema } from "../types/ListCollection";

function convertEpoch2Date(i:number):Date {
  return new Date(i);
}
 
/**
 * AList 
 * An Entity to manage validation and serialisation for Shopping lists
 * Currently uses JSONObject for meta-data management.
 
 * @public
 */
JsonObject()
export class AList  implements Listable, ListStruct {
  /*
  protected nom:string;
  protected créé:Date;
  protected modifié:Date;
  protected énumérer:number;
  protected id:number;
  protected éléments: Array<string>;
*/
  @JsonProperty({name: 'name', required: true})
  public nom: string;

  @JsonProperty({name: 'created', required: true, type: Number, beforeDeserialize:convertEpoch2Date })
  public créé: Date;

  @JsonProperty({name: 'edited', required: true, type: Number, beforeDeserialize:convertEpoch2Date })
  public modifié: Date;

  @JsonProperty({name: 'count', required: true, type: Number})
  public énumérer: number;

  @JsonProperty({name: 'id', required: true, type: Number})
  public id: number;

  @JsonProperty({name: 'list', required: true, type: Array})
  public éléments: Array<string>;

  /**
   * manual
   * like a con'tor, named as the super class needs the con'tor slot.
 
   * @param {string} nouveau
   * @public
   * @returns {AList}
   */
  public static manual(nom: string, id: number): AList {
    let tmp=new AList();
      tmp.nom=nom;
      tmp.créé = new Date();
      tmp.modifié = new Date();
      tmp.énumérer= 0;
      tmp.id=id;
      tmp.éléments= [] as Array<string>;
    return tmp;
  }

  /**
   * importTest
   * a util func to get Fixtures into the local AList[]
 
   * @param {TestDataSchema} src
   * @public
   * @returns {AList}
   */
  public static importTest(src: TestDataSchema): AList {
    const tmp = new AList();
      tmp.nom=src.name;
      tmp.créé = src.created;
      tmp.modifié = src.edited;
      tmp.énumérer= src.count;
      tmp.id=src.id;
      tmp.éléments= [...src.list];
    console.log("ERWERWRWER ", JSON.stringify(tmp));
    return tmp;
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
 
   * @param {number} offset
   * @param {string} nouveau
   * @public
   * @returns {boolean}
   */
  public edit(offset: number, nouveau: string): boolean {
    if (offset < 0 || offset > this.énumérer) {
      return false;
    }
    this.éléments[offset] = nouveau;
    this.modifié = new Date();
    return true;
  }

  /**
   * remove
   * Remove an element ...
 
   * @param {number} offset
   * @public
   * @returns {boolean}
   */
  public remove(offset: number): boolean {
    if (offset < 0 || offset > this.énumérer) {
      return false;
    }
    this.éléments.splice(offset, 1);
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
    const s: Set<string> = new Set(this.éléments);
    this.éléments.splice(0, this.éléments.length);
    this.éléments.push(...s);
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
