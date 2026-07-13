import { defineConfig } from 'vitest/config';

// Config local do pacote (isolado). O código é puro (sem DOM/React) e os
// specs exercitam apenas src/** com mocks de fetch/OpenAI, então usamos
// environment 'node'. Roda com:
//   pnpm --filter @landmap/llm test
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['__tests__/**/*.spec.ts'],
    pool: 'forks',
  },
});
