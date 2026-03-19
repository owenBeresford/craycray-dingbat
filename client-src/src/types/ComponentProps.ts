import { ListStruct } from "../services/AList";

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

