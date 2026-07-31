import type { ShippingStruct, ActionEnum } from "./Messagable";


export interface SaveStruct {
  name: string;
  created: number;
  edited: number;
  count: number;
  id: number;

  list: Array<string>;
}

export type MSG_RETURN_SAVE= { wrote: number, duration: number };

export type MSG_RETURN_ERROR = { wrote:number, error:string };
 
export type MSG_RETURN_STATUS= { duration: number, status:ActionEnum } ;

// type for "ret-payload" Array<SaveStruct> 
// type for "load-payload" Array<SaveStruct>
