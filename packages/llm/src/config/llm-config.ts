export type LlmConfigInput = {
  model?: string;
  topK?: number;
  timeoutMs?: number;
  batchSize?: number;
  temperature?: number;
  maxTokens?: number;
  vectorProvider?: 'local' | 'pinecone' | 'qdrant';
};

export type LlmConfigSnapshot = {
  model: string;
  topK: number;
  timeoutMs: number;
  batchSize: number;
  temperature: number;
  maxTokens: number;
  vectorProvider: 'local' | 'pinecone' | 'qdrant';
};

const DEFAULTS: LlmConfigSnapshot = {
  model: 'openai/gpt-4o-mini',
  topK: 5,
  timeoutMs: 30_000,
  batchSize: 10,
  temperature: 0.2,
  maxTokens: 1024,
  vectorProvider: 'local',
};

const ENV_PREFIX = 'LANDMAP_LLM_';

type EnvSource = Record<string, string | undefined>;

function readEnv(env: EnvSource = process.env): Partial<LlmConfigSnapshot> {
  const rawProvider = env[`${ENV_PREFIX}VECTOR_PROVIDER`];
  const vectorProvider =
    rawProvider === 'local' || rawProvider === 'pinecone' || rawProvider === 'qdrant'
      ? rawProvider
      : undefined;

  const result: Partial<LlmConfigSnapshot> = {};

  const model = env[`${ENV_PREFIX}MODEL`];
  if (model) result.model = model;

  const topK = env[`${ENV_PREFIX}TOP_K`];
  if (topK) {
    const n = Number(topK);
    if (Number.isFinite(n)) result.topK = n;
  }

  const timeoutMs = env[`${ENV_PREFIX}TIMEOUT_MS`];
  if (timeoutMs) {
    const n = Number(timeoutMs);
    if (Number.isFinite(n)) result.timeoutMs = n;
  }

  const batchSize = env[`${ENV_PREFIX}BATCH_SIZE`];
  if (batchSize) {
    const n = Number(batchSize);
    if (Number.isFinite(n)) result.batchSize = n;
  }

  const temperature = env[`${ENV_PREFIX}TEMPERATURE`];
  if (temperature) {
    const n = Number(temperature);
    if (Number.isFinite(n)) result.temperature = n;
  }

  const maxTokens = env[`${ENV_PREFIX}MAX_TOKENS`];
  if (maxTokens) {
    const n = Number(maxTokens);
    if (Number.isFinite(n)) result.maxTokens = n;
  }

  if (vectorProvider) result.vectorProvider = vectorProvider;

  return result;
}

function validate(input: Partial<LlmConfigSnapshot>): LlmConfigSnapshot {
  const snapshot = { ...DEFAULTS, ...input } as LlmConfigSnapshot;
  const errors: string[] = [];

  if (!snapshot.model || typeof snapshot.model !== 'string' || snapshot.model.trim().length === 0) {
    errors.push('model must be a non-empty string');
  }

  if (!Number.isFinite(snapshot.topK) || snapshot.topK <= 0) {
    errors.push('topK must be a positive finite number');
  }

  if (!Number.isFinite(snapshot.timeoutMs) || snapshot.timeoutMs <= 0) {
    errors.push('timeoutMs must be a positive finite number');
  }

  if (!Number.isFinite(snapshot.batchSize) || snapshot.batchSize <= 0) {
    errors.push('batchSize must be a positive finite number');
  }

  if (!Number.isFinite(snapshot.temperature) || snapshot.temperature < 0 || snapshot.temperature > 2) {
    errors.push('temperature must be between 0 and 2');
  }

  if (!Number.isFinite(snapshot.maxTokens) || snapshot.maxTokens <= 0) {
    errors.push('maxTokens must be a positive finite number');
  }

  if (
    snapshot.vectorProvider !== 'local' &&
    snapshot.vectorProvider !== 'pinecone' &&
    snapshot.vectorProvider !== 'qdrant'
  ) {
    errors.push(`vectorProvider must be one of: local, pinecone, qdrant`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid LLM config: ${errors.join('; ')}`);
  }

  return snapshot;
}

let cached: LlmConfigSnapshot | null = null;

export function resetLlmConfigCache() {
  cached = null;
}

export function loadLlmConfig(overrides?: LlmConfigInput): LlmConfigSnapshot {
  const envValues = readEnv();
  const merged = { ...DEFAULTS, ...envValues } as LlmConfigSnapshot;
  Object.assign(merged, overrides);
  cached = validate(merged);
  return cached;
}

export function getLlmConfig(): LlmConfigSnapshot {
  if (!cached) {
    cached = validate({ ...DEFAULTS, ...readEnv() });
  }
  return cached;
}

export function llmConfigGetters(snapshot: LlmConfigSnapshot = getLlmConfig()) {
  return {
    model: () => snapshot.model,
    topK: () => snapshot.topK,
    timeoutMs: () => snapshot.timeoutMs,
    batchSize: () => snapshot.batchSize,
    temperature: () => snapshot.temperature,
    maxTokens: () => snapshot.maxTokens,
    vectorProvider: () => snapshot.vectorProvider,
  };
}
