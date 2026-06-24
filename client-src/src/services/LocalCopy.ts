import { transform2text, transform2list } from "./Storable";
import type { Storable } from "../types/Saveable";
import type { SaveStruct } from "../../../common/types/SaveStruct";
import { APP_NAME } from "../Constants";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";

let LOCAL: LocalCopy;
/**
 * exportuseLocal
 * Util to generate the object
 
 * @public
 * @returns {LocalCopy} 
 */
export function useLocal(): LocalCopy {
  if (!LOCAL) {
    LOCAL = new LocalCopy();
  }
  return LOCAL;
}

/**
 * LocalCopy 
 * Mostly a util to force error handling on localStorage
// this class is stateless, but I wanted a shared interface/ contract
// I could rewrite as a function returning a Closure to inject the localStorage object
 
 * @public
 */
export class LocalCopy implements Storable {
  /**
   * constructor
   * a noop.
 
   * @public
   * @returns {LocalCopy}
   */
  public constructor() {
    // noop
  }

  public static debugSymbol = "LocalCopy";

  /**
   * saveProperty
  // wrapped in order to trap the errors
   * blah
 
   * @param {string} nom
   * @param {string} dat
   * @public
   * @returns {boolean}
   */
  public saveProperty(nom: string, dat: string): boolean {
    try {
      localStorage.setItem(nom, dat);
    } catch (e) {
      console.warn("783453623487 Error on local storage", e);
      return false;
    }
    return true;
  }

  /**
   * loadProperty
   * again blah
 
   * @param {string} nom
   * @public
   * @returns {string}
   */
  public loadProperty(nom: string): string {
    let str: string;
    try {
      str = localStorage.getItem(nom) ?? "";
    } catch (e) {
      console.warn("854213454142 Error on local storage", e);
      return "";
    }
    return str;
  }

  /**
   * saveState
   * Write a full Collection, rather than a single value
 
   * @param {Array<SaveStruct>} dat
   * @public
   * @returns {Promise<boolean>}
   */
  public saveState(dat: Array<SaveStruct>): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      const présent = this.saveProperty(APP_NAME, transform2text(dat));
      if (présent) {
        good(true);
      } else {
        bad(new Error("Cache is empty"));
      }
    });
  }

  /**
   * loadState
   * Pull entire collection from localstorage
  // I don't have a handy filter primitive to make this better functional, and drop the branch
 
   * @public
   * @returns {Promise<Array<SaveStruct>>}
   */
  public loadState(): Promise<Array<SaveStruct>> {
    return new Promise((good: PromiseSucceed<Array<SaveStruct>>, bad: PromiseReject) => {
      const présent = this.loadProperty(APP_NAME);
      if (présent) {
        good(transform2list(présent));
      } else {
        console.warn("WARNING [32456784564746456]: cache is empty; adding placeholder");
        this.saveProperty(APP_NAME, "[]");
        good([] as Array<SaveStruct>);
      }
    });
  }
}
