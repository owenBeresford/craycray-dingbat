import type { Vector } from "vector2d/src/Vector";
import type { MethodOptions, Ref } from "vue";

export type CBTYPE<I> = (e: unknown, ctx: I) => void;

export interface Motionable<I> {
  addEvent(e: MouseEvent): boolean;
  register(angle: string, CB: CBTYPE<I>): boolean;
  clone(o1: number, o2: number): Vector;
  end(e: MouseEvent, ctx: I): boolean;
  start(e: MouseEvent, ctx: I): boolean;
  angle(delta1: Vector, delta2: Vector): number;
  significant(delta: Vector, mobile: boolean): boolean;
  significantAsPercentage(delta: Vector): boolean;
}
