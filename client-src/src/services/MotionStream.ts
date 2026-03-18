import { Vector } from "vector2d/src/Vector";
import { CBTYPE, Motionable } from "../types/Motionable";
// its bad to import internal classes; but this package isn't compatible with modern bundlers/ classloaders
import { isMobile, windowSize, rad2deg } from "./util";

const MOBILE_THRESHOLD = 150;
const BIG_THRESHOLD = 200;
const ANGLE_ACCURACY = 20.0;

// IOIO extension: grab timestamp from events, log with Vector,
// allows computation of velocity
export class MotionStream implements Motionable {
  protected stack: Array<Vector>;

  protected actions: Record<string, CBTYPE>;

  protected active: boolean;

  constructor() {
    this.stack = [];
    this.actions = {};
    this.active = false;
  }

  addEvent(e: MouseEvent): boolean {
    if (this.active) {
      this.stack.push(new Vector(e.clientX, e.clientY));
    }
    return true;
  }

  register(angle: string, CB: CBTYPE): boolean {
    this.actions[angle] = CB;
    return true;
  }

  // currently only single direction actions supported...
  end(e: MouseEvent): boolean {
    if (!this.active) {
      return false;
    }
    this.stack.push(new Vector(e.clientX, e.clientY));
    this.active = false;

    let offset = 1;
    while (offset < this.stack.length) {
      const cur: Vector = this.clone(0, offset);
      if (this.significant(cur)) {
        let found = false;
        // need to change the angle() function for shapes more complex than a straight line swipe
        // ...splines...
        // it would be nice if the angle function was part of the Vector class
        const angle = rad2deg(this.angle(this.stack[0], this.stack[offset]));
        // eslint-disable-next-line guard-for-in, no-restricted-syntax
        for (const [i, obj] of Object.entries(this.actions)) {
          const i2 = parseInt(i, 10);
          // TEST VALUES: 8 + 20 < 0 && 8 - 20 >0
          if (angle + ANGLE_ACCURACY > i2 && angle - ANGLE_ACCURACY < i2) {
            obj();
            // move these next 2 lines if you want to allow more than one CB per gesture
            found = true;
            break;
          }
        }
        return found;
      }
      offset += 1;
    }
    return false;
  }

  clone(o1: number, o2: number): Vector {
    const annoying = this.stack[o1].toArray();
    const cur: Vector = new Vector(annoying[0], annoying[1]);
    if (o2 >= this.stack.length || o2 < 1) {
      throw new Error(`Invalid clone id ${o2}`);
    }
    return cur.subtract(this.stack[o2]);
  }

  start(e: MouseEvent): boolean {
    if (this.stack.length) {
      this.stack.splice(0, this.stack.length);
    }
    this.stack.push(new Vector(e.clientX, e.clientY));
    this.active = true;
    return true;
  }

  significant = (delta: Vector): boolean => {
    const [x, y] = delta.toArray();
    if (isMobile() === "") {
      return x > MOBILE_THRESHOLD || y > MOBILE_THRESHOLD;
    }
    return x > BIG_THRESHOLD || y > BIG_THRESHOLD;
  };

  /**
    * https://taskvio.com/maths/coordinate-geometry-calculators/angle-between-two-vectors-calculator/index.php
    vectors a = [xa, ya] , b = [xb, yb]
    angle = arccos[(xa * xb + ya * yb) / (√(xa2 + ya2) * √(xb2 + yb2))]
   */
  angle = (delta1: Vector, delta2: Vector): number => {
    const [x1, y1] = delta1.toArray();
    const [x2, y2] = delta2.toArray();

    const thing1 = x1 * x2 + y1 * y2;
    const thing2 = Math.sqrt(x1 * x1 + y1 * y1);
    const thing3 = Math.sqrt(x2 * x2 + y2 * y2);
    return Math.acos(thing1 / (thing2 * thing3));
  };

  significantAsPercentage = (delta: Vector): boolean => {
    const [maxX, maxY] = windowSize();
    const [x, y] = delta.toArray();
    if (isMobile() === "") {
      return (x * 100) / maxX > MOBILE_THRESHOLD || (y * 100) / maxY > MOBILE_THRESHOLD;
    }
    return (x * 100) / maxX > BIG_THRESHOLD || (y * 100) / maxY > BIG_THRESHOLD;
  };
}
