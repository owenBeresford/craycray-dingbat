import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";
import type { InlineConfig } from "vite";
import fs from "fs";

const path = await import("node:path");
const URL = await import("node:url");
const __dirname = path.dirname(URL.fileURLToPath(import.meta.url));
const __filename = path.basename(URL.fileURLToPath(import.meta.url));

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config: StorybookConfig = {
  //  stories: ["../src/test/*.mdx", "../src/test/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/stories/*.stories.*"],
  stories: ["../src/test/storybook-suspence/*.stories.@(mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {}, // how to set options...
  },
  async viteFinal(config: InlineConfig, { configType }): Promise<InlineConfig> {
    return mergeConfig(config, {
      build: {
        chunkSizeWarningLimit: 4128,
      },
      resolve: {
        alias: {
          vue: await import("vue"),
        },
      },

      server: {
        // I prefer to get fresh source via <ctrl-F5>, as a change will often edit several files
        hmr: false,
        https: true,
        strictPort: true,
        // these seem to be to be set on the CLI.   #leSigh.
        // --ssl-cert ./src/assets/cert.pem --ssl-key ./src/assets/private.key
      },
      resolve: {
        alias: {
          vue: await import("vue"),
        },
      },
    });
  },
};

export default config;
// vim: nospell
