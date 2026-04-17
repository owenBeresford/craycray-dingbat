// GLOBAL TOOLS
// globalSetup: "./src/test/vitest.setup.ts",
//
/// <reference types="../types/env.d.ts" />
 
export async function setup(): Promise<void> {
  Object.defineProperty(globalThis, "_LOGGING_", {
    value: process.env.NODE_ENV !== "production",
    writable: true
});

}

export async function teardown(): Promise<void> {}

// ON EACH TEST TOOLS
// setupFiles: ['/tests/setup.ts'],
// beforeEach(() => {  // Do something here\n })
// afterEach(() =>  {  // Do something here\n })
//
 