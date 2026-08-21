import { StdList } from "./AList";
import { ListService } from "./ListService";
import type { ListCollection } from "../types/ListCollection";
import type { TestDataSchema } from "../../../common/types/TestDataSchema";
import type { PromiseSucceed, PromiseReject } from "../../../common/types/promises";
import type { NotifyType } from "../types/Actionables";
import type { DistantStorable } from "../../../common/types/RemoteTypes";

/**
 * TestListService
 * TestListService, the class to mediate List storage
 * NEEd: Not include/ import this for production builds.

 * @public
 */
export class TestListService extends ListService implements ListCollection<string> {
  /* An accessible variable to classes know their name after minification */
  protected static _debugSymbol = Symbol("TestListService");

  /**
   * constructor
   * Normal Con'tor

   * @param {Array<TestDataSchema>} src
   * @param {NotifyType} n - a feedback callback to notify Vue stack on data changes 
   * @public
   * @returns {ListService}
   */
  public constructor(src: Array<TestDataSchema>, n: NotifyType) {
    super(n);
    for (let i = 0; i < src.length; i++) {
      // Id0 is not a valid list-id, it is reserved for error spotting.
      this.put(i + 1, StdList.importTest(src[i]));
    }
    console.debug(`Imported a initial state of ${src.length} TEST items.`);
  }

  public flipConnection(a: DistantStorable): void {
    // do nout, do dep clases
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
   * @returns {Promise<boolean>}
   */
  public async loadAllLists(): Promise<boolean> {
    let out = true;
    return out;
  }
}
