/// <reference types="vitest" />
//  // / <reference types="vite/client" />

import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  plugins: [typescript()],
  test: {
    globals: true,
    include: ["src/test/*.vitest.ts", "src/test/*.vitest.mjs"],
    exclude: [],
    typecheck: {
      include: ["src/test/*.vitest.*"],
      exclude: ["node_modules/"],
      enabled: false,
    },
    environment: "node",
    bail: 0,
    // vitest docs solution to sourcemap spam
    watch: null,
    server: { watch: null },
    isolate: false,

    coverage: {
      provider: "v8", // or 'istanbul'
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
    // 'Bot solution to souremap spam
    //  deps: {
    //      optimizer: {
    //        web: {
    //          enabled: false,
    //        },
    //      },
    //    },
  },
  // Bot part2, after claiming vitest uses vite, its setting for esbuild
  //  esbuild: {
  //    tsconfigRaw: {
  //      compilerOptions: {
  //        composite: false,
  //        incremental: false,
  //        tsBuildInfoFile: null,
  //      },
  //    },
  //  },

  css: false,
  browser: { enabled: false, name: "/snap/bin/chromium" },
});
// can create own runner if needed
// https://main.vitest.dev/guide/advanced/
//
// vim: syn=typescript nospell
