import type { SaveStruct } from "./SaveStruct";

// Definition for a class to be able to pull and push data to the REST API.
// This is is network centric
export interface DistantStorable {
  saveState(dat: Array<SaveStruct>): Promise<boolean>;
  loadState(): Promise<Array<SaveStruct>>;

  poll(): Promise<boolean>;
}

/**
	Interface for what params can be passed to fetch
	I added agent for differing HTTP implementations #leSigh

 	@see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
*/
export interface RemoteConfig {
  url: string;
  timeout: number;
  headers: Record<string, string>; // eg 'Content-Type': 'application/json'
  mode: string; // allowed values no-cors, *cors, same-origin  
  method: string;
  credentials: string;
  agent?:any;
}

/* 
	Simplified values stored as a hash, see above link.
*/
export interface RSRemoteConfig {
  timeout: number;
  headers: Record<string, string>; //  'Content-Type': 'application/json'
  mode: string; // no-cors, *cors, same-origin
  method: string;
  credentials: string;
}

/*
	Structure used in HTTP responses from the designated Agent
*/
export interface APIResponseType {
  statusCode: string;
  result: string;
}

