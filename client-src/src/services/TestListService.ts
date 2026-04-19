import { AList } from "./AList";
import { ListService } from "./ListService";
import type { ListCollection } from "../types/ListCollection";
import type { TestDataSchema } from '../../../common/types/TestDataSchema';
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";

/**
 * TestListService 
 * TestListService, the class to mediate List storage
 * NEEd: Not include/ import this for production builds.
 
 * @public
 */
export class TestListService extends ListService implements ListCollection {
  /**
   * constructor
   * Normal Con'tor
 
   * @param {Array<TestDataSchema>} src
   * @public
   * @returns {ListService}
   */
  public constructor(src: Array<TestDataSchema>) {
    super();
    for (let i = 0; i < src.length; i++) {
      // Id0 is not a valid list-id, it is reserved for error spotting.
      this.put(i + 1, AList.importTest(src[i]));
    }
    console.log(`Imported a initial state of ${src.length} TEST items.`);
  }

  /**
   * poll
   * Check the remote data-sources are active (Wifi, and API running)
   * NULL IMPLEMEMENTATION
 
   * @public
   * @returns {Promise<boolean>}
   */
  public poll(): Promise<boolean> {
    return new Promise((good: PromiseSucceed<boolean>, bad: PromiseReject) => {
      good(true);
    });
  }

  /**
   * saveAllLists
   * Publish all collection items (Lists) to remote API
   * Maybe should restructure so the inverted Mapper() is pulled out
   * NULL IMPLEMEMENTATION

   * @public
   * @returns {boolean}
   */
  public async saveAllLists(): Promise<boolean> {
    return true;
  }

  /**
   * loadAllLists
   * Request data from both remote sources, cache response in local states
   * NULL IMPLEMEMENTATION
 
   * @public
   * @returns {boolean} 
   */
  public loadAllLists(): boolean {
    let out = true;
    return out;
  }
}
