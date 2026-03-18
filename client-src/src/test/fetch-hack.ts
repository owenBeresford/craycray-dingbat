/// <reference lib="dom" />
// Shamelesly ripped from "cross-fetch" (as found in npmjs)
// i ripped it as TSC was complaining about finding this file, and confusing the original names with native features
// #leSigh

export type FetchType = typeof fetch;
export type RequestType = typeof Request;
export type ResponseType = typeof Response;
export type HeadersType = typeof Headers;

/*
declare module "fetch-hack" {
  export const fetch; typeof FetchType;
  export const Request: typeof RequestType;
  export const Response: typeof ResponseType;
  export const Headers: typeof HeadersType;
 
}
*/
