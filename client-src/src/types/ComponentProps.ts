import type { Listable, ListStruct, ListCollection } from "./ListCollection";
import type { Motionable } from "./Motionable";
import { AList } from "../services/AList";
import { CacheWrapper } from "../workers/InstallWorker";

export interface ListOfListsProps {
  instanceId: string;
  shoppingLists: Array<ListStruct>;
  mapURL: (a: string, b: number | null) => string;
  viewId:string;
  listId:string;
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
  viewId:string;
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
  getInput: string;
  $store: object; // IOIO XXX fixme
  visible: boolean;
  CB: Function;
  mapURL: MapUrlType;
  CACHE: CacheWrapper;
  buttonEnabled: string;
  EIK: string;
  menuId: string;
  inputId: string;
  urls: Array<string>;
  menu: Record<string, string>; // l12n data
}

export type StrictArray = Array<string>;
