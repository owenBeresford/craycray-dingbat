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
if(mode!="production") {
	ofn="worker1-test";
} else {
	ofn="worker1";
}


// https://vitejs.dev/config/
export default defineConfig({
	plugins: [ vue() ],
	server: {
      hmr: false
	},
    define: {
	    _LOGGING_: process.env.NODE_ENV !== "production",
  	},
	build: {
    lib: {
      entry: path.resolve(__dirname, "src/workers/StateSyncing.ts"),
      name: "worker1",
      fileName: (format) => `${ofn}.${format}.mjs`,
    },
	emptyOutDir:false,
    minify: "terser",
    target: "es2022",
	watch:false,	
    rollupOptions: {
      plugins: [ terser({}) ],
      external: [],
      output: [
        {
			name: `${ofn}`,
          format: "es",
 //     		entryFileName: (format) => `${ofn}.${format}.mjs`,
        },
      ],
    },

  },
});

// vim: syn=javascript nospell
