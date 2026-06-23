import type { RouteRecordNormalized, RouteLocationNormalizedLoadedGeneric } from "vue-router";
import type { Component } from "vue";

import { StdList, SearchList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";

import type { InstanceListable, ModuleListable, ListStruct, ListCollection } from "./ListCollection";
import type { Loggable } from "./Loggable";
import type { Motionable } from "./Motionable";
import type { LocalCopy } from "../services/LocalCopy";
import type { ShopState } from "../types/ShopState";
import type { Store } from "vuex";
import type { COMPLETE_STORE } from "../services/Store";
import type { CBType } from "./Actionables";
import type { FactoryArtefact } from "../services/DataFactory";
import type { TabBarCtx } from "../types/Actionables";

export interface ListOfListsProps {
  instanceId: string;
  mapURL: (a: string, b: number | null) => string;
  logoPath: string;
  viewId: string;
  listId: string;
  secondId: string;
}

export interface EnterInputStaticData {
  bIsMobile: boolean;
  bShow: boolean;
  oVal: string;
  cross: string;
  instanceId: string;
  desktopId: string;
  commitId: string;
  mobileId: string;
  cancelId: string;
  text: Record<string, string>;
}

export interface EnterInputProps {
  val: string;
  cb: CBType;
  visible: boolean;
  currentStateKey: string;
  testId: string;
}

export interface ThisListStaticData<I> {
  id: number;
  getInput: string;
  canSeeInput: boolean;
  cb: CBType;
  stream: Motionable<I>;
  offset: number;
  childId: string;
  nextTestId: string;
  bisMobile: boolean;
  aListId: string;
  list: StdList;
  logoPath: string;
  viewId: string;
  text: Record<string, string>;
}

export interface MainAppProps {
  currentStateKey: string;
  instanceId: string;
}

export interface SearchProps {
  term: string;
  currentStateKey: string;
  testId: string;
  route: RouteRecordNormalized;
  shopState: COMPLETE_STORE;
}

export interface SearchStaticData {
  aListId: string;
  viewId: string;
  logoPath: string;
  mapURL: MapUrlType;
  bisMobile: boolean;
  listTitles: Array<string>;
  text: Record<string, string>;
}

type MapUrlType = (nom: string, id: number | null) => string;

export interface TabBarStaticData {
  installEnabled: string;
  EIK: string;
  menuId: string;
  inputId: string;
  urls: Array<string>;
  hasData: boolean;
  hasDataAndList: boolean;
  menu: Record<string, string>; // l12n data
}

export interface UnknownRouteStaticData {
  mapURL: MapUrlType;
  cross: string;
  store: Store<ShopState>;
  instanceId: string;
  crossId: string;
  text: Record<string, string>;
}

export interface UnknownRouteProps {
  errpath: string;
  currentStateKey: string;
  testId: string;
}

export interface InterstitialStaticData {
  instanceId: string;
  closeId: string;
  local: LocalCopy;
  store: Store<ShopState>;
  iShow: boolean;
  list: StrictArray;
  urlsStack: StrictArray;
  firstPass: boolean;
  text: Record<string, string>;
  currentStateKey2: string;
}

export interface ThisListProps {
  currentStateKey: string;
  testId: string;
  shopStore: COMPLETE_STORE;
}

export interface InterstitialProps {
  ttl: number;
  display: string;
  show: boolean;
  currentStateKey: string;
  testId: string;
}

export interface TabBarContext {
  visibleRef: boolean;
  getInputRef: string;
  CBRef: CBType;
  storeRef: COMPLETE_STORE;
  menuStateRef: boolean;
}

export interface TabBarProps {
  currentStateKey: string;
  testId: string;
  shopStore: COMPLETE_STORE;
}

export interface TabBarSetupValues {
  extraMethods: MethodOptions;
  dataOnLoad: boolean;
  menuStateRef: Ref<boolean>;
  visibleRef: Ref<boolean>;
  getInputRef: Ref<string>;
  CBRef: Ref<CBType>;
  storeRef: Ref<COMPLETE_STORE>;
  log: Loggable;
  route: RouteLocationNormalizedLoadedGeneric;
  ctx: TabBarCtx;
}

export interface ThisListContext {
  getInputRef: string;
  CBRef: CBType;
  draggingRef: Array<boolean>;
  canSeeInputRef: boolean;
  listRef: StdList;
  gestureRef: Array<string>;
}

export interface ThisListSetupValues {
  extraMethods: MethodOptions;
  ctx: ThisListCtx;
  helpText: string;
  canSeeHelp: boolean;
  ttl: number;
  listRef: Ref<StdList<string>>;
  draggingRef: Ref<Array<boolean>>;
  gestureRef: Ref<Array<string>>;
}

export interface MainAppStaticData {
  tabId: string;
  msgId: string;
  msgState: string;
  loggingEnabled: boolean;
  fallBack:Component;
}

export interface MainAppSetup {
  data: FactoryArtefact;
  log: Loggable;
}

export interface MsgBarStaticData {
  msgBodyId: string;
  refreshId: string;
}

export interface MsgBarProps {
  currentStateKey: string;
  testId: string;
  enabled: boolean;
  msgs: Loggable;
}

export interface SearchContext {}

export interface SearchSetupState {
  extraMethods: MethodOptions;
  helpText: string;
  canSeeHelp: string;
  ttl: string;
  list: SearchList;
  log: Loggable;
  listData: FactoryArtefact;
  ctx: SearchCtx;
}

export type StrictArray = Array<string>;
