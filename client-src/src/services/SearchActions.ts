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
import type { ExternalMethods, UserAction, CBType, SearchCtx } from "../types/Actionables";

/**
 * useSearchActions
 * A standard use* function. 
 
 * @param {SearchList} a
 * @param {MotionStrea<SearchCtx>} b
 * @param {FactoryArtefact} c
 * @public
 * @returns {ExternalMethods } - actually a SearchActions instance
 */
export function useSearchActions(
  a: SearchList,
  b: MotionStream<SearchCtx>,
  c: FactoryArtefact
): ExternalMethods<SearchCtx> {
  return new SearchActions(a, b, c);
}

/**
 * @class SearchActions
 * This class is basically an adaptor for MotionStream
 * A class to make the SearchResults simpler.   This also improves testability.
 * IOIO Maybe should add the drag item events to here

 * @access public
 */
export class SearchActions extends BaseActions<SearchCtx> implements ExternalMethods<SearchCtx> {
  protected list: SearchList;
  protected flux: MotionStream<SearchCtx>;
  protected data: FactoryArtefact;

  protected offset: number;

  /**
 * Boring con'tor
 * This has params to make building unit-tests easier.
 // NOTE:  not injected: StaticRoutes
 *
 * @param {SearchList} al
 * @param {MotionStream} ms
 * @param { FactoryArtefact} ld
 * @public
 * @returns {ExternalMethods}
 */
  public constructor(al: SearchList, ms: MotionStream<SearchCtx>, ld: FactoryArtefact) {
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
    this.flux.register("0", this.onSwipeFinalise.bind(this));
  }

  public onSwipe(dir: string, e: TouchEvent, ctx: SearchCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    //  if(dir !="left") { return; }  // IOIO need to see values first
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    console.log(`Deleting list element [${this.offset}] = ${agaçant.innerText} - ${dir} direction.`);
    this.onSwipeFinalise(e, ctx);
  }

  public onSwipeFinalise(e: unknown, ctx: SearchCtx): void {
    if (this.offset >= 0 && this.offset < this.list.énumérer) {
      this.list.remove(this.offset);
    } else {
      console.log(`Cannot delete this offset ${this.offset}`);
    }
  }

  public onDragStart(e: MouseEvent, ctx: SearchCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.offset = parseInt(agaçant!.getAttribute("data-offset") ?? "-1", 10);
    this.flux.start(e, ctx);
  }

  public onDragStop(e: MouseEvent, ctx: SearchCtx): void {
    const agaçant = e!.currentTarget as HTMLElement;
    this.flux.end(e, ctx);
    clearSelection();
  }

  public onDragExit(e: FocusEvent, ctx: SearchCtx): void {
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

    this.flux.end(e2, ctx);
    clearSelection();
  }

  public onDragMove(e: MouseEvent, ctx: SearchCtx): void {
    this.flux.addEvent(e);
  }

  public onSave(e: GuessEvent, ctx: SearchCtx): void {
    let buff: StdList = StdList.manual("Search results", this.data.currentData!.count());
    let tmp = this.list.export();
    for (let i in tmp) {
      buff.add(tmp[i].item);
    }
    this.data.currentData!.append(buff);
    StaticRoutes.push({ name: "list-everything" });
  }
}
