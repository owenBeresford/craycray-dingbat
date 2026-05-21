// Router imported to access the URL.  Maybe refactored to be prettier in future
import type { RouteLocationNormalizedLoadedGeneric } from "vue-router";
import { useRoute } from "vue-router";

import { extractId } from "./util";
import { StdList, EMPTY_LIST } from "./AList";

// import { ListService } from "./ListService";
import { useLocal } from "./LocalCopy";
import { useMsgDistrib } from "./MessageDistribution";
import { createRemoteService, DELAY_FOR_API } from "../Constants";
import { TestListService } from "./TestListService";
import { NetworkedListService } from "./NetworkedListService";

import type { InstanceListable, ModuleListable, ListCollection } from "../types/ListCollection";
import type { TestDataSchema } from "../../../common/types/TestDataSchema";
import type { DistantStorable } from "../../../common/types/RemoteTypes";
import type { MessageDistribution } from "./MessageDistribution";

/*                     TRUTH TABLE
----------------------------------------------------------
This should be read as before/ after pairs, for network channel changes.
Note "on Wifi" is 'no network' if the phone is outside the location.

       on 4g    on wifi    best class  rebuild data?
s1       Y                  Msg dist
s2                 Y        msg dist      N          **

s3                 Y        remote
s4       Y                  msg dist      Y

s5       Y                  msg dist
s6       Y                  msg dist      N

s7                 Y        remote
s8                 Y        remote        N

Note **: MesaggeDistribution class will ensure the data gets to the phone,
        so is not invalid on Wifi.
*/

// This interface should be kept here, as I think it will mutate
export interface FactoryArtefact {
  currentData: ListCollection<string> | undefined;
  updateData: (a: ListCollection<string>) => void;
  initData: () => void;
}

/** A module-wide collection of known variables
 */
const debugId = new WeakMap<object, number>();
let _idCounter = 1;

/**
 * idOf
 * A hashing function to convert <Structures> to unique-ids
 * Due to small scale here, returns number, not a UUID
 * DO NOT USE IN PRODUCTION BUILDS, OR FOR FEATURES
 
 * @param {object} obj
 * @public
 * @returns {number}
 */
export function idOf(obj: object): number {
  if (!debugId.has(obj)) debugId.set(obj, _idCounter++);
  return debugId.get(obj) ?? -1;
}

/**
 * createDataFactory
  This function/ pattern can be called:
    * Asynchronous Facade Pattern
    * Dependency Injection with Async Worker
    * Reactive State Wrapper
    * Fire‑and‑Forget Command Pattern

  This function "async washes", to be linkable and usable with general SPA frameworks.
  WARN: currently "tests with fixtures" cannot model network bounces, as its too fiddly/ unreliable.
     Run an E2E test instead, maybe accessing/ modifying firewall rules.

  @param {Array<TestDataSchema>|undefined} override ~ supported to initialise Fixtures
  @public
  @returns {FactoryArtefact} - see above tuple interface
 */
export function createDataFactory(override: Array<TestDataSchema> | undefined): FactoryArtefact {
  let retour: FactoryArtefact = {} as FactoryArtefact;
  retour.currentData = undefined;
  retour.updateData = updateData;
  retour.initData = initData;

  if (Array.isArray(override)) {
    retour.currentData = new TestListService(override);
    if (retour.currentData && _LOGGING_) {
      console.log("KKK createDataFactory (with a mock) ListData.currentData id:", idOf(retour.currentData));
    }
    retour.initData = function (): void {};
    return retour as Readonly<FactoryArtefact>;
  }

 /**
 * currentNetworkConfig
 * A "use function" to create ListCollections, which has different composition depending on network settings
 * @TODO add simplification when Storybook or Vitest is running

 * @public
 * @returns {Promise<void>}
 */
  async function currentNetworkConfig(): Promise<void> {
    let d4: MessageDistribution;
    if (retour.currentData && (await retour.currentData.poll())) {
      return;
    }

    // Local has no state, so no extra loading data
    const d3 = useLocal();
    const d2 = createRemoteService(globalThis.location);
    if (await d2.poll()) {
      retour.currentData = new NetworkedListService(d2, d3);
    } else {
      d4 = useMsgDistrib() as MessageDistribution;
      d4.forkThread();
      retour.currentData = new NetworkedListService(d4 as DistantStorable, d3);
    }
  }

  /**
   * initData
   * Consumer access function, that includes "async washing".

   * @public
   * @returns {void}
   */
  function initData(): void {
    void currentNetworkConfig();
  }

  /**
 * updateData
 * A util to replace the shared buffer with new content,
 * BUT NOT CHANGE THE POINTER.
 * "slap mutex on now!", only do not need to, as its JS.

 * @param {ListCollection<string>} next
 * @public
 * @returns {void}
 */
  function updateData(next: ListCollection<string>): void {
    if (retour.currentData && _LOGGING_) {
      console.log("KKK createDataFactory currentData id:", idOf(retour.currentData));
    }
    if (!retour.currentData) {
      retour.currentData = next;
      return;
    }
    for (let i = 0; i < retour.currentData.count(); i++) {
      retour.currentData.delete(i);
    }
    retour.currentData.merge(next);
    if (retour.currentData && _LOGGING_) {
      console.log("KKK createDataFactory currentData id:", idOf(retour.currentData));
    }
  }

  if (retour.currentData && _LOGGING_) {
    console.log("KKK createDataFactory currentData id:", idOf(retour.currentData));
  }

  initData();
  return retour;
}

// What external modules (aside from test) will gain from accessing.
// If the module thinks the network situation has changed, it can run initData() again.
export const ListData: FactoryArtefact = createDataFactory(undefined);

/**
 * setupCurrentList
 * THIS VERSION DOESNT WAIT FOR ANYTHING
 * Setup the current AList, rather than the known lists.
 * May add further ways to set the list id in later editions.
 
 * @param {undefined|RouteLocationNormalizedLoadedGeneric} itinéraire ~ huge great big type is from vue-router
// currentData:ListCollection | undefined
 * @public
 * @returns {Promise<InstanceListable<string>>}
 */
export function setupCurrentList(itinéraire: undefined | RouteLocationNormalizedLoadedGeneric): InstanceListable<string> {
  let id: number = 0;
  let liste = EMPTY_LIST;
  let currentData: ListCollection<string> | undefined;
  // let currentData:ListCollection|undefined =ListData.currentData;
  try {
    if (!itinéraire) {
      itinéraire = useRoute();
    }

    id = extractId(itinéraire.params.index);
    currentData = ListData.currentData;
    if (currentData) {
      liste = (currentData.get(id) as StdList) ?? EMPTY_LIST;
    }
    if (currentData && _LOGGING_) {
      console.log("KKK setupCurrentList currentData id:", idOf(currentData), " AND ", id);
    }
  } catch (e) {
    let backupId = 0;
    if (currentData) {
      backupId = currentData.create("New list");
    }
    // the second branch is stupid, but shouldnt be possible
    liste = EMPTY_LIST;
    if (currentData) {
      liste = (currentData.get(backupId) as StdList) ?? EMPTY_LIST;
    }
    id = backupId;
    if (currentData && _LOGGING_) {
      console.log("KKK setupCurrentList ERROR clause currentData id:", idOf(currentData));
    }
  }

  if (!currentData || currentData.count() === 0) {
    console.warn("Local components have no data, check the API is running.");
    return EMPTY_LIST as StdList;
  } else {
    return liste;
  }
}
