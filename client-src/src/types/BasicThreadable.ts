export interface BasicThreadable {
  forkThread(): boolean;
  reapThread(): boolean;

  poll(): Promise<boolean>;
}
