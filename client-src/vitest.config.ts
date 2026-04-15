/// <reference types="vitest" />
//  // / <reference types="vite/client" />

import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [ vue(), typescript() ],
  test: {
    globals: true,
    include: [
      "src/test/vitest/*.vitest.ts",
      "src/test/vitest/*.vitest.jsx",
      "src/test/vitest/*.vitest.mjs",
    ],
    exclude:[
      "src/test/**/*.stories.*",
    ],
    typecheck: {
      include: ["src/test/vitest/*.vitest.*", ],
      exclude: [ "src/**/*.stories.*", ],
    },
// Copilot says these two lines should disable the checking, which is not useful
// they don't work.
//	sourcemap: false,
//  sourcemap: "inline",
    environment: "jsdom",
    bail: 0,
    watch: false,
    coverage: {
      provider: 'v8' // or 'istanbul'
    },

    // https://github.com/vitest-dev/vitest/discussions/9246
    reporters: [
      "default",
      {
        onProcessTimeout() {
          process.exitCode = 127;
        },
      },
    ],
   globalSetup: "./src/test/vitest.setup.ts",

  },
  optimizeDeps:{
     exclude:[
      "src/test/**/*.stories.*",
    ],
  },
  css:true,
  browser: { enabled: true, name: "/snap/bin/chromium" },
});
// can create own runner if needed
// https://main.vitest.dev/guide/advanced/
//
// vim: syn=typescript nospell

