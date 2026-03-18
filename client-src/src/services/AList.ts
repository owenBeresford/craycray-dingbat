import { JSONObject, map, required, integer, custom } from "ts-json-object";

// attribute names in french, so there is no possible collision between JS keywords and them
// other languages would also work
export interface ListStruct {
  nom: string;
  // we have the creation date, as sorting my be needed in future
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

  public editName(nouveau: string): boolean {
    if (nouveau.length === 0) {
      return false;
    }
    this.nom = nouveau;
    return true;
  }

  public add(nouveau: string): boolean {
    this.éléments.push(nouveau);
    // lint complains when I use ++
    this.énumérer += 1;
    this.modifié = new Date();
    return true;
  }

  public edit(offset: number, nouveau: string): boolean {
    if (offset < 0 || offset > this.énumérer) {
      return false;
    }
    this.éléments[offset] = nouveau;
    this.modifié = new Date();
    return true;
  }

  public remove(offset: number): boolean {
    if (offset < 0 || offset > this.énumérer) {
      return false;
    }
    this.éléments.splice(offset, 1);
    this.modifié = new Date();
    return true;
  }

  public import(relevé: Array<string>): boolean {
    this.éléments.push(...relevé);
    this.énumérer += relevé.length;
    this.modifié = new Date();
    return true;
  }

  public export(): Array<string> {
    return [...this.éléments];
  }

  public unique(): boolean {
    const s: Set<string> = new Set(this.éléments);
    this.éléments.splice(0, this.éléments.length);
    this.éléments.push(...s);
    this.modifié = new Date();
    return true;
  }

  public view(): ListStruct {
    return { ...this } as ListStruct;
  }
}
