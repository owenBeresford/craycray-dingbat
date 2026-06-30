// GLOBAL TOOLS
// globalSetup: "./src/test/vitest.setup.ts",
//
// / <reference types="../../../common/types/env.d.ts" />

/// <reference types="vite/client" />

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
export async function setup(): Promise<void> {
  //  console.warn("Vitest setup file is executed. "  );
}
// console.warn("Vitest setup file is loaded ");
export async function teardown(): Promise<void> {}

// ON EACH TEST TOOLS
// setupFiles: ['/tests/setup.ts'],
// beforeEach(() => {  // Do something here\n })
// afterEach(() =>  {  // Do something here\n })
//
