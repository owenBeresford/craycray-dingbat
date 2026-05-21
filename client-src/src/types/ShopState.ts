import type { InstanceListable, MatchedItems } from './ListCollection';

// current simple state, TBextended
export interface ShopState {
  currentURL: string;
  showHelp: boolean;
  currentId: number;
  serps?: InstanceListable<MatchedItems>;
}
