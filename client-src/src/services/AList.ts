import { JSONObject, map, required, integer, custom } from "ts-json-object";
import type { Listable, ListStruct } from "../types/ListCollection";

/**
 * AList 
 * An Entity to manage validation and serialisation for Shopping lists
 * Currently uses JSONObject for meta-data management.
 
 * @public
 */
export class AList extends JSONObject implements Listable, ListStruct {
  /*
  protected nom:string;
  protected créé:Date;
  protected modifié:Date;
  protected énumérer:number;
  protected id:number;
  protected éléments: Array<string>;
*/
  @required
  @map("name")
  public nom: string;

  @required
  @integer
  @map("created")
  @custom((nouveau: AList, name: string, value: string | Date) => {
    if (name === "created") {
      if (value instanceof Date) {
        return value;
      } else {
        return new Date(parseInt(value, 10));
      }
    }
    return value;
  })
  public créé: Date;

  @required
  @integer
  @map("edited")
  @custom((nouveau: AList, name: string, value: string | Date) => {
    if (name === "edited") {
      if (value instanceof Date) {
        return value;
      } else {
        return new Date(parseInt(value, 10));
      }
    }
    return value;
  })
  public modifié: Date;

  @required
  @integer
  @map("count")
  public énumérer: number;

  @required
  @integer
  public id: number;

  @required
  @map("list")
  public éléments: Array<string>;

  /**
   * manual
   * like a con'tor, named as the super class needs the con'tor slot.
 
   * @param {string} nouveau
   * @public
   * @returns {AList}
   */
  public static manual(nom: string, id: number): AList {
    return new AList({
      name: nom,
      created: new Date(),
      edited: new Date(),
      count: 0,
      id: id,
      list: [],
    });
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
 
   * @param offset: number
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
