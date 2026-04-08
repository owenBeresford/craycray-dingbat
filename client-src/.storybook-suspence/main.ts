import { mergeConfig } from "vite";
import type { StorybookConfig } from "@storybook/vue3-vite";

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config: StorybookConfig = {
//  stories: ["../src/test/*.mdx", "../src/test/*.stories.@(js|jsx|mjs|ts|tsx)", "../src/stories/*.stories.*"],
  stories: [ "../src/test/storybook-suspence/*.stories.@(mjs|ts|tsx)", ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
  ],
  framework: "@storybook/vue3-vite",
  viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          vue: import("vue"),
        },
      },
    });
  },
};

export default config;
