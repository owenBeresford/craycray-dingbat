export type ActionEnum =
  | "error-payload"
  | "status-payload"
  | "save-payload"
  | "load-payload"
  | "load-request"
  | "status-request"
  | "running"
  | "ret-payload";

export interface ShippingStruct {
  action: ActionEnum;
  data: string;
}
