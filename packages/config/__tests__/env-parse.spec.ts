import { describe, it, expect, vi } from 'vitest';

/**
 * `env` is computed once at module load, so each case here reloads the module
 * with a controlled process.env and restores it afterwards. This keeps the
 * existing env.spec.ts (which relies on the default env) unaffected.
 */
function withEnv(
  overrides: Record<string, string | undefined>,
  fn: () => Promise<void>,
): Promise<void> {
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(overrides)) saved[key] = process.env[key];
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return fn().finally(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

async function loadEnv() {
  vi.resetModules();
  const mod = await import('../src/env');
  return mod.env;
}

describe('packages/config — env parsing', () => {
  it('prefers LANDMAP_API_BASE_URL over NEXT_PUBLIC_LANDMAP_API_URL', async () => {
    await withEnv(
      { LANDMAP_API_BASE_URL: 'https://api.landmap.dev', NEXT_PUBLIC_LANDMAP_API_URL: 'https://fallback' },
      async () => {
        const env = await loadEnv();
        expect(env.apiBaseUrl).toBe('https://api.landmap.dev');
      },
    );
  });

  it('falls back to NEXT_PUBLIC_LANDMAP_API_URL when the primary is missing', async () => {
    await withEnv(
      { LANDMAP_API_BASE_URL: undefined, NEXT_PUBLIC_LANDMAP_API_URL: 'https://next' },
      async () => {
        const env = await loadEnv();
        expect(env.apiBaseUrl).toBe('https://next');
      },
    );
  });

  it('defaults apiBaseUrl to localhost when neither var is set', async () => {
    await withEnv({ LANDMAP_API_BASE_URL: undefined, NEXT_PUBLIC_LANDMAP_API_URL: undefined }, async () => {
      const env = await loadEnv();
      expect(env.apiBaseUrl).toBe('http://localhost:4000');
    });
  });

  it('applies LANDMAP_LLM_PROVIDER and LANDMAP_LLM_MODEL overrides', async () => {
    await withEnv({ LANDMAP_LLM_PROVIDER: 'anthropic', LANDMAP_LLM_MODEL: 'claude-3' }, async () => {
      const env = await loadEnv();
      expect(env.llmProvider).toBe('anthropic');
      expect(env.llmModel).toBe('claude-3');
    });
  });

  it('defaults llmProvider to openrouter and llmModel to gpt-4o', async () => {
    await withEnv({ LANDMAP_LLM_PROVIDER: undefined, LANDMAP_LLM_MODEL: undefined }, async () => {
      const env = await loadEnv();
      expect(env.llmProvider).toBe('openrouter');
      expect(env.llmModel).toBe('gpt-4o');
    });
  });

  it('prefers LANDMAP_APP_URL for appUrl and falls back to NEXT_PUBLIC_*', async () => {
    await withEnv(
      { LANDMAP_APP_URL: 'https://app.landmap.dev', NEXT_PUBLIC_LANDMAP_APP_URL: 'https://nextapp' },
      async () => {
        const env = await loadEnv();
        expect(env.appUrl).toBe('https://app.landmap.dev');
      },
    );
    await withEnv({ LANDMAP_APP_URL: undefined, NEXT_PUBLIC_LANDMAP_APP_URL: 'https://nextapp' }, async () => {
      const env = await loadEnv();
      expect(env.appUrl).toBe('https://nextapp');
    });
  });

  it('defaults appEnv to development when NODE_ENV is unset', async () => {
    await withEnv({ NODE_ENV: undefined }, async () => {
      const env = await loadEnv();
      expect(env.appEnv).toBe('development');
    });
  });

  it('parses LANDMAP_CACHE_TTL_MS as a positive integer', async () => {
    await withEnv({ LANDMAP_CACHE_TTL_MS: '120000' }, async () => {
      const env = await loadEnv();
      expect(env.cacheTtlMs).toBe(120000);
    });
  });

  it('falls back to 300000 when LANDMAP_CACHE_TTL_MS is missing or invalid', async () => {
    await withEnv({ LANDMAP_CACHE_TTL_MS: undefined }, async () => {
      const env = await loadEnv();
      expect(env.cacheTtlMs).toBe(300_000);
    });
    await withEnv({ LANDMAP_CACHE_TTL_MS: 'not-a-number' }, async () => {
      const env = await loadEnv();
      expect(env.cacheTtlMs).toBe(300_000);
    });
    await withEnv({ LANDMAP_CACHE_TTL_MS: '0' }, async () => {
      const env = await loadEnv();
      expect(env.cacheTtlMs).toBe(300_000);
    });
  });
});
