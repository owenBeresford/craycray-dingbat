import { defineConfig } from 'vite';
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import terser from "@rollup/plugin-terser";
// import typescript from "@rollup/plugin-typescript"
import { getGlobals } from 'common-es';
const { __dirname, __filename } = getGlobals(import.meta.url);
// import ts from 'vite-plugin-ts';
import vue from '@vitejs/plugin-vue';
// maybe try '@vitejs/plugin-vue-jsx' when have those files

let mode='development';
if(process.env && process.env.NODE_ENV) {
	mode=process.env.NODE_ENV;
}
let ofn="";
if(mode!="production") {
	ofn="shopping-test";
} else {
	ofn="shopping";
}

// https://vitejs.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
	base: "/",
	plugins: [ vue() ],
	server: {
      hmr: false
	},
	 define: {
	    _LOGGING_: process.env.NODE_ENV !== "production",
  	},
	build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      fileName: (format) => `${ofn}.${format}.mjs`,
    },
    sourcemap:true,
	emptyOutDir:true,
    minify: "terser",
    target: "es2022",
	watch:false,	
    rollupOptions: {
      plugins: [terser({})],
      external: [],
		cache:false,
      output: [
        {
          format: "es",
			name: `${ofn}`,
//      		entryFileName: (format) => `${ofn}.${format}.mjs`,
        },
      ],
    },
    test: {
 	   environment: "node",
    },
  },
});

// vim: syn=javascript nospell
