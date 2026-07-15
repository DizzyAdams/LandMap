import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    // Match Next.js automatic JSX runtime so app components (which do not
    // import React) compile correctly under vitest/esbuild.
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
