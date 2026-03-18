import { Storable, transform2text, transform2list } from "./Storable";
import { SaveStruct } from "../types/Saveable";
import { APP_NAME } from "../Constants";
import type { PromiseSucceed, PromiseReject } from '../types/promises'; 

// this class is stateless, but I wanted a shared interface/ contract
// I could rewrite as a function returning a Closure to inject the localStorage object
export class LocalCopy implements Storable {
  constructor() {
    // noop
  }

  // wrapped in order to trap the errors
  saveProperty(nom: string, dat: string): boolean {
    try {
      localStorage.setItem(nom, dat);
    } catch (e) {
      console.warn("Error on local storage", e);
      return false;
    }
    return true;
  }

  loadProperty(nom: string): string {
    let str: string;
    try {
      str = localStorage.getItem(nom) ?? "";
    } catch (e) {
      console.warn("Error on local storage", e);
      return "";
    }
    return str;
  }

  saveState(dat: Array<SaveStruct>): Promise<boolean> {
    return new Promise((good:PromiseSucceed<boolean>, bad:PromiseReject) => { 
      const tt = this.saveProperty(APP_NAME, transform2text(dat));
      if (tt) {
        good(true);
      } else {
        bad(new Error("Cache is empty"));
      }
    });
  }

  // I don't have a handy filter primitive to make this better functional, and drop the branch
  loadState(): Promise<Array<SaveStruct>> {
    return new Promise((good:PromiseSucceed<Array<SaveStruct>>, bad:PromiseReject) => { 
      const dat2 = this.loadProperty(APP_NAME);
      if (dat2) {
        good(transform2list(dat2));
      } else {
        console.warn("WARNING: cache is empty; adding placeholder");
        this.saveProperty(APP_NAME, "[]");
        good([] as Array<SaveStruct>);
      }
    });
  }
}

export const KNOWN_PHONE = "shopping-known";

let LOCAL: LocalCopy;
export function useLocal() {
  if (!LOCAL) {
    LOCAL = new LocalCopy();
  }
  return LOCAL;
}
