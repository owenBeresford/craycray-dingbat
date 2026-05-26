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

 * @param {MotionStream} c 
 * @param {FactoryArtefact} d
 * @public
 * @returns {ExternalMethods } - actually a SearchActions instance
 */
export function useThisListActions( c: MotionStream,d:FactoryArtefact  ): ExternalMethods {
  return new ThislistActions( c, d );
}

export { noop } from "./BaseActions";

/**
 * @class ThislistActions
 * This class is basically an adaptor for MotionStream
 * A class to make the SearchResults simpler.   This also improves testability.

 * @access public
 */
export class ThislistActions extends BaseActions implements ExternalMethods {
  protected flux: MotionStream;
  protected data:FactoryArtefact;

  protected offset: number;

  /**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 * NOTE:  not injected: StaticRoutes
 *
 * @param {MotionStream} ms
 * @param {FactoryArtefact} ld
 * @public
 * @returns {ExternalMethods}
 */
  public constructor( ms: MotionStream, ld:FactoryArtefact ) {
    super();
    this.offset = 0;
    this.flux = ms;
    this.data = ld;

    if (!this.flux) {
      throw new Error("The service class (MotionStream) for processing user gestures is absent");
    }
    // need to add events for swipe up or down.  
    // There is a double mapping for down, as this is a bounded range
    this.flux.register("90", this.onDragDWNFinalise.bind(this));
    this.flux.register("270", this.onDragUPFinalise.bind(this));
    this.flux.register("-90", this.onDragUPFinalise.bind(this));
    // this is swipe left
    this.flux.register("180", this.onSwipeOffFinalise.bind(this));
  }



  onSwipeOffFinalise(e: unknown, ctx: FakeThis): void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer) {
      ctx.listRef.value.remove(this.offset);
    } else {
      console.log(`Cannot delete this offset ${this.offset}`);
    }
  }

  onDragUPFinalise(e:unknown, ctx:FakeThis):void {
    if (this.offset >= 1 && this.offset < ctx.listRef.value.énumérer) {
      let tt=ctx.listRef.value.export();
      let copy=tt[ this.offset];
      tt[ this.offset] = tt[ this.offset-1];
      tt[ this.offset-1] =copy;
      ctx.listRef.value.import(tt, true);

      console.log(`Have a move request for offset ${this.offset}`);
    } else {
      console.log(`Cannot move this item ${this.offset}`);
    }
  } 

  onDragDWNFinalise(e:unknown, ctx:FakeThis):void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer-1) {
      let tt=ctx.listRef.value.export();
      let copy=tt[ this.offset];
      tt[ this.offset] = tt[ this.offset+1];
      tt[ this.offset+1] =copy;
      ctx.listRef.value.import(tt, true);

      console.log(`Have a move request for offset ${this.offset}`, JSON.stringify(ctx.listRef.value.éléments ));
    } else {
      console.log(`Cannot move this item ${this.offset}`);
    }
  }


  onAdd(e: GuessEvent, ctx: FakeThis): boolean {
    ctx.getInputRef.value = "";
    ctx.CBRef.value = (d1: string | null): void => {
      if (d1 === null) {
        ctx.canSeeInputRef.value = false;
        return;
      }
      ctx.listRef.add(d1);
      ctx.canSeeInputRef.value = false;
    };
    ctx.canSeeInputRef.value = true;
    return false;
  }

  onEdit(e: GuessEvent, ctx: FakeThis): boolean {
    let agaçant:HTMLElement;
    if(e instanceof PointerEvent) {
      agaçant = e!.target as HTMLElement;
    } else {
       agaçant = e!.currentTarget as HTMLElement;
    }
    ctx.getInputRef.value = `${agaçant!.innerText}`;

    ctx.CBRef.value = (d1: string | null): void => {
      if (d1 === null) {
        ctx.canSeeInputRef.value = false;
        return;
      }

      const indice = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      if (indice >= 0 && indice < ctx.listRef.value.énumérer) {
        ctx.listRef.value.edit(indice, d1);
        ctx.canSeeInputRef.value = false;
      } else {
        console.log(`Cannot update list item; bad offset value ${agaçant.innerText}`);
      }
    };

    ctx.canSeeInputRef.value = true;
    return false;
  }

  onSwipe(dir: string, e: TouchEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    //  if(dir !="left") { return; }  // IOIO need to see values first
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    console.log(`Deleting list element [${this.offset}] = ${agaçant.innerText} - ${dir} direction.`);
    this.onSwipeFinalise(e, ctx);
  }

  onDragStart(e: MouseEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);

    console.log("Start a drag event on ", this.offset);
  //  agaçant.setPointerCapture(e.pointerId);
    ctx.draggingRef.value[ this.offset]=true;
    this.flux.start(e);
  }

  onDragStop(e: MouseEvent, ctx: FakeThis): void {
    const agaçant = e!.currentTarget as HTMLElement;
    if( ! ctx.draggingRef.value[ this.offset] ) {
      console.log("Stop a drag event on ", this.offset);
      return; 
    }
    this.flux.end(e, ctx);
  //  agaçant.releasePointerCapture(e.pointerId);
    ctx.draggingRef.value[ this.offset]=false;
    console.log("Stop a drag event on ", this.offset);
    clearSelection();
  }

  onDragExit(e: FocusEvent, ctx: FakeThis): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    // new MouseEvent(typeArg, mouseEventInit);
    let e3: HTMLElement = e.relatedTarget as HTMLElement;
    if( ! ctx.draggingRef.value[ this.offset] ) {
      console.log("RANDOM Stop a drag event on ", this.offset);
      return; 
    }
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
  //  e3.releasePointerCapture(e.pointerId);
    ctx.draggingRef.value[ this.offset]=false;

    this.flux.end(e2, ctx);
    console.log("Exit a drag event for ", this.offset);
    clearSelection();
  }

  onDragMove(e: MouseEvent, ctx: FakeThis): void {
    console.log("Dragmove a drag event on ", e, this.offset);
    this.flux.addEvent(e);
  }
}
