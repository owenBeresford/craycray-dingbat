import { assert, describe, it, expect } from "vitest";

import { Vector } from "vector2d";
import { MotionStream } from "../../services/MotionStream";
// import type { SearchCtx}  from '../../types/Actionables';

describe("I can run MotionStream", () => {
  it("I can create it", () => {
    const mm = new MotionStream();
    assert(mm, "this is an object");
    assert(mm instanceof MotionStream, "this is an object of correct type ");

    assert(mm.angle, "there is a function angle");
    assert(mm.significant, "there is a function significant");
  });

  it("The angle() seems to work", () => {
    const mm = new MotionStream();
    let d1 = new Vector(10, 0);
    let d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      0.7853981633974483,
      `I think ${mm.angle(d1, d2)} `
    );
    d1 = new Vector(0, 10);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      5.497787143782138,
      `I think ${mm.angle(d1, d2)}`
    );
    d1 = new Vector(-10, 0);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      2.356194490192345,
      `I think ${mm.angle(d1, d2)}`
    );
    d1 = new Vector(0, -10);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      2.356194490192345,
      `I think ${mm.angle(d1, d2)}`
    );
  });

  it("The angle() seems to work II", () => {
    const mm = new MotionStream();
    let d1 = new Vector(-10, 10);
    let d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      4.71238898038469,
      `I think ${mm.angle(d1, d2)}`
    );
    d1 = new Vector(10, -10);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      1.5707963267948966,
      `I think ${mm.angle(d1, d2)}`
    );
    d1 = new Vector(-10, -10);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      3.141592653589793,
      `I think ${mm.angle(d1, d2)}`
    );
    d1 = new Vector(10, 10);
    d2 = new Vector(10, 10);
    assert.equal(
      mm.angle(d1, d2),
      1.4901161193847656e-8,
      `I think ${mm.angle(d1, d2)}`
    );
  });

  it(" significant() seems to work", () => {
    const mm = new MotionStream();
    let d1 = new Vector(100, 100);
    assert.equal(
      mm.significant(d1),
      false,
      "with Fake screen size; 10% is not important"
    );
    d1 = new Vector(200, 200);
    assert.equal(
      mm.significant(d1),
      true,
      "with Fake screen size; 20% is important"
    );
    d1 = new Vector(145, 145);
    assert.equal(
      mm.significant(d1),
      false,
      "with Fake screen size; 14.5% is not important"
    );
    d1 = new Vector(155, 155);
    assert.equal(
      mm.significant(d1),
      true,
      "with Fake screen size; 15.5% is important"
    );
    d1 = new Vector(300, 300);
    assert.equal(
      mm.significant(d1),
      true,
      "with Fake screen size; 30% is important"
    );
    d1 = new Vector(0, 140);
    assert.equal(
      mm.significant(d1),
      false,
      "with Fake screen size; 14% is not important"
    );
    d1 = new Vector(0, 155);
    assert.equal(
      mm.significant(d1),
      true,
      "with Fake screen size; 15.5% is important"
    );
  });
});
