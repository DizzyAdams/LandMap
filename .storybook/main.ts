import path from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/react-vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../apps/web/stories/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: '@storybook/react-vite',
  // Resolve @landmap/ui to its TypeScript source (no prebuild needed).
  viteFinal: async (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      '@landmap/ui': path.resolve(__dirname, '../packages/ui/src/index.ts'),
    };
    return cfg;
  },
};

export default config;
