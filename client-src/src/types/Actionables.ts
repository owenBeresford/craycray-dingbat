import type { MethodOptions, Ref } from "vue";

import type { COMPLETE_STORE } from "../services/Store";
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";
import type { SearchContext, ThisListContext, TabBarContext } from "./ComponentProps";

type SaferFunctionType = (...args: any[]) => any;
export type FakeThis<T> = { [K in keyof T]: Ref<T[K]> };

/* types for callbacks */
export type UserAction<I> = (e: GuessEvent, ctx: I) => boolean;
export type CBType = (d1: string | null) => any;
export type NotifyType = (d1: number) => any;

/**
  The basic type for the Actionables structure
 */
export interface ExternalMethods<I> {
  mount(ctx: I, mapClass: ExternalMethods<I>): MethodOptions;
}

/* a group of meta types that are specific *and* just a fancy array */
export type SearchCtx = FakeThis<SearchContext>;
export type ThisListCtx = FakeThis<ThisListContext>;
export type TabBarCtx = FakeThis<TabBarContext>;
