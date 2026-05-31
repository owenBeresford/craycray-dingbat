import type { RouteRecordNormalized } from "vue-router";

import { StdList, SearchList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";

import type { InstanceListable, ModuleListable, ListStruct, ListCollection } from "./ListCollection";
import type { Motionable } from "./Motionable";
import type { LocalCopy } from "../services/LocalCopy";
import type { ShopState } from "../types/ShopState";
import type { Store } from "vuex";
import type { COMPLETE_STORE } from "../services/Store";

export interface ListOfListsProps {
  instanceId: string;
  shoppingLists: Array<ListStruct>;
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

export interface ThisListStaticData {
  id: number;
  getInput: string;
  canSeeInput: boolean;
  cb: Function;
  stream: Motionable;
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
  hasDataAndList:boolean;
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

export type StrictArray = Array<string>;
