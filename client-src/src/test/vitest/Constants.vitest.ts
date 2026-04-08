import { assert, describe, expect, vi, it, expectTypeOf, assertType } from "vitest";

import { RemoteStorage } from "../../services/RemoteStorage";
import { createRemoteService } from "../../Constants";

describe("test on Localisation", () => {
  it("Can use createRemoteService", () => {
    let txt = createRemoteService(location);
    expect(typeof txt).toBe("object");
    assertType<(loc: Location) => RemoteStorage>(createRemoteService);
  });

  it("Can use createRemoteService", () => {
    let txt = createRemoteService(location);
    expect(typeof txt).toBe("object");
    assertType<RemoteStorage>(txt);

    // Um, I need to have a behaviour to test.
  });
});
