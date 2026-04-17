/// <reference types="vite/client" />

export declare const _LOGGING_: Readonly<boolean>;
//console.warn("ENV D TS executed");

declare global {
  interface Window {
    readonly _LOGGING_: boolean;
  }
}

// possibly extend https://stackoverflow.com/questions/79734942/why-cant-i-define-a-new-interface-that-extends-the-window-interface