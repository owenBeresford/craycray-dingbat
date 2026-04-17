// blagged from https://github.com/poelstra/ts-promise

//export type PromiseSucceed<T>= (value: Thenable<T> | T) => void;
export type PromiseSucceed<T> = (value: T) => void;
export type PromiseReject = (reason: Error) => void;
export type PromiseComplete<T> = (a: PromiseSucceed<T>, b: PromiseReject) => void;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables
// backlup definition node_modules/any-promise/index.d.ts
export interface Thenable<T> {
  then(good: PromiseSucceed<T>, bad: PromiseReject): void;
}

// usage:
// import type { PromiseSucceed, PromiseReject } from '../types/promises';
// return new Promise((good:PromiseSucceed, bad:PromiseReject) => {
