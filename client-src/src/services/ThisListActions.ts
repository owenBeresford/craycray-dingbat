import { defineComponent } from "vue";
import type { MethodOptions, Ref } from "vue";
import type { RouteRecordNormalized } from "vue-router";

import { BaseActions } from "./BaseActions";

import { SearchList, StdList } from "./AList";
import { MotionStream } from "./MotionStream";
import { isMobile, clearSelection } from "../../../common/util";
import { StaticRoutes } from "../components/Routing";

import type { FactoryArtefact } from "./DataFactory";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ListCollection, ListStruct, MatchedItems } from "../types/ListCollection";
import type { ExternalMethods, FakeThis, UserAction, CBType } from "../types/Actionables";

/**
 * useSearchActions
 * A standard use* function. 
 
 IOIO XXX
 * @public
 * @returns {ExternalMethods } - actually a SearchActions instance
 */
export function useThislistActions(b: Stdlist, c: MotionStream, d: FactoryArtefact): ExternalMethods {
  return new ThislistActions(b, c, d);
}

export { noop } from "./BaseActions";

/**
 * @class ThislistActions
 * This class is basically an adaptor for MotionStream
 * A class to make the SearchResults simpler.   This also improves testability.

 * @access public
 */
export class ThislistActions extends BaseActions implements ExternalMethods {
  protected list: StdList;
  protected flux: MotionStream;

  protected offset: number;

  /**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 // NOTE:  not injected: StaticRoutes
 *
 * @param {SearchList} al
 * @param {MotionStream} ms
 * IOIO XXX
 * @public
 * @returns {ExternalMethods}
 */
  public constructor(al: StdList, ms: MotionStream, ld: FactoryArtefact) {
    super();
    this.offset = 0;
    this.list = al;
    this.flux = ms;
    this.data = ld;

    if (!this.list) {
      throw new Error("The results aren't populated, this module makes no sense");
    }
    if (!this.flux) {
      throw new Error("The service class (MotionStream) for processing user gestures is absent");
    }
    // this is swipe left
    this.flux.register("0", this.onFinalise.bind(this));
    // need to add events for swipe up or down
  }

  onAdd(e: GuessEven, ctx: FakeThis): boolean {
    ctx.getInputRef = "";
    ctx.CBRef = (d1: string | null): void => {
      if (d1 === null) {
        ctx.canSeeInputRef = false;
        return;
      }
      this.list.add(d1);
      ctx.canSeeInputRef = false;
    };
    ctx.canSeeInputRef = true;
    return false;
  }

  onSwipe(dir: string, e: TouchEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    //  if(dir !="left") { return; }  // IOIO need to see values first
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    console.log(`Deleting list element [${this.offset}] = ${agaçant.innerText} - ${dir} direction.`);
    this.onSwipeFinalise(e, ctx);
  }

  onSwipeFinalise(e: unknown, ctx: FakeThis | undefined): void {
    if (this.offset >= 0 && this.offset < this.list.énumérer) {
      this.list.remove(this.offset);
    } else {
      console.log(`Cannot delete this offset ${this.offset}`);
    }
  }

  onDragStart(e: MouseEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);

    console.log("Start a drag event on ", this.offset);
    this.flux.start(e);
  }

  onDragStop(e: MouseEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.flux.end(e);
    console.log("Stop a drag event on ", this.offset);
    clearSelection();
  }

  onDragExit(e: FocusEvent, ctx: FakeThis): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    // new MouseEvent(typeArg, mouseEventInit);
    let e3: HTMLElement = e.relatedTarget as HTMLElement;
    let e2: MouseEvent = new MouseEvent("mouseup", {
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
    console.log("Exit a drag event for ", this.offset);
    clearSelection();
  }

  onDragMove(e: MouseEvent, ctx: FakeThis): void {
    this.flux.addEvent(e);
  }
}
