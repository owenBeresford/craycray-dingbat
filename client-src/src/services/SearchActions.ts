import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import { BaseActions  } from './BaseActions';
import { AList } from "./AList";
import { MotionStream } from "./MotionStream";
import { isMobile, clearSelection } from "../../../common/util";

import type { UserAction, MenuStateType, ExternalMethods, CBType } from './BaseActions';
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";


export function useSearchActions(
  a: AList,
  b:MotionStream,
 ): ExternalMethods {
  return new SearchActions( a, b);
}

/**
 * @class SearchActions
 * This class is basically an adaptor for MotionStream
 * A class to make the SearchResults simpler.   This also improves testability.

 * @access public
 */
export class SearchActions extends BaseActions implements ExternalMethods {
  protected list: AList;
  protected flux:MotionStream;
 
/**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 // NOTE:  not injected: StaticRoutes
 *
 * @param {AList} al
 * @param {MotionStream} ms
 * @public
 * @returns {ExternalMethods}
 */
  public constructor(
    al: AList,
    ms:MotionStream
   ): SearchActions {
    super();
    this.offset=0;
    this.list = al;
    this.flux=ms;

    if (!this.list) {
      throw new Error("The results aren't populated, this module makes no sense");
    }
    if (!this.flux) {
      throw new Error("The service class (MotionStream) for processing user gestures is absent");
    }
    this.flux.register("0", this.onFinalise.bind(this));

   }
 

    onSwipe(dir: string, e: TouchEvent, ctx:MenuStateType): void {
      const agaçant = e!.currentTarget as HTMLElement;
      this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      console.log(`Deleting list element [${this.offset}] = ${agaçant.innerText}`);
      this.onFinalise();
    }

    onFinalise(e:unknown, ctx:MenuStateType): void {
      if (this.offset >= 0 && this.offset < this.list.énumérer) {
        this.list.remove(this.offset);
      } else {
        console.log(`Cannot delete this offset ${this.offset}`);
      }
    }

    onDragStart(e: MouseEvent, ctx:MenuStateType): void {
      const agaçant = e!.currentTarget as HTMLElement;
      this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      this.flux.start(e);
    }

    onDragStop(e: MouseEvent, ctx:MenuStateType ): void {
      const agaçant = e!.currentTarget as HTMLElement;
      this.flux.end(e);
      clearSelection();
    }

    onDragExit(e: FocusEvent, ctx:MenuStateType): void {
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
      // new MouseEvent(typeArg, mouseEventInit);
      let e3: HTMLElement = e.relatedTarget as HTMLElement;
      let e2:MouseEvent = new MouseEvent("mouseup", {
        screenX: e3.scrollLeft,
        screenY: e3.scrollTop,
        clientX: e3.scrollLeft,
        clientY: e3.scrollTop,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        button: 0,
        buttons: 1,
      } as MouseEventInit);

      this.flux.end(e2);
      clearSelection();
    }

    onDragMove(e: MouseEvent, ctx:MenuStateType): void {
      this.flux.addEvent(e);
    }

}