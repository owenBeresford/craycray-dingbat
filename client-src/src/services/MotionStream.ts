import { Vector } from "vector2d/src/Vector";
// its bad to import internal classes; but this package isn't compatible with modern bundlers/ classloaders
import { isMobile, windowSize, rad2deg } from "../../../common/util";
import {
  MOBILE_THRESHOLD,
  BIG_THRESHOLD,
  ANGLE_ACCURACY,
  CSS_SYMBOL_REMOVE,
  CSS_SYMBOL_ORDER,
  CSS_SYMBOL_UP,
  CSS_SYMBOL_DOWN,
} from "../Constants";
import type { CBTYPE, Motionable } from "../types/Motionable";
import { useLog } from "./LogStack";

const LOG = useLog();
/**
 * MotionStream 
 * OLD code to convert random move events into a coherent stream that can be acted on.
// IOIO extension: grab timestamp from events, log with Vector,
// allows computation of velocity
 * I think I need to replace this with newer JS API.
 
 * @public
 */
export class MotionStream<T> implements Motionable<T> {
  protected stack: Array<Vector>;
  protected actions: Record<string, CBTYPE<T>>;
  protected active: boolean;
  protected mobile: boolean;

  /**
   * constructor
   * Plain con'tor, nothing noteworthy
 
   * @public
   */
  public constructor() {
    this.stack = [];
    this.actions = {};
    this.active = false;
    this.mobile = isMobile();
  }

  /**
   * addEvent
   * Push new Input event fron the user onto local stack
 
   * @param {MouseEvent} e
   * @public
   * @returns {boolean}
   */
  public addEvent(e: MouseEvent): boolean {
    if (this.active) {
      this.stack.push(new Vector(e.clientX, e.clientY));
    }
    return true;
  }

  /**
   * register
   * Register, for an angle of motion, what should happen 
       eg swipe right remove item, swipe left add to current list
	CB is short for callback. 

   * @param {string} angle - Due to JS limitations on hashes, the value needs to be a string. I cast it to an number later
   * @param {CBTYPE<T>} CB
   * @public
   * @returns {boolean}
   */
  public register(angle: string, CB: CBTYPE<T>): boolean {
    this.actions[angle] = CB;
    return true;
  }

  /**
   * end
   * Process the Last event in a gesture the JS engine sees.
   * This triggers related actions
  // currently only single direction actions supported...
 
   * @param {MouseEvent} e
   * @param {T} ctx - a very generic type, that can be applied to any Action module.  I make mapped types for more specific ones
   * @public
   * @returns {boolean}
   */
  public end(e: MouseEvent, ctx: T): boolean {
    if (!this.active) {
      return false;
    }
    this.stack.push(new Vector(e.clientX, e.clientY));
    this.active = false;
    let offset = 1;
    while (offset < this.stack.length) {
      const cur: Vector = this.clone(0, offset);
      if (this.significant(cur, this.mobile)) {
        let found = false;
        // need to change the angle() function for shapes more complex than a straight line swipe
        // ...splines...
        // it would be nice if the angle function was part of the Vector class
        const angle = rad2deg(this.angle(this.stack[0], this.stack[offset]));

        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const [i, obj] of Object.entries(this.actions)) {
          const i2 = parseInt(i, 10);
          if (angle + ANGLE_ACCURACY > i2 && angle - ANGLE_ACCURACY < i2) {
            obj(e, ctx);
            // move these next 2 lines if you want to allow more than one CB per gesture
            found = true;
          }
        }
        this.stack.splice(0, this.stack.length);
        return found;
      }
      offset += 1;
    }
    this.stack.splice(0, this.stack.length);
    return false;
  }

  /**
   * finalVector2text
   * A function to be called whilst a gesture is happening to allow useful feedback to the user.
   * This returns the current best guess as a CSS class name
   * Currently supported gestures are:
   *  - swipe (to the left) to delete
   *  - drag (up or down) to reorder list items
   *
   * @public
   * @returns {string}
   */
  public finalVector2text(): string {
    const angle = rad2deg(this.angle(this.stack[0], this.stack[this.stack.length - 1]));

    // IOIO these are hard coded in the wrong place.
    // but the function needs to live as it reads local state
    if (angle > 155 && angle < 205) {
      return CSS_SYMBOL_REMOVE;
    }
    if (angle > 70 && angle < 110) {
      return CSS_SYMBOL_ORDER + " " + CSS_SYMBOL_UP;
    }
    if (angle > 250 && angle < 290) {
      return CSS_SYMBOL_ORDER + " " + CSS_SYMBOL_DOWN;
    }
    if (angle > -110 && angle < -70) {
      return CSS_SYMBOL_ORDER + " " + CSS_SYMBOL_DOWN;
    }
    return "";
  }

  /**
   * clone
   * Copy a section of the current event stack, and convert to a vector
 
   * @param {number} o1 - stack offset index, o1 is likely to be 0 
   * @param {number} o2
   * @public
   * @returns {Vector}
   */
  public clone(o1: number, o2: number): Vector {
    const agaçant = this.stack[o1].toArray();
    const actuel: Vector = new Vector(agaçant[0], agaçant[1]);
    if (o2 >= this.stack.length || o2 < 1) {
      throw new Error(`Invalid clone id ${o2}`);
    }
    return actuel.subtract(this.stack[o2]);
  }

  /**
   * start
   * Start a gesture in the motion stream
 
   * @param {MouseEvent} e
   * @param { T} ctx - a very generic type, that can be applied to any Action module.  I make mapped types for more specific ones
   * @public
   * @returns {boolean}
   */
  public start(e: MouseEvent, ctx: T): boolean {
    if (this.active) {
      // This case happens when you drag into a different button.
      this.end(e, ctx);
      return true;
    }
    this.stack.push(new Vector(e.clientX, e.clientY));
    this.active = true;
    return true;
  }

  /**
   * significant
   * Compute if delta is larger than thresholds,
   * This means the user has made a noticeable motion, so intensional
   * See {MOBILE_THRESHOLD} and {BIG_THRESHOLD} 
 
   * @param {Vector} delta
   * @public
   * @returns {boolean}
   */
  public significant = (delta: Vector, mob: boolean): boolean => {
    const [x, y] = delta.toArray();
    if (mob) {
      return x > MOBILE_THRESHOLD || x * -1 > MOBILE_THRESHOLD || y > MOBILE_THRESHOLD || y * -1 > MOBILE_THRESHOLD;
    }
    return x > BIG_THRESHOLD || x * -1 > BIG_THRESHOLD || y > BIG_THRESHOLD || y * -1 > BIG_THRESHOLD;
  };

  /**
   * angle
   * Use maths to convert two samples into a angle of motion
   * output values isn't intuitive, but is consistent with other implementations
 
   * @see [https://taskvio.com/maths/coordinate-geometry-calculators/angle-between-two-vectors-calculator/index.php]
   * @see [https://calculator.academy/coordinate-angle-calculator/]
     A previous maths notation: 
		      angle = arccos[(xa * xb + ya * yb) / (√(xa2 + ya2) * √(xb2 + yb2))]
     Current maths notation
          angle=atan( y2-y1, x2-x1)
   * @param {Vector} delta1
   * @param {Vector} delta2
   * @public
   * @returns {number}
   */
  public angle = (delta1: Vector, delta2: Vector): number => {
    const [x1, y1] = delta1.toArray();
    const [x2, y2] = delta2.toArray();
    let angle = Math.atan2(y2, x2) - Math.atan2(y1, x1);
    if (angle > Math.PI) {
      angle -= 2 * Math.PI;
    }
    if (angle < -1 * Math.PI) {
      angle += 2 * Math.PI;
    }

    return angle;
  };

  /**
   * significantAsPercentage
   * Determine significance of change, as a percentage
 
   * @param  {Vector} delta
   * @public
   * @returns {boolean}
   */
  public significantAsPercentage = (delta: Vector): boolean => {
    const [maxX, maxY] = windowSize();
    const [x, y] = delta.toArray();
    if (this.mobile) {
      return (x * 100) / maxX > MOBILE_THRESHOLD || (y * 100) / maxY > MOBILE_THRESHOLD;
    }
    return (x * 100) / maxX > BIG_THRESHOLD || (y * 100) / maxY > BIG_THRESHOLD;
  };
}
