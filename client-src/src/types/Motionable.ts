import type { Vector } from "vector2d/src/Vector";
import type { MethodOptions, Ref } from "vue";

export type FakeThis = Record<string, Ref<any>>;
export type CBTYPE = (e:unknown, ctx:FakeThis|undefined) => void;

export interface Motionable {
  addEvent(e: MouseEvent): boolean;
  register(angle: string, CB: CBTYPE): boolean;
  clone(o1: number, o2: number): Vector;
  end(e: MouseEvent): boolean;
  start(e: MouseEvent): boolean;
  angle(delta1: Vector, delta2: Vector): number;
  significant(delta: Vector): boolean;
  significantAsPercentage(delta: Vector): boolean;
}
