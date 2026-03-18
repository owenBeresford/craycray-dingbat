import { defineConfig } from 'vite';
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import terser from "@rollup/plugin-terser";
// import typescript from "@rollup/plugin-typescript"
import { getGlobals } from 'common-es';
const { __dirname, __filename } = getGlobals(import.meta.url);
// import ts from 'vite-plugin-ts';
import vue from '@vitejs/plugin-vue';

let mode='development';
if(process.env && process.env.NODE_ENV) {
	mode=process.env.NODE_ENV;
}
let ofn="";
if(mode==="development") {
	ofn="shopping-test";
} else {
	ofn="shopping";
}

// https://vitejs.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
//	plugins: [ts(), vue() ],
//	plugins: [typescript(), vue() ],
	plugins: [ vue() ],
	root: __dirname+ '/public',
	server: {
      hmr: false
	},
	build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "shopping-gui",
      fileName: (format) => `${ofn}.${format}.mjs`,
    },
    minify: "terser",
    target: "es2022",
    rollupOptions: {
      plugins: [terser({})],
      external: [],
      output: [
        {
          format: "es",
      		entryFileName: (format) => `${ofn}.${format}.mjs`,
        },
      ],
    },
    test: {
 	   environment: "node",
    },
  },
});

// vim: syn=javascript nospell
