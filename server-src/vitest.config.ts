/// <reference types="vitest" />
//  // / <reference types="vite/client" />

import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  plugins: [  typescript() ],
  test: {
    globals: true,
    include: [
      "src/test/*.vitest.ts",
      "src/test/*.vitest.mjs",
    ],
    exclude:[  ],
    typecheck: {
      include: [ "src/test/*.vitest.*", ],
      exclude: [ ],
    },
    environment: "node",
    bail: 0,
//watch: null,
//server:{ watch:null },
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

  },
  css:false,
  browser: { enabled: false, name: "/snap/bin/chromium" },
});
// can create own runner if needed
// https://main.vitest.dev/guide/advanced/
//
// vim: syn=typescript nospell

