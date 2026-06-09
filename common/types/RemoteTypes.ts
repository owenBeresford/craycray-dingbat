import type { SaveStruct } from "./SaveStruct";

export interface DistantStorable {
  saveState(dat: Array<SaveStruct>): Promise<boolean>;
  loadState(): Promise<Array<SaveStruct>>;

  poll(): Promise<boolean>;
}

// see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
export interface RemoteConfig {
  url: string;
  timeout: number;
  headers: Record<string, string>; //  'Content-Type': 'application/json'
  mode: string; // no-cors, *cors, same-origin
  method: string;
  credentials: string;
  agent?:any;
}

export interface APIResponseType {
  statusCode: string;
  result: string;
}
