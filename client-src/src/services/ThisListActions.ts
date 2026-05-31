 
import type { Ref } from "vue";

import { BaseActions } from "./BaseActions";

import { StdList } from "./AList";
import { MotionStream } from "./MotionStream";
import { useLog} from './LogStack';
import { clearSelection } from "../../../common/util";

import type { FactoryArtefact } from "./DataFactory";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { ExternalMethods, FakeThis,  CBType } from "../types/Actionables";

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
    draggingRef: Array<boolean> ;
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
  }

  public onSwipeOffFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer) {
      ctx.listRef.value.remove(this.offset);
    } else {
      console.info(`Cannot delete this offset ${this.offset}`);
    }
  }

  public onDragUPFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 1 && this.offset < ctx.listRef.value.énumérer) {
      let tt = ctx.listRef.value.export();
      let copy = tt[this.offset];
      tt[this.offset] = tt[this.offset - 1];
      tt[this.offset - 1] = copy;
      ctx.listRef.value.import(tt, true);
      LOG.addRaw(`List ${ctx.listRef.value.nom}, have a move UP request for offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}' `, "debug");
      console.debug(`Have a move request for offset ${this.offset}`);
    } else {
      console.info(`Cannot move this item ${this.offset}`);
    }
  }

  public onDragDWNFinalise(e: unknown, ctx: ThisListCtx): void {
    if (this.offset >= 0 && this.offset < ctx.listRef.value.énumérer - 1) {
      let tt = ctx.listRef.value.export();
      let copy = tt[this.offset];
      tt[this.offset] = tt[this.offset + 1];
      tt[this.offset + 1] = copy;
      ctx.listRef.value.import(tt, true);
      LOG.addRaw(`List ${ctx.listRef.value.nom}, have a move DOWN request for offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}' `, "debug");
      console.debug(`Have a move request for offset ${this.offset}` );
    } else {
      console.info(`Cannot move this item ${this.offset} `);
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
        return;
      }

      const indice = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
      if (indice >= 0 && indice < ctx.listRef.value.énumérer) {
        ctx.listRef.value.edit(indice, d1);
        LOG.addRaw(`List ${ctx.listRef.value.nom}, edit item at offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}' => '${d1}' `, "debug");
        ctx.canSeeInputRef.value = false;
      } else {
        console.info(`Cannot update list item; bad offset value for ${agaçant.innerText}`);
      }
    };

    ctx.canSeeInputRef.value = true;
    return false;
  }

  public onSwipe(dir: string, e: TouchEvent, ctx: ThisListCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    //  if(dir !="left") { return; }  // IOIO need to see values first
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    console.info(`Deleting list element [${this.offset}] = ${agaçant.innerText} - ${dir} direction.`);
    LOG.addRaw(`List ${ctx.listRef.value.nom}, deleting item at offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}'`, "debug");
    this.onSwipeOffFinalise(e, ctx);
  }

  public onDragStart(e: MouseEvent, ctx: ThisListCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);

    console.debug("Start a drag event on ", this.offset);
    ctx.draggingRef.value[this.offset] = true;
    this.flux.start(e, ctx);
  }

  public onDragStop(e: MouseEvent, ctx: ThisListCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    if( !ctx.draggingRef.value[this.offset]) {
      console.debug("Stop a drag event on ", this.offset, ` Item wasn't previously dragging ${agaçant.innerText}?` );
      return;
    }
    this.flux.end(e, ctx);
    ctx.draggingRef.value[this.offset] = false;
    console.debug("Stop a drag event on ", this.offset);
    LOG.addRaw(`List ${ctx.listRef.value.nom}, deleting item at offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}'`, "debug");
    clearSelection();
  }

  public onDragExit(e: FocusEvent, ctx: ThisListCtx): void {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
    // new MouseEvent(typeArg, mouseEventInit);
    let e3: HTMLElement = e.relatedTarget as HTMLElement;
    if (!ctx.draggingRef.value[this.offset]) {
      console.debug("RANDOM Stop a drag event on ", this.offset);
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
    ctx.draggingRef.value[this.offset] = false;

    this.flux.end(e2, ctx);
    console.debug("Exit a drag event for ", this.offset);
    LOG.addRaw(`List ${ctx.listRef.value.nom}, deleting item at offset ${this.offset} '${ctx.listRef.value.éléments[this.offset]}'`, "debug");
    clearSelection();
  }

  public onDragMove(e: MouseEvent, ctx: ThisListCtx): void {
    console.debug("Dragmove a drag event on ", e, this.offset);
    this.flux.addEvent(e);
  }
}
