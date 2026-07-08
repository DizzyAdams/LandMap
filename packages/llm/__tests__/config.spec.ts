import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  loadLlmConfig,
  getLlmConfig,
  resetLlmConfigCache,
  llmConfigGetters,
} from '../src/config/llm-config';

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  resetLlmConfigCache();
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe('llm-config', () => {
  it('returns defaults when no env is set and no overrides are provided', () => {
    const config = getLlmConfig();
    expect(config.model).toBe('openai/gpt-4o-mini');
    expect(config.topK).toBe(5);
    expect(config.timeoutMs).toBe(30_000);
    expect(config.batchSize).toBe(10);
    expect(config.temperature).toBe(0.2);
    expect(config.maxTokens).toBe(1024);
    expect(config.vectorProvider).toBe('local');
  });

  it('loads env overrides using LANDMAP_LLM_* variables', () => {
    process.env.LANDMAP_LLM_MODEL = 'mistral/mistral-7b';
    process.env.LANDMAP_LLM_TOP_K = '10';
    process.env.LANDMAP_LLM_TIMEOUT_MS = '5000';

    const config = loadLlmConfig();

    expect(config.model).toBe('mistral/mistral-7b');
    expect(config.topK).toBe(10);
    expect(config.timeoutMs).toBe(5000);
  });

  it('overrides can replace both defaults and env values', () => {
    process.env.LANDMAP_LLM_MODEL = 'env-model';

    const config = loadLlmConfig({ model: 'override-model', topK: 3 });

    expect(config.model).toBe('override-model');
    expect(config.topK).toBe(3);
  });

  it('validates invalid temperature by throwing', () => {
    expect(() => loadLlmConfig({ temperature: 5 })).toThrow('Invalid LLM config');
  });

  it('validates invalid vectorProvider by throwing', () => {
    expect(() => loadLlmConfig({ vectorProvider: 'unknown' } as any)).toThrow('Invalid LLM config');
  });

  it('reset clears cache and next call reloads', () => {
    loadLlmConfig({ model: 'model-a' });
    resetLlmConfigCache();
    const config = loadLlmConfig({ model: 'model-b' });
    expect(config.model).toBe('model-b');
  });

  it('llmConfigGetters returns getters bound to the provided snapshot', () => {
    const config = loadLlmConfig({ temperature: 0.77 });
    const getters = llmConfigGetters(config);

    expect(getters.temperature()).toBe(0.77);
    expect(getters.model()).toBe('openai/gpt-4o-mini');
  });

  it('gets values from env when readEnv values are passed directly', () => {
    process.env.LANDMAP_LLM_MAX_TOKENS = '2048';

    const config = loadLlmConfig();

    expect(config.maxTokens).toBe(2048);
  });
});
