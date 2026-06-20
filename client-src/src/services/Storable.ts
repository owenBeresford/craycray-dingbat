import type { SaveStruct } from "../../../common/types/SaveStruct";
import type { ShippingStruct, ActionEnum } from "../../../common/types/Messagable";

/**
 * transform2text
 * As name says, create text from internal data structure

 * @param {any} dat - yes any type.
 * @public
 * @returns {string}
 */
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

/**
 * transform2list
 * As name says, create internal data structure from text
// IOIO TODO possible magic to make types work...

 * @throws {Error} - when the JSON isn't to expected format
 * @param {string} dat
 * @public
 * @returns {Array<SaveStruct>}
 */
export function transform2list(dat: string): Array<SaveStruct> {
  let thing: object = [];
  try {
    thing = JSON.parse(dat);
  } catch (e: unknown) {
    console.warn("52382354357457 JSON parsing broke " + (e as Error).message);
  }

  if (!Array.isArray(thing)) {
    throw new Error("345723456455 This should be an Array");
  }
  // Push into AList, then export to SaveStruct
  return thing as Array<SaveStruct>;
}

/**
 * packMsg
 * Pack data into a message blob

 * @param {ActionEnum} act
 * @param {object} dat
 * @public
 * @returns {ShippingStruct}
 */
export function packMsg(act: ActionEnum, dat: object): ShippingStruct {
  return { action: act, data: transform2text(dat) } as ShippingStruct;
}
