import { assert, describe, it, expect } from "vitest";

import { transform2list, transform2text } from "../services/Storable";
import type { PromiseSucceed, PromiseReject } from "../types/promises";
import { SaveStruct } from "../types/Saveable";

describe("I can run Storable", () => {
  it("I can transform2list", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let src = '[{"field1":"value1", "field2":"value2"}, {"field1":"value1", "field2":"value2"}]';
      let tmp: Array<SaveStruct> = transform2list(src);
      expect(Array.isArray(tmp)).toBe(true);
      expect(tmp.length > 0).toBe(true);

      // these next two more look at it crashin than expected data,
      // as those values shouldnt be passed to it
      src = "[]";
      tmp = transform2list(src);
      expect(Array.isArray(tmp)).toBe(true);
      expect(tmp.length > 0).toBe(false);

      src = "false";
      tmp = transform2list(src);
      expect(Array.isArray(tmp)).toBe(false);
      expect(tmp.length > 0).toBe(false);

      good(true);
    });
  });

  it("I can transform2text", (): Promise<boolean> => {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      let src = '[{"field1":"value1", "field2":"value2"}, {"field1":"value1", "field2":"value2"}]';
      let tmp: string = transform2text(src);
      // XXX IOIO

      good(true);
    });
  });
});
