import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";
import type { COMPLETE_STORE } from "./Store";
import type { FactoryArtefact } from "./DataFactory";

type SaferFunctionType = (...args: any[]) => any;
export type FakeThis = Record<string, Ref<any>>;
export type UserAction = (e: GuessEvent, ctx: FakeThis) => boolean;
export type CBType = (d1: string | null) => any;

// less portable, but mostly common
export interface MenuStateType {
  visibleRef: Ref<boolean>;
  getInputRef: Ref<string>;
  CBRef: Ref<(a: string | null) => void>;
  storeRef: Ref<COMPLETE_STORE>;
  menuStateRef: Ref<boolean>;
}

export interface SearchStateType {}

export interface ExternalMethods {
  mount(ctx: Object, mapClass: ExternalMethods): MethodOptions;
}

/**
 * @class BaseActions
 * A class to make the TabBar simpler.   This also improves testability.
 * This module does not include a use* function.  Please subclass 

 * @access public
 */
export abstract class BaseActions implements ExternalMethods {
  protected data: FactoryArtefact;

  /**
   * mount
   * The accessible util to assign all the boilerplate code to the event handlers.
   * See HOC in a OO class

   * @see [https://stackoverflow.com/a/39723622]
   * @param {MenuStateType } ctx
   * @public
   * @returns {MethodOptions}
   */
  public mount(ctx: FakeThis, cls: ExternalMethods): MethodOptions {
    let ret = {
      [Symbol.iterator]() {
        const ar = Object.values(this);
        let i = 0;
        return {
          next() {
            if (i < ar.length) {
              let tmp = { value: ar[i], done: false };
              i++;
              return tmp;
            } else {
              return { done: true };
            }
          },
        };
      },
    };

    /** best solution
     * type MethodNames<T> = {
            [K in keyof T]: T[K] extends Function ? K : never
        }[keyof T];
     */

    let fna: Array<string> = Object.getOwnPropertyNames(Object.getPrototypeOf(cls)).filter(
      (x) => x.indexOf("on") === 0
    );
    for (let i in fna) {
      (ret as Record<string, any>)[fna[i]] = this.wrapper(this, (this as Record<string, any>)[fna[i]], ctx);
    }
    return ret;
  }

  /**
   * wrapper
   * A function -makin- function that creates boilerplate

   * @param {UserAction} f1
   * @param {FakeThis} ctx
   * @public
   * @returns {UserAction }
   */
  wrapper(SELF: BaseActions, f1: UserAction, ctx: FakeThis): UserAction {
    return function (e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        return false;
      }
      if ("data" in (SELF as BaseActions) && !SELF.data.currentData) {
        return false;
      }
      f1 = f1.bind(SELF);
      f1(e, ctx); // return void mostly
      return false;
    }.bind(SELF);
  }
}

export function noop(str: string | null): void {}
