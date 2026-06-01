import { reactive, readonly } from "vue";

import type { Loggable } from "../types/Loggable";
import { MAX_LOG_LENGTH, LOGGING_ENABLED } from "../Constants";
// add component flag for "no logging", to reduce RAM used if it isnt interesting

/**
 * useLog
 * Boring use* function
 
 * @public
 * @returns {Loggable}
 */
export function useLog(): Loggable {
  if (!SELF) {
    SELF = new LogService();
  }
  return SELF;
}
let SELF: Loggable;

/**
 * LogService
 * A collection class for log events.
   @todo in future add paging on read side
   @todo actually add collection features, if I get a usecase
   @todo maybe make some features be feature-flags if more time

 * @public
 */
export class LogService implements Loggable {
  protected log: Array<string>;

  /**
     * constructor
     * A boring con'tor
 
     * @public
     * @returns {self}
     */
  public constructor() {
    this.log = reactive({
      log: [] as string[],
    });
  }

  // @TODO
  addEvent(e: Event, volume: string): void {}

  /**
     * addRaw
     * The "write log" function.  Alters local state, doesn't directly output anything
     * If this requirement scales, make event objects like Stripe / ELK traces
     *  I'm ignoring colour options for now, as logging doesn't need to be pretty, just timely
     * WARN: after a data volume, the unshift() is probably slower that push() then reverse to render, or reverse via CSS
 
     * @param {string} msg
     * @param {string}  volume
     * @public
     * @returns {void}
     */
  public addRaw(msg: string, volume: string): void {
    if (!LOGGING_ENABLED) {
      return;
    } // reduce RAM used

    let d = new Date();
    volume = volume.toUpperCase();
    msg = `${volume} ${d.getUTCHours()}:${d.getUTCMinutes()}:${d.getUTCSeconds()} ${msg} `;
    if (msg.length > MAX_LOG_LENGTH) {
      msg = msg.substring(0, MAX_LOG_LENGTH);
    }
    console.debug(msg);

    this.log.log.unshift(msg);
    if (this.log.log.length % 100 === 0) {
      this.log.log.unshift("NOTICE --:-- >>>>>>>>>>>>>>>>>> 100 row marker <<<<<<<<<<<<<<<<<<");
    }
  }

  /**
     * readWhole
     * Data accessor, for whole data volume
 
     * @public
     * @returns {Readonly<Array<string>>}
     */
  public readWhole(): Readonly<Array<string>> {
    return readonly(this.log);
  }

  /**
     * readHead
     * Data accessor, this includes data volume limit
     * FIX FOR REACTIVITY
 
     * @param {number} rows
     * @public
     * @returns {Array<string>}
     */
  public readHead(rows: number): Array<string> {
    return this.log.slice(0, rows);
  }
}
