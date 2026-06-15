// GLOBAL TOOLS
// globalSetup: "./src/test/vitest.setup.ts",
//
// / <reference types="../../../common/types/env.d.ts" />

/// <reference types="vite/client" />

export declare const _LOGGING_: Readonly<boolean>;

declare global {
  interface Window {
    readonly _LOGGING_: boolean;
  }
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export async function setup(): Promise<void> {

  Object.defineProperty(globalThis, "_LOGGING_", {
    value: process.env.NODE_ENV !== "production",
    writable: true,
  });
  console.warn("Vitest setup file is executed. "+ globalThis._LOGGING_ );
}
console.warn("Vitest setup file is loaded ");
export async function teardown(): Promise<void> {}

// ON EACH TEST TOOLS
// setupFiles: ['/tests/setup.ts'],
// beforeEach(() => {  // Do something here\n })
// afterEach(() =>  {  // Do something here\n })
//
