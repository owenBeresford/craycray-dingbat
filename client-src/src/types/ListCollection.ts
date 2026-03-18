import type { DistantStorable } from "./RemoteTypes";
import type { LocalCopy } from "../services/LocalCopy";
import type { ListStruct } from "./AList";

export interface ListCollection {
  catalog: Array<AList>;
  remote: DistantStorable;
  local: LocalCopy;

  create(nom: string): number;
  poll(): Promise<boolean>;
  count(): number;
  delete(id: number): boolean;
  list(): Array<ListStruct>;
  get(id: number): AList | undefined;
  put(id: number, ret: AList): boolean;
  store(ret: AList, offset: number): boolean;
  saveAllLists(): boolean;
  loadAllLists(): boolean;
}
