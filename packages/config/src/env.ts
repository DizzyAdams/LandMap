export const env = {
  apiBaseUrl: process.env.LANDMAP_API_BASE_URL ?? process.env.NEXT_PUBLIC_LANDMAP_API_URL ?? 'http://localhost:4000',
  llmProvider: process.env.LANDMAP_LLM_PROVIDER ?? 'openrouter',
  appEnv: process.env.NODE_ENV ?? 'development',
  appUrl: process.env.LANDMAP_APP_URL ?? process.env.NEXT_PUBLIC_LANDMAP_APP_URL ?? 'http://localhost:3000',
  cacheTtlMs: Number(process.env.LANDMAP_CACHE_TTL_MS) || 300_000,
  llmModel: process.env.LANDMAP_LLM_MODEL ?? 'gpt-4o',
};
