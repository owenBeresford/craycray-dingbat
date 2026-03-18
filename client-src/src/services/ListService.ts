import { AList, ListStruct } from "./AList";
import { SaveStruct } from "../types/Saveable";
import { LocalCopy } from "./LocalCopy";
import { MessageDistribution } from "./MessageDistribution";
// import { RemoteStorage } from './RemoteStorage';
import { DistantStorable } from "../types/RemoteTypes";
import type { PromiseSucceed, PromiseReject } from '../types/promises'; 

export interface ListCollection {
  catalog: Array<AList>;
  remote: DistantStorable;
  local: LocalCopy;

  create(nom: string): number ;
  poll(): Promise<boolean> ;
  count(): number;
  delete(id: number): boolean; 
  list(): Array<ListStruct>;
  get(id: number): AList | undefined; 
  put(id: number, ret: AList): boolean; 
  store(ret: AList, offset: number): boolean; 
  saveAllLists(): boolean ;
  loadAllLists(): boolean ;
}
 
export class ListService implements ListCollection {
  catalog: Array<AList>;
  remote: DistantStorable;
  local: LocalCopy;

  constructor(rr: DistantStorable, ll: LocalCopy) {
    this.catalog = [];
    this.remote = rr;
    this.local = ll;
    console.log(
      "ListService created & injected with: (remote) " + rr.constructor.name + " (local) " + ll.constructor.name
    );
    this.loadAllLists();
  }

  // ID=0 isn't valid, so +1
  // IOIOI XXX check this 
  create(nom: string): number {
    const LEN = this.catalog.length;
    this.catalog.push(AList.manual(nom, LEN));
    return LEN + 1;
  }

  poll(): Promise<boolean> {
    if (!( this.remote && typeof this.remote === "object" )) {
      return new Promise((good:PromiseSucceed<boolean>, bad:PromiseReject) => {
        good(false);
      });
    }
    return this.remote.poll();
  }

  isNotValidId(id: number): boolean {
    return !(Number.isInteger(id) && id >= 0 && id <= this.catalog.length);
  }

  count(): number {
    return this.catalog.length;
  }

  delete(id: number): boolean {
    if (this.isNotValidId(id)) {
      return false;
    }
    id--;
    this.catalog.splice(id, 1);
    return true;
  }

  list(): Array<ListStruct> {
    const tmp: Array<ListStruct> = [];
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in this.catalog) {
      tmp.push(this.catalog[i].view());
    }
    return tmp;
  }

  get(id: number): AList | undefined {
    if (this.isNotValidId(id) || !(id in this.catalog) ) {
      console.warn("ERROR: Cannot load list with id=" + id + " " + JSON.stringify(this.catalog));
      return undefined;
    }
    let tmp= this.catalog[id ];
    if(tmp===null) { return undefined; }
    return tmp;
  }

  put(id: number, ret: AList): boolean {
    if (this.isNotValidId(id)) {
      console.warn("ERROR: Cannot put list with id=" + id);
      return false;
    }
    this.catalog[id ] = ret;
    return true;
  }

  append(ret: AList): boolean {
    this.catalog.push(ret);
    return true;
  }

// dupe function
  store(ret: AList, offset: number): boolean {
    if (this.isNotValidId(offset)) {
      console.warn("ERROR: Cannot store list with id=" + offset);
      return false;
    }
    this.catalog[offset ] = ret;
    return true;
  }

  saveAllLists(): boolean {
    const tmp: Array<SaveStruct> = [];

    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in this.catalog) {
      tmp.push({
        name: this.catalog[i].nom,
        created: this.catalog[i].créé.getTime(),
        edited: this.catalog[i].modifié.getTime(),
        count: this.catalog[i].énumérer,
        id: this.catalog[i].id,
        list: [...this.catalog[i].éléments],
      } as SaveStruct);
    }
    Promise.resolve(this.local.saveState(tmp));
    return true;
  }

  private mapper(dat: Array<SaveStruct>) {
    //  eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const i in dat) {
      if (dat[i].name) {
        const tt = AList.manual(dat[i].name, dat[i].id);
        tt.créé = new Date(dat[i].created);
        tt.modifié = new Date(dat[i].edited);
        tt.énumérer = dat[i].count;
        tt.éléments = [...dat[i].list];
        this.catalog.push(<AList>tt);
      } else {
        console.warn("Unpacked list [" + i + "] has no name; Que?");
      }
    }
  }

  loadAllLists(): boolean {
    let out = true;
    this.local.loadState().then((dat) => {
      if (!dat) {
        out = false;
        return;
      }

      this.catalog = this.catalog.splice(0, this.catalog.length);
      console.log("From local state, pulled " + dat.length + " items.");
      this.mapper(dat);
    });

    this.remote.loadState().then((dat) => {
      if (!dat) {
        out = false;
        return;
      }

      this.catalog = this.catalog.splice(0, this.catalog.length);
      console.log("From remote state, replacing " + dat.length + " items.");
      this.mapper(dat);
    });

    // i hope this works
    return out;
  }
}
