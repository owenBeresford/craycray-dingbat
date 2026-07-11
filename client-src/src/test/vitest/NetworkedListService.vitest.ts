import { assert, describe, it, expect, expectTypeOf, assertType, afterEach } from "vitest";
import { LocalStorage } from "node-localstorage";

import { ListService } from "../../services/ListService";
import { useLocal, LocalCopy } from "../../services/LocalCopy";
import { NetworkedListService } from "../../services/NetworkedListService";
import { createDataFactory } from "../../services/DataFactory";
import { useMsgDistrib, MessageDistribution } from "../../services/MessageDistribution";
import { RemoteStorage } from "../../services/RemoteStorage";
import { TEST_LOCATION_URL, API_RETRY, APP_NAME } from "../../Constants";
import { StdList } from "../../services/AList";

import { TestLocation } from "../MockLocation";
import { runExecProcessOnUrl } from "../../../../common/cURL";
import { delay } from "../../../../common/util";

import type { BasicThreadable } from "../../types/BasicThreadable";
import type {
  DistantStorable,
  RemoteConfig,
  APIResponseType,
  RSRemoteConfig,
} from "../../../../common/types/RemoteTypes";
import type { FactoryArtefact } from "../../services/DataFactory"; // IOIO
import type { ListStruct, InstanceListable, ListCollection } from "../../types/ListCollection";
import type { PromiseSucceed, PromiseReject } from "../../../../common/types/promises";
import type { MessageDistribution as MessageDistributionType } from "../../services/MessageDistribution";

globalThis.localStorage = new LocalStorage("./public/scratch");
// turn API on first
// Run unit from Storybook
const TEST: TestLocation = new TestLocation(TEST_LOCATION_URL);
const PASSBACK = (a: number): void => {};

function directConnection(loc: Location | TestLocation): NetworkedListService {
  // Local has no state, so no extra loading data
  const d3 = useLocal();
  let d2 = {
    url: loc.protocol + "//" + loc.hostname + ":" + loc.port + "/api/shared-state",
    timeout: API_RETRY,
    headers: { "Content-Type": "application/json" },
    mode: "same-origin",
    method: "GET",
    credentials: "same-origin",
    agent: runExecProcessOnUrl,
  };
  let d4 = new RemoteStorage(d2);

  return new NetworkedListService(d4, d3, PASSBACK, [RemoteStorage.debugSymbol, LocalCopy.debugSymbol]);
}

function threadedConnection(): NetworkedListService {
  const d3: LocalCopy = useLocal();
  let d4: MessageDistribution = useMsgDistrib() as MessageDistribution;
  (d4 as BasicThreadable).forkThread(); // not async, as JS isnt here

  return new NetworkedListService(d4 as unknown as DistantStorable, d3, PASSBACK, [
    MessageDistribution.debugSymbol,
    LocalCopy.debugSymbol,
  ]);
}

describe("I can use NetworkedListService", () => {
  afterEach((): void => {
    globalThis.localStorage.clear();
    console.log("Running cleanup hook ", globalThis.localStorage.length);
  });

  // this ought to be run multiple times in different network settings
  // or maybe leave that to DataFactory test
  it("I can create it", (): void => {
    expect(typeof ListService).toBe("function");
    const CONN = directConnection(TEST);

    expect(typeof CONN).toBe("object");
    assertType<NetworkedListService>(CONN);
  });

  it("I can create it 2", (): void => {
    expect(typeof ListService).toBe("function");
    const CONN = threadedConnection();

    expect(typeof CONN).toBe("object");
    assertType<NetworkedListService>(CONN);
  });

  it("I can saveAllLists", async () => {
    const CONN = directConnection(TEST);
    globalThis.localStorage.clear();

    expect(CONN.create("item1")).toBe(2);
    const FIXTURE: StdList = Object.assign(StdList.manual("ignored", -1), {
      nom: "list 1",
      créé: new Date(),
      modifié: new Date(),
      énumérer: 4,
      id: 1,
      éléments: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
    });
    expect(CONN.create("item2")).toBe(3);
    expect(CONN.create("item3")).toBe(4);
    await expect(async () => {
      return await CONN.saveAllLists();
    }).rejects.toThrowError("Data is invalid (no details recorded yet).");

    CONN.put(0, FIXTURE);
    CONN.put(1, Object.assign(StdList.manual("ignored", -1), FIXTURE));
    FIXTURE.id = 3;
    FIXTURE.nom = "list 2";
    CONN.put(2, Object.assign(StdList.manual("ignored", -1), FIXTURE));
    FIXTURE.id = 4;
    FIXTURE.nom = "list 3";
    CONN.put(3, Object.assign(StdList.manual("ignored", -1), FIXTURE));

    globalThis.localStorage.clear();
    expect(globalThis.localStorage.length).toBe(0);
    await expect(CONN.saveAllLists()).resolves.toBe(true);
    expect(globalThis.localStorage.length).not.toBe(0);
  });

  it("I can saveAllLists 2 (breaks as Node threads)", async () => {
    const CONN = threadedConnection();
    globalThis.localStorage.clear();

    expect(CONN.create("item1")).toBe(2);
    const FIXTURE: StdList = Object.assign(StdList.manual("ignored", -1), {
      nom: "list 1",
      créé: new Date(),
      modifié: new Date(),
      énumérer: 4,
      id: 1,
      éléments: ["ssfsdf", "sdfsdf", "dgdgd", "dfgdfgfd"],
    });
    expect(CONN.create("item2")).toBe(3);
    expect(CONN.create("item3")).toBe(4);
    try {
      await expect(async () => {
        return await CONN.saveAllLists();
      }).rejects.toThrowError("Data is invalid (no details recorded yet).");
    } catch (e: unknown) {
      console.log("Error found in threaded retrieval " + (e as Error).message);
    }
    CONN.put(0, FIXTURE);
    CONN.put(1, Object.assign(StdList.manual("ignored", -1), FIXTURE));
    FIXTURE.id = 3;
    FIXTURE.nom = "list 2";
    CONN.put(2, Object.assign(StdList.manual("ignored", -1), FIXTURE));
    FIXTURE.id = 4;
    FIXTURE.nom = "list 3";
    CONN.put(3, Object.assign(StdList.manual("ignored", -1), FIXTURE));

    globalThis.localStorage.clear();
    expect(globalThis.localStorage.length).toBe(0);
    try {
      expect(await CONN.saveAllLists()).toBe(true);
    } catch (e: unknown) {
      console.log("Error found in threaded retrieval " + (e as Error).message);
    }
    expect(globalThis.localStorage.length).not.toBe(0);
  });

  it("I can loadAllLists", async () => {
    const CONN = directConnection(TEST);
    // at present not async

    expect(globalThis.localStorage.length).toBe(0);
    expect(CONN.loadAllLists()).toBe(true);
    expect(CONN.count()).toBe(1); // the empty list
    await delay(1_000);
    expect(CONN.count()).toBe(5);
    expect(globalThis.localStorage.length).toBe(1);
  });

  it("I can loadAllLists 2 (breaks as Node threads)", async () => {
    const CONN = threadedConnection();
    // at present not async

    expect(globalThis.localStorage.length).toBe(0);
    try {
      expect(CONN.loadAllLists()).toBe(true);
    } catch (e: unknown) {
      console.log("Error found in threaded retrieval " + (e as Error).message);
    }
    expect(CONN.count()).toBe(1); // the empty list
    await delay(1_000);
    expect(CONN.count()).toBe(1);
    expect(globalThis.localStorage.length).toBe(1);
  });

  it("I can poll", async (): Promise<void> => {
    const CONN = directConnection(TEST);

    expect(await CONN.poll()).toBe(true);
    expect(CONN.count()).toBe(1);
  });

  it("I can poll 2", async (): Promise<void> => {
    const CONN = threadedConnection();

    expect(await CONN.poll()).toBe(true);
    expect(CONN.count()).toBe(1);
  });
});
