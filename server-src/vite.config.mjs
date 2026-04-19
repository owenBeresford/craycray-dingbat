import { defineConfig } from 'vite';
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { builtinModules } from 'node:module';

import terser from "@rollup/plugin-terser";
// import typescript from "@rollup/plugin-typescript"
import { getGlobals } from 'common-es';
const { __dirname, __filename } = getGlobals(import.meta.url);
import ts from 'vite-plugin-ts';
// import vue from '@vitejs/plugin-vue';
// maybe try '@vitejs/plugin-vue-jsx' when have those files

let mode='development';
if(process.env && process.env.NODE_ENV) {
	mode=process.env.NODE_ENV;
}
let ofn="";
if(mode!="production") {
	ofn="api-test";
} else {
	ofn="api";
}
// src: https://stackoverflow.com/questions/69523560/using-vite-for-backend
const NODE_BUILT_IN_MODULES = builtinModules.filter(m => !m.startsWith('_'));
NODE_BUILT_IN_MODULES.push(...NODE_BUILT_IN_MODULES.map(m => `node:${m}`));


// https://vitejs.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
//	plugins: [ts(), vue() ],
//	plugins: [typescript(), vue() ],
	plugins: [ ts() ],
	root: __dirname,
	server: {
      hmr: false
	},
    optimizeDeps: {
        exclude: NODE_BUILT_IN_MODULES,
    },
	 define: {
	    _LOGGING_: process.env.NODE_ENV !== "production",
  	},
	build: {
    outDir: path.resolve(__dirname, '../dist'),
	copyPublicDir:false,
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "api",
      fileName: (format) => `${ofn}.${format}.mjs`,
    },
    minify: "terser",
    target: "es2022",
	watch:false,	
    rollupOptions: {
      plugins: [terser({})],
      external: NODE_BUILT_IN_MODULES, 
		cache:false,
      output: [
        {
          format: "es",
			name: `${ofn}`,
        },
      ],
    },
    test: {
 	   environment: "node",
    },
  },
});

// vim: syn=javascript nospell
