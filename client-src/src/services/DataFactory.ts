import { ListService, ListCollection } from "./ListService";
import { useLocal } from "./LocalCopy";
import { MessageDistribution, useMsgDistrib } from "./MessageDistribution";
import { createRemoteService } from "../Constants";
import type { DistantStorable } from '../types/RemoteTypes';
import type { BasicThreadable } from '../types/BasicThreadable';

/*                          
       on 4g    on wifi    best class  rebuild?
s1       Y                  Msg dist      
s2                 Y        msg dist      N

s3                 Y        remote        
s4       Y                  msg dist      Y

s5       Y                  msg dist   
s6       Y                  msg dist      N

s7                 Y        remote       
s8                 Y        remote        N

*/

let DATA: ListCollection | undefined;
async function DataFactory(): Promise<ListCollection> {
  const d3 = useLocal();
  const d2 = createRemoteService(global.location ); 
  // Local has no state, so no extra loading data
  let d4: MessageDistribution;
  let data: ListService;
  if (DATA && await DATA.poll()) {
    return DATA;
  }

  if (await d2.poll()) {
    data = new ListService(d2, d3);
    if (!DATA) {
      DATA = data;
    }
  } else {
    d4 =useMsgDistrib() as MessageDistribution; 
    await d4.forkThread();
    data = new ListService(d4 as DistantStorable, d3);
    DATA = data;
  }
  return data;
}

export { DataFactory };
