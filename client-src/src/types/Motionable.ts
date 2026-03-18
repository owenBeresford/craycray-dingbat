import type { Vector } from "vector2d/src/Vector";
export type CBTYPE = () => void;

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
