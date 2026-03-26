import { ref } from 'vue';

import { ListService } from "./ListService";
import { useLocal } from "./LocalCopy";
import { useMsgDistrib } from "./MessageDistribution";
import { createRemoteService } from "../Constants";
import { TestListService } from './TestListService';
import { NetworkedListService } from './NetworkedListService';
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
  currentData:ListCollection | undefined;
  initData: ()=>void;   // a nothing burger, a promise note
}

/* 
  This function/ pattern can be called:
    * Asynchronous Facade Pattern
    * Dependency Injection with Async Worker
    * Reactive State Wrapper
    * Fire‑and‑Forget Command Pattern
  
  This function "async washes", to be linkable and usable with general SPA frameworks. 

  @returns {FactoryArtefact} - see above tuple interface
 */
export function createDataFactory(override: Array<TestDataSchema>|undefined):FactoryArtefact {
  let currentData :ListCollection | undefined = undefined;
  if(override) {
    currentData=new TestListService(override);
      
    return {
    currentData,
    initData:function() {}   
     } as Readonly<FactoryArtefact>;
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
  if (currentData && (await currentData.poll())) {
    return;
  }

  // Local has no state, so no extra loading data
  const d3 = useLocal();
  const d2 = createRemoteService(global.location);
  if (await d2.poll()) {
    data = new NetworkedListService(d2, d3);
    if (!currentData) {
      currentData = data;
    }

  } else {
    d4 = useMsgDistrib() as MessageDistribution;
    await d4.forkThread();
    data = new NetworkedListService(d4 as DistantStorable, d3);
    currentData = data;
  }
}

  function initData( ) {
    void currentNetworkConfig( );  
  }

  return {
    currentData,
    initData // sync method
  } as Readonly<FactoryArtefact>;
}

export const ListData: FactoryArtefact  = createDataFactory( undefined);
// export TestDataSchema; 