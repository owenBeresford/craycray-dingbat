import type { MethodOptions, Ref } from "vue";
import type { COMPLETE_STORE } from '../services/Store';
import type { GuessEvent } from "../../../common/types/infill-DOM-types-for-tests";


type SaferFunctionType = (...args: any[]) => any;
export type FakeThis = Record<string, Ref<any>>;
export type UserAction = (e: GuessEvent, ctx: FakeThis) => boolean;
export type CBType = (d1: string | null) => any;

/**
 @deprecated 
 Now unused, as didn't scale to several Actionables
*/
export interface MenuStateType {
  visibleRef: Ref<boolean>;
  getInputRef: Ref<string>;
  CBRef: Ref<(a: string | null) => void>;
  storeRef: Ref<COMPLETE_STORE>;
  menuStateRef: Ref<boolean>;
}

export interface SearchStateType {}

/**
  The basic type for the Actionables structure
 */
export interface ExternalMethods {
  mount(ctx: FakeThis, mapClass: ExternalMethods): MethodOptions;
}
