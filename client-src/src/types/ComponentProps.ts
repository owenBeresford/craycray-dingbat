import type { Listable, ListStruct } from './ListCollection';
import type { Motionable } from './Motionable';
import {AList} from '../services/AList';
 
export interface ListOfListsProps {
  instanceId: string;
  shoppingLists: Array<ListStruct>;
  mapURL: (a: string, b: number | null) => string;
};

export interface ThisListProps {
  instanceId: string;
  id: number;
  list: AList;
  getInput: string;
  canSeeInput: boolean;
  cb: Function;
  stream: Motionable;
  offset: number;
  bisMobile: boolean;
};

