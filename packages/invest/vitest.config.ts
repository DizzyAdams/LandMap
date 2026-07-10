import { defineConfig } from 'vitest/config';

// Config local do pacote (isolado). A engine é pura (sem DOM/React),
// então usamos environment 'node'. Roda com:
//   pnpm --filter @landmap/invest test
// Também é coberto pelo `pnpm test` raiz (vitest raiz).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    pool: 'forks',
  },
});
