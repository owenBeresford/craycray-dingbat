// GLOBAL TOOLS
// globalSetup: "./src/test/vitest.setup.ts",
//
export async function setup(): Promise<void> {
  global._LOGGING_ = process.env.NODE_ENV !== "production";
  console.warn("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW 6");
}

export async function teardown(): Promise<void> {}

// ON EACH TEST TOOLS
// setupFiles: ['/tests/setup.ts'],
// beforeEach(() => {  // Do something here\n })
// afterEach(() =>  {  // Do something here\n })
//
console.warn("WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW 18");
