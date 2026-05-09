import { defineConfig } from "vite";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from "node:module";

import terser from "@rollup/plugin-terser";
// import typescript from "@rollup/plugin-typescript"
import { getGlobals } from "common-es";
const { __dirname, __filename } = getGlobals(import.meta.url);
import ts from "vite-plugin-ts";
// import vue from '@vitejs/plugin-vue';
// maybe try '@vitejs/plugin-vue-jsx' when have those files

let mode = "development";
if (process.env && process.env.NODE_ENV) {
  mode = process.env.NODE_ENV;
}
let ofn = "";
if (mode != "production") {
  ofn = "api-test";
} else {
  ofn = "api";
}

// https://vitejs.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
  //	plugins: [ts(), vue() ],
  //	plugins: [typescript(), vue() ],
  plugins: [ts()],
  root: __dirname,
  server: {
    hmr: false,
  },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      "@grpc/proto-loader",
      "@nestjs/microservices",
      "@nestjs/serve-static",
      "@nestjs/platform-express",
      "class-transformer",
      "class-validator",
      "@fastify/static",
    ],
    disabled: true,
  },
  define: {
    _LOGGING_: process.env.NODE_ENV !== "production",
  },
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    copyPublicDir: false,
    ssr: path.resolve(__dirname, "src/main.ts"),
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "api",
      fileName: (format) => `${ofn}.${format}.mjs`,
    },
    minify: "terser",
    target: "node20",
    watch: false,
    rollupOptions: {
      plugins: [terser({})],
      external: {
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      },
      cache: false,
      output: [
        {
          format: "esm",
          //		name: `${ofn}`,
          entryFileNames: "main.mjs",
        },
      ],
    },
    test: {
      environment: "node",
    },
  },
});

// vim: syn=javascript nospell
