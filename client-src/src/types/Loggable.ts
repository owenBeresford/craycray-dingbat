export interface Loggable {
  addEvent(e: Event, volume: string): void;
  addRaw(msg: string, volume: string): void;
  readWhole(): Array<string>;
  readHead(rows: number): Array<string>;
}
