import type { Listable, ListStruct, ListCollection } from "./ListCollection";
import type { Motionable } from "./Motionable";
import { AList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";
import type { LocalCopy } from "../services/LocalCopy";

import type { ShopState } from "../types/ShopState";
import type { Store } from "vuex";

export interface ListOfListsProps {
  instanceId: string;
  shoppingLists: Array<ListStruct>;
  mapURL: (a: string, b: number | null) => string;
  viewId: string;
  listId: string;
}

export interface EnterInputProps {
  bIsMobile:  boolean; 
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

export interface ThisListProps {
  id: number;
  list: AList;
  getInput: string;
  canSeeInput: boolean;
  cb: Function;
  stream: Motionable;
  offset: number;
  childId: string;
  nextTestId: string;
  bisMobile: boolean;
  aListId: string;
  viewId: string;
  text: Record<string, string>;
}

export interface MainAppProps {
  currentStateKey: string;
  instanceId: string;
}

type MapUrlType = (nom: string, id: number | null) => string;

export interface TabBarProps {
  menuLabel: string;
  menuState: string;
  menuOpen: boolean;
  getInput: string;
  visible: boolean;
  CB: Function;
  mapURL: MapUrlType;
  CACHE: CacheWrapper;
  installEnabled: string;
  EIK: string;
  menuId: string;
  inputId: string;
  urls: Array<string>;
  hasData: boolean;
  menu: Record<string, string>; // l12n data
}

export interface UnknownRouteProps {
  mapURL: MapUrlType;
  cross: string;
  store: Store<ShopState>;
  instanceId: string;
  crossId: string;
  text: Record<string, string>;
}

export interface InterstitialProps {
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

export type StrictArray = Array<string>;
