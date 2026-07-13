import { afterEach, vi } from 'vitest';

// Setup global de testes do @landmap/llm.
// Os specs rodam em environment 'node' e exercitam código puro + mocks de
// fetch/OpenAI via vi.stubGlobal/vi.stubEnv. Garantimos aqui que o estado de
// stubs e mocks nunca vaza entre testes.
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
