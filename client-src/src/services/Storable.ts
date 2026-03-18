import type { SaveStruct } from "../types/Saveable";
import type { ShippingStruct, ActionEnum } from "../types/Messagable";

export interface Storable {
  saveProperty(nom: string, dat: string): boolean;
  loadProperty(nom: string): string;

  saveState(dat: Array<SaveStruct>): Promise<boolean>;
  loadState(): Promise<Array<SaveStruct>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any  @typescript-eslint/explicit-module-boundary-types
export function transform2text(dat: any): string {
  if (typeof dat === "string") {
    return dat;
  } else if (typeof dat !== "object") {
    return "" + dat;
  } else {
    // if errors can happen here, aside from circular structures, I have no smart ideas...
    // circular structures are best whined back to the caller
    return JSON.stringify(dat);
  }
}

// IOIO TODO possible magic to make types work...
export function transform2list(dat: string): Array<SaveStruct> {
  return JSON.parse(dat) as Array<SaveStruct>;
}

export function packMsg(act: ActionEnum, dat: object): ShippingStruct {
  return { action: act, data: transform2text(dat) } as ShippingStruct;
}
