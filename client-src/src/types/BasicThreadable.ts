export interface BasicThreadable {
  forkThread(): Promise<boolean>;
  reapThread(): boolean;

  poll(): Promise<boolean>;
}
