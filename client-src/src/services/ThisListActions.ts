import type { Ref } from "vue";

import { BaseActions } from "./BaseActions";

import { StdList } from "./AList";
import { MotionStream } from "./MotionStream";
import { useLog } from "./LogStack";
import { clearSelection } from "../../../common/util";
import { CSS_SYMBOL_ORDER,CSS_SYMBOL_UP, CSS_SYMBOL_DOWN, CSS_SYMBOL_RECEIPT } from '../Constants';

import type { FactoryArtefact } from "./DataFactory";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ExternalMethods, FakeThis, CBType } from "../types/Actionables";

/**
 * useSearchActions
 * A standard use* function.

 * @param {MotionStream} c 
 * @param {FactoryArtefact} d
 * @public
 * @returns {ExternalMethods } - actually a SearchActions instance
 */
export function useThisListActions(c: typeof MotionStream, d: FactoryArtefact): ExternalMethods {
  return new ThislistActions(c, d);
}

// this types here are NOT reusable.
// it is to narrow the FakeThis to add safety *here*
type ThisListCtx = {
  [K in keyof ThisListContext]: Ref<ThisListContext[K]>;
};

interface ThisListContext {
  canSeeInputRef: boolean;
  getInputRef: string;
  CBRef: CBType;
  listRef: typeof StdList;
  draggingRef: Array<boolean>;
}

export { noop } from "./BaseActions";
const LOG = useLog();

/**
 * @class ThislistActions
 * This class is basically an adaptor for MotionStream
 * A class to make the SearchResults simpler.   This also improves testability.

 * @access public
 */
export class ThislistActions extends BaseActions implements ExternalMethods {
  protected flux: MotionStream;
  protected data: FactoryArtefact;

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
  public constructor(ms: MotionStream, ld: FactoryArtefact) {
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
    LOG.addRaw("Thislist has Event logging and swipe action are engaged", "debug");
  }

  // dont disable the draggingRef or gestureRef, here
  public onSwipeOffFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer) {
      ctx.listRef.value.remove(this.offset);
      LOG.addRaw(
      `For list ${ctx.listRef.value.nom}, removed item #${this.offset} '${
        ctx.listRef.value.éléments[this.offset]
      }'`,
      "info"
    );
    // } else {
    //  console.info(`Cannot delete this offset ${this.offset}`);
    }
  }

  // dont disable the draggingRef or gestureRef, here
  public onDragUPFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 1 && this.offset < ctx.listRef.value.énumérer) {
      let tt = ctx.listRef.value.export();
      let copy = tt[this.offset];
      tt[this.offset] = tt[this.offset - 1];
      tt[this.offset - 1] = copy;
      ctx.listRef.value.import(tt, true);
      
      LOG.addRaw(
        `List ${ctx.listRef.value.nom}, have a move UP request for offset ${this.offset} '${
          ctx.listRef.value.éléments[this.offset]
        }' `,
        "debug"
      );
    } else {
      LOG.addRaw(
        `Cannot move this item #${this.offset} (invalid id)`,
        "warn"
      );
    }
  }

  // dont disable the draggingRef or gestureRef,  here
  public onDragDWNFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer - 1) {
      let tt = ctx.listRef.value.export();
      let copy = tt[this.offset];
      tt[this.offset] = tt[this.offset + 1];
      tt[this.offset + 1] = copy;
      ctx.listRef.value.import(tt, true);

      LOG.addRaw(
        `List ${ctx.listRef.value.nom}, have a move DOWN request for offset ${this.offset} '${
          ctx.listRef.value.éléments[this.offset]
        }' `,
        "debug"
      );
    } else {
      LOG.addRaw(
        `Cannot move this item ${this.offset} (invalid id)`,
        "warn"
      );
    }
  }




  public onAdd(e: GuessEvent, ctx: ThisListCtx): boolean {
    ctx.getInputRef.value = "";
    ctx.CBRef.value = (d1: string | null): void => {
      if (d1 === null) {
        ctx.canSeeInputRef.value = false;
        return;
      }
      ctx.listRef.value.add(d1);
      LOG.addRaw(
      `For list ${ctx.listRef.value.nom}, added item #${ctx.listRef.value.length} '${d1}'`,
      "info"
    );
      ctx.canSeeInputRef.value = false;
    };
    ctx.canSeeInputRef.value = true;
    return false;
  }

  public onEdit(e: GuessEvent, ctx: ThisListCtx): boolean {
    let agaçant: HTMLElement;
    if (e instanceof PointerEvent) {
      agaçant = e!.target as HTMLElement;
    } else {
      agaçant = e!.currentTarget as HTMLElement;
    }
    ctx.getInputRef.value = `${agaçant!.innerText}`;

    ctx.CBRef.value = (d1: string | null): void => {
      if (d1 === null) {
        ctx.canSeeInputRef.value = false;
         LOG.addRaw(
        `Edit cancelled this item ${this.offset} (invalid id) ${agaçant.innerText}`,
        "warn"
           );
        return;
      }

      const indice = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      if (indice >= 0 && indice < ctx.listRef.value.énumérer) {
        ctx.listRef.value.edit(indice, d1);
        LOG.addRaw(
          `List ${ctx.listRef.value.nom}, edit item #${this.offset} '${
            ctx.listRef.value.éléments[this.offset]
          }' => '${d1}' `,
          "info"
        );
        ctx.canSeeInputRef.value = false;
      } else {
         LOG.addRaw(
        `Cannot edit this item ${this.offset} (invalid id) ${agaçant.innerText}`,
        "warn"
           );
      }
    };

    ctx.canSeeInputRef.value = true;
    return false;
  }

  /********************* Event handlers for mobile motions  ********************************/

  // maybe extract middle of func, as duped
  public onSwipeStart(e: PointerEvent, ctx: ThisListCtx): void {
    const agaçant = e!.target as HTMLElement;
    this.flux.start(e, ctx);
    agaçant.setPointerCapture(e.pointerId);
    this.activateMotion( agaçant, ctx, "drag start or delete ", true ); 
  }

  public onSwipeMove(e: PointerEvent, ctx: ThisListCtx): void {
    ctx.gestureRef.value[this.offset]= this.flux.finalVector2text();
    if(ctx.gestureRef.value[this.offset].match(CSS_SYMBOL_UP) && this.offset< ctx.gestureRef.value.length ) {
      ctx.gestureRef.value[this.offset+1]=CSS_SYMBOL_ORDER +" "+CSS_SYMBOL_RECEIPT;
    } else if(ctx.gestureRef.value[this.offset].match(CSS_SYMBOL_DOWN) && this.offset >0 ) {
      ctx.gestureRef.value[this.offset-1]=CSS_SYMBOL_ORDER +" "+CSS_SYMBOL_RECEIPT;
    }
    this.flux.addEvent(e);
  }
 
  public onSwipeStop(e: PointerEvent, ctx: ThisListCtx): void {
    const agaçant = e!.target as HTMLElement;
    if (!ctx.draggingRef.value[this.offset]) {
      console.debug("Stop a drag event on ", this.offset, ` Item wasn't previously dragging ${agaçant.innerText}?`);
      return;
    }
    this.flux.end(e, ctx);
console.log("WWWWW ", ctx.gestureRef.value, this.offset, CSS_SYMBOL_UP, "WWWWWW" );   
    if(ctx.gestureRef.value[this.offset].match(CSS_SYMBOL_UP) && this.offset>=0 ) {
      ctx.gestureRef.value[this.offset+1]="";
    } else if(ctx.gestureRef.value[this.offset].match(CSS_SYMBOL_DOWN) && this.offset< ctx.gestureRef.value.length ) {
      ctx.gestureRef.value[this.offset-1]="";
    }
    ctx.gestureRef.value[this.offset]="";
    agaçant.releasePointerCapture(e.pointerId);
    this.activateMotion( agaçant, ctx, "swap or delete item", false ); 
    clearSelection();
  }

  /********************* Event handlers for WIMP actions ********************************/

  public onDragStart(e: MouseEvent, ctx: ThisListCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.activateMotion(agaçant, ctx, "mouse drag start", true);
    this.flux.start(e, ctx);
  }

  public onDragStop(e: MouseEvent, ctx: ThisListCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    if (!ctx.draggingRef.value[this.offset]) {
      console.debug("Stop a drag event on ", this.offset, ` Item wasn't previously dragging ${agaçant.innerText}`);
      return;
    }

    this.activateMotion(agaçant, ctx, "deleting item", false); 
    this.flux.end(e, ctx);
    ctx.gestureRef.value[this.offset]="";
    clearSelection();
  }

  public onDragExit(e: FocusEvent, ctx: ThisListCtx): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    // new MouseEvent(typeArg, mouseEventInit);
    let e3: HTMLElement = e.relatedTarget as HTMLElement;
    if (!ctx.draggingRef.value[this.offset]) {
      //  console.debug("RANDOM [big screen] Stop a drag event on ", this.offset);
      return;
    }
    this.activateMotion(e3, ctx, "drag exit (delete?)", false );

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
    this.flux.end(e2, ctx);
    ctx.gestureRef.value[this.offset]="";
    clearSelection();
  }

  public onDragMove(e: MouseEvent, ctx: ThisListCtx): void {
    this.flux.addEvent(e);
    ctx.gestureRef.value[this.offset]= this.flux.finalVector2text();
  }


  /****************************** util to reduce duplicate lines of code  *************************/
  protected activateMotion(agaçant:HTMLElement, ctx: ThisListCtx, msg:string, state:boolean ) :void {
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    LOG.addRaw(
      `List ${ctx.listRef.value.nom}, ${msg} on item '${
        ctx.listRef.value.éléments[this.offset]
      }'`,
      "debug"
    );
    ctx.draggingRef.value[this.offset] = state;
  }

}
