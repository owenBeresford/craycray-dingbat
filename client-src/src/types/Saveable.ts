import type { SaveStruct } from '../../../common/types/SaveStruct';

export interface Storable {
  saveProperty(nom: string, dat: string): boolean;
  loadProperty(nom: string): string;

  saveState(dat: Array<SaveStruct>): Promise<boolean>;
  loadState(): Promise<Array<SaveStruct>>;
}

// not using Vuex here, as this has scope to this class ONLY
export type DelayCallbackType = (state: DataPipeline) => number;

export interface DataPipeline {
  currentDelay: number;
  pullWhenAble(): Promise<Array<SaveStruct>>;
  pushWhenAble(json: Array<SaveStruct>): Promise<boolean>;
}
