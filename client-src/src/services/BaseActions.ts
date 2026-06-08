import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";
import type { COMPLETE_STORE } from "./Store";
import type { FactoryArtefact } from "./DataFactory";
import type { ExternalMethods, UserAction, CBType } from "../types/Actionables";
import { useLog } from "./LogStack";

const LOG = useLog();

/**
 * @class BaseActions
 * A class to make the components with many actions simpler.   This also improves testability.
 * This module does not and should not include a use* function.  **Please subclass**

 * @access public
 */
export abstract class BaseActions<I> implements ExternalMethods<I> {
  protected data: FactoryArtefact;

  /**
   * mount
   * The accessible util to assign all the boilerplate code to the event handlers.
   * See HOC in a OO class

   * @see [https://stackoverflow.com/a/39723622]
   * @param {I } ctx
   * @param {ExternalMethods} cls 
   * @public
   * @returns {MethodOptions}
   */
  public mount(ctx: I, cls: ExternalMethods<I>): MethodOptions {
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

   * @param { BaseActions} SELF
   * @param {UserAction} f1
   * @param { I} ctx
   * @public
   * @returns {UserAction }
   */
  wrapper(SELF: BaseActions<I>, f1: UserAction<I>, ctx: I): UserAction<I> {
    return function (e: GuessEvent): boolean {
      if (e.type && e.type === "mouseup") {
        LOG.addRaw("event action in Base, mouse UP event", "debug");
        return false;
      }
      if ("data" in (SELF as BaseActions<I>) && !SELF.data.currentData) {
        LOG.addRaw("event action in Base, no data in currentData ", "debug");

        return false;
      }
      f1 = f1.bind(SELF);
      f1(e, ctx); // return void mostly
      return false;
    }.bind(SELF);
  }
}

/**
 * noop
 * A function that specifically does nothing, but is callable, to be a default action

 * @param {string | null} str
 * @public
 * @returns {void}
 */
export function noop(str: string | null): void {}
