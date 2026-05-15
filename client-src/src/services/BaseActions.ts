import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";

export type UserAction = (e: GuessEvent) => boolean;
export type CBType = (d1: string | null) => any;

// less portable, but mostly common
export interface MenuStateType {
  visibleRef: Ref<boolean>;
  getInputRef: Ref<stringn>;
  CBRef: Ref<(a: MenuStateType) => void>;
  storeRef: Ref<COMPLETE_STORE>;
  menuStateRef: Ref<boolean>;
}

export interface SearchStateType {
}



// IOIO this type is abit of a hack...
// export type DefinedComponent = ReturnValue<defineComponent>;
export interface ExternalMethods {
  mount(): MethodOptions;
}

/**
 * @class BaseActions
 * A class to make the TabBar simpler.   This also improves testability.
 * This module does not include a use* function.  Please subclass 

 * @access public
 */
export abstract class BaseActions implements ExternalMethods {

  /**
   * mount
   * The accessible util to assign all the boilerplate code to the event handlers.
   * See HOC in a OO class

   * @see [https://stackoverflow.com/a/39723622]
   * @param {MenuStateType } ctx
   * @public
   * @returns {MethodOptions}
   */
  mount(ctx: MenuStateType, cls:unknown ): MethodOptions {
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

    let fna:Array<string> = Object.getOwnPropertyNames(cls.prototype)
            .filter (x => (x.indexOf('on')===0)  );
    for( let i in fna) {
        ret[fna[i]] = this.wrapper(this[fna[i]], ctx);
    }
    return ret;
  }

  /**
   * wrapper
   * A function -makin- function that creates boilerplate

   * @param {UserAction} f1
   * @param {MenuStateType} ctx
   * @public
   * @returns {UserAction }
   */
  wrapper(f1: UserAction, ctx: MenuStateType): UserAction {
    return function (e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        return false;
      }
      if ("data" in this && !this.data.currentData) {
        return false;
      }
      f1 = f1.bind(this);
      f1(ctx); // return void mostly
      return false;
    }.bind(this);
  } 
}

export function noop(str: string | null): void {}

 