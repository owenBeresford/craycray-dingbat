/// <reference types="vitest" />
/// <reference types="vite/client" />

import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue(), typescript()],
  test: {
    globals: true,
    include: ["src/test/vitest/*.vitest.ts", "src/test/vitest/*.vitest.jsx", "src/test/vitest/*.vitest.mjs"],
    exclude: ["src/test/**/*.stories.*"],
    typecheck: {
      include: ["src/test/vitest/*.vitest.*"],
      exclude: ["src/**/*.stories.*"],
    },
    environment: "jsdom",
    bail: 0,
    watch: false,
    coverage: {
      provider: "v8", // or 'istanbul'
    },
    environmentOptions: {
      jsdom: { // IOIO XX FIXME change later if IP changes
        url: "https://app.hiss:3001/"
      }
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
  optimizeDeps: {
    exclude: ["src/test/**/*.stories.*"],
  },
  css: true,
  browser: { enabled: true, name: "/snap/bin/chromium" },
});
// can create own runner if needed
// https://main.vitest.dev/guide/advanced/
//
// vim: syn=typescript nospell
