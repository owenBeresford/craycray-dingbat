import { ref } from "vue";
import type {  RouteLocationNormalizedLoadedGeneric } from "vue-router";
import { useRoute } from "vue-router";

import { isMobile, clearSelection, extractId } from "../services/util";
import { AList, EMPTY_LIST } from '../services/AList';
import { DELAY_FOR_API } from '../Constants';

import { ListService } from "./ListService";
import { useLocal } from "./LocalCopy";
import { useMsgDistrib } from "./MessageDistribution";
import { createRemoteService } from "../Constants";
import { TestListService } from "./TestListService";
import { NetworkedListService } from "./NetworkedListService";


import type { ListCollection, TestDataSchema } from "../types/ListCollection";
import type { DistantStorable } from "../types/RemoteTypes";
import type { MessageDistribution } from "./MessageDistribution";

// import type { BasicThreadable } from '../types/BasicThreadable';

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
  currentData: ListCollection | undefined;
  updateData: (a: ListCollection) => void;
  initData: () => void;
}

export const debugId = new WeakMap<object, number>();
let _idCounter = 1;

export function idOf(obj: object) {
  if (!debugId.has(obj)) debugId.set(obj, _idCounter++);
  return debugId.get(obj);
}

/*
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
  let ret:FactoryArtefact ={} as FactoryArtefact;
  ret.currentData=undefined;
  ret.updateData=updateData;
  ret.initData=initData;
  
  if (Array.isArray(override)) {
    ret.currentData = new TestListService(override);
     if(ret.currentData) {
      console.log("KKK createDataFactory (with a mock) ListData.currentData id:", idOf(ret.currentData));
    }
    ret.initData= function () {};
    return ret as  Readonly<FactoryArtefact>;
  }

/**
 * currentNetworkConfig
 * A "use function" to create ListCollections, which has different composition depending on network settings

 * @public
 * @returns {Promise<void>}
 */
  async function currentNetworkConfig(): Promise<void> {
    let d4: MessageDistribution;
    let data: ListService;
     if (ret.currentData && (await ret.currentData.poll())) {
      return;
    }

    // Local has no state, so no extra loading data
    const d3 = useLocal();
    const d2 = createRemoteService(global.location);
    if (await d2.poll()) {
      ret.currentData =  new NetworkedListService(d2, d3);
 
    } else {
      d4 = useMsgDistrib() as MessageDistribution;
      await d4.forkThread();
      ret.currentData = new NetworkedListService(d4 as DistantStorable, d3);
     }
  }

  /**
   * initData
   * Consumer access function, that includes "async washing".

   * @public
   * @returns {void}
   */
  function initData() {
    void currentNetworkConfig();
  }

/**
 * updateData
 * A util to replace the shared buffer with new content,
 * BUT NOT CHANGE THE POINTER.
 * "slap mutex on now!", only do not need to, as its JS.

 * @param {ListCollection} next
 * @public
 * @returns {void}
 */
  function updateData(next: ListCollection): void {
      if(ret.currentData) {
        console.log("KKK createDataFactory currentData id:", idOf(ret.currentData));
     }
    if (!ret.currentData) {
      ret.currentData = next;
       return;
    }
    for (let i = 0; i < ret.currentData.count(); i++) {
      ret.currentData.delete(i);
    }
    ret.currentData.merge(next);
    if(ret.currentData) {
      console.log("KKK createDataFactory currentData id:", idOf(ret.currentData));
    }
  }

  if(ret.currentData) {
    console.log("KKK createDataFactory currentData id:", idOf(ret.currentData));
  }
    
  initData();
  return ret;
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
 * @returns {Promise<AList>}
 */
export function setupCurrentList(itinéraire:undefined|RouteLocationNormalizedLoadedGeneric, ):AList {
 
  let id:number = 0;
  let liste =EMPTY_LIST;
  let currentData:ListCollection|undefined ;
  // let currentData:ListCollection|undefined =ListData.currentData;
  try {
    if(! itinéraire) {
      itinéraire = useRoute(); 
    }
          
    id = extractId(itinéraire.params.index);
    currentData =ListData.currentData;
    if (currentData) {
        liste = currentData.get(id) ?? EMPTY_LIST;
     }
    if(currentData) {
      console.log("KKK setupCurrentList currentData id:", idOf(currentData));
    }  
    
  } catch (e) {
    let backupId = 0;
    if (currentData) {
      backupId = currentData.create("New list");
    }
      // the second branch is stupid, but shouldnt be possible
      liste = EMPTY_LIST;
      if (currentData) {
        liste = currentData.get(backupId) ?? EMPTY_LIST;
      }
      id = backupId;
      if(currentData) {
         console.log("KKK setupCurrentList ERROR clause currentData id:", idOf(currentData));
      }     
  }

  if (!currentData || currentData.count() === 0) {
    console.warn("Local components have no data, check the API is running.");
    return EMPTY_LIST;
  } else {
    return liste;
  }
}

/**
 * setupCurrentList_BLOCKING
 * Setup the current AList, rather than the known lists.
 * May add further ways to set the list id in later editions.
 
 * @param {undefined|RouteLocationNormalizedLoadedGeneric} itinéraire ~ huge great big type is from vue-router
 * @public
 * @returns {Promise<AList>}
 */
function setupCurrentList_BLOCKING(itinéraire:undefined|RouteLocationNormalizedLoadedGeneric ):Promise<AList> {
  const DUMMY_LIST: AList = AList.manual("Empty list", 1); 
  let id:number = 0;
  let liste =DUMMY_LIST;
  let currentData:ListCollection|undefined =ListData.currentData;
  try {
    if(! itinéraire) {
      itinéraire = useRoute(); 
    }
          
    id = extractId(itinéraire.params.index);
    liste =DUMMY_LIST;
  let currentData:ListCollection|undefined =ListData.currentData;
     if (currentData) {
        liste = currentData.get(id) ?? DUMMY_LIST;
     }
  } catch (e) {
    let backupId = 0;
    if (currentData) {
      backupId = currentData.create("New list");
    }
      // the second branch is stupid, but shouldnt be possible
      liste = DUMMY_LIST;
      if (currentData) {
        liste = currentData.get(backupId) ?? DUMMY_LIST;
      }
      id = backupId;
  }

  if (!currentData || currentData.count() === 0) {
      // if this reference doesn't happen to be the first mention, it will have API content
      // I wish I could use Promises.then, but I can't really make the data() async
      // API should never take more than 500ms, as its not doing much, and its on LAN

    setTimeout(() => {
        if (!currentData) {
          console.warn("ThisList component has no data after 0.5s, check the API is running.");
          liste = DUMMY_LIST;
          return Promise.resolve( DUMMY_LIST);
        }
        liste = currentData.get(id) ?? DUMMY_LIST;
        return Promise.resolve(liste);
    }, DELAY_FOR_API);
  } else {
    return Promise.resolve(liste) ;
  }
  // typescript demands I add an extra return value here
}
