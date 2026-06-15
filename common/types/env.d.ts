/// <reference types="vite/client" />

export declare const _LOGGING_: Readonly<boolean>;

declare global {
  interface Window {
    readonly _LOGGING_: boolean;
  }
}

console.info("The types data for _LOGGING_ was executed");
// possibly extend https://stackoverflow.com/questions/79734942/why-cant-i-define-a-new-interface-that-extends-the-window-interface
