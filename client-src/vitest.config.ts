/// <reference types="vitest" />
//  // / <reference types="vite/client" />

import { configDefaults, defineConfig, UserConfig } from "vitest/config";
import typescript from "@rollup/plugin-typescript";
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [ vue(), typescript()],
  test: {
    globals: true,
    include: [
      "src/test/*.vitest.ts",
      "src/test/*.vitest.jsx",
      "src/test/*.vitest.js",
      "src/test/*.vitest.mjs",
    ],
    environment: "jsdom",
    bail: 0,
    watch: false,
  },
  css:true,
  browser: { enabled: true, name: "/snap/bin/chromium" },
});

// vim: syn=typescript nospell

