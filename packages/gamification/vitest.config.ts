import { defineConfig } from 'vitest/config';

// Config local do pacote (isolado). A engine é pura (sem DOM),
// entáo usamos environment 'node'. Roda com:
//   pnpm --filter @landmap/gamification test
// Continua coberto pelo `pnpm test` raiz (vitest.config.ts raiz).
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
  },
});
