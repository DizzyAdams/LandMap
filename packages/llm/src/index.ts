export {
  retrieve,
} from './rag.js';
export {
  buildMarkdownChunks,
  searchLocalRag,
} from './hints.js';

/* ---- Ingestion ---- */
export {
  ingestSource,
  ingestDirectory,
  loadPersistedIndex,
  searchSimilar,
} from './ingestion.js';
export type {
  IngestionSource,
  IngestionResult,
} from './ingestion.js';

/* ---- Bilingual RAG ---- */
export {
  detectLanguage,
  bilingualChunk,
  MixedLanguageIndex,
} from './bilingual.js';
export type {
  SupportedLocale,
  BilingualChunk,
  BilingualChunkOptions,
  MixedLanguageDoc,
} from './bilingual.js';

/* ---- PgVector store ---- */
export {
  PgVectorStore,
} from './vector/pgvector-store.js';
export type {
  PgPoolLike,
  PgVectorDoc,
  PgVectorSearchResult,
  PgVectorStoreOptions,
} from './vector/pgvector-store.js';

/* ---- KPI engine ---- */
export {
  computeMarketKpis,
  kpisToFeatures,
  applyRulers,
  applyRuler,
} from './kpi/index.js';
export type {
  Property,
  MarketKpis,
  MarketFeatures,
  CityAggregate,
  RulerScore,
  RulerName,
} from './kpi/index.js';
export {
  LeadScorerAgent,
} from './agents/LeadScorerAgent.js';
export {
  CopywriterAgent,
} from './agents/CopywriterAgent.js';
export type {
  PropertyForCopy,
  CopyResult,
} from './agents/CopywriterAgent.js';
export {
  PropertyMatcherAgent,
} from './agents/PropertyMatcherAgent.js';
export {
  MarketAnalyzerAgent,
} from './agents/MarketAnalyzerAgent.js';
export {
  SegmentationOutput,
  RerankCandidate,
  AnalyzeResult,
  LlmMessage,
  AnalyzeInput,
  TextChunk,
  RetrievalResult,
} from './types.js';
export type {
  LeadProfile,
  ScoredLead,
  ScorerContext,
} from './agents/LeadScorerAgent.js';
export type {
  ProspectProfile,
  MatchResult,
  MatcherContext,
} from './agents/PropertyMatcherAgent.js';

/* ---- Config ---- */
export {
  loadLlmConfig,
  getLlmConfig,
  resetLlmConfigCache,
  llmConfigGetters,
} from './config/llm-config.js';
export type {
  LlmConfigInput,
  LlmConfigSnapshot,
} from './config/llm-config.js';

/* ---- Runtime ---- */
export {
  runHealthChecks,
  setCorrelationId,
  getCorrelationId,
} from './runtime/healthcheck.js';
export type {
  HealthCheck,
  HealthCheckEnvelope,
} from './runtime/healthcheck.js';
export {
  LandmapLlmError,
  invalidConfigError,
  llmServiceError,
  vectorServiceError,
  pipelineError,
  isLandmapLlmError,
} from './runtime/errors.js';
export {
  logger,
  setLogLevel,
  setLogCorrelationId,
  setLogSink,
} from './runtime/logger.js';

/* ---- LangChain ---- */
export {
  retrievalQaChain,
  documentQaChain,
  marketReportChain,
  summarizeChain,
  buildMarketReportPrompt,
  buildSummarizePrompt,
} from './langchain/chain.js';
export type { MarketStats } from './langchain/chain.js';

/* ---- LangGraph ---- */
export {
  propertyMatchingGraph,
  runPropertyMatchingGraph,
} from './langgraph/workflow.js';
export type {
  PropertyRecord,
  GraphInput,
  GraphOutput,
} from './langgraph/workflow.js';

/* ---- LangFlow-style workflow registry ---- */
export {
  listWorkflows,
  getWorkflowDefinition,
  runWorkflowById,
} from './langflow/registry.js';
export type {
  WorkflowDefinition,
  WorkflowCategory,
} from './langflow/registry.js';

/* ---- Vector Store ---- */
export {
  SimpleVectorStore,
} from './vector-store.js';
export type {
  VectorStoreResult,
} from './vector-store.js';

/* ---- Generators ---- */
export {
  generatePropertyDescription,
} from './generators/description.js';
export type {
  PropertyForDescription,
} from './generators/description.js';

export {
  SimplePricePredictor,
} from './generators/price-predictor.js';
export type {
  TrainingProperty,
  PredictionInput,
  PredictionResult,
} from './generators/price-predictor.js';

export {
  generateSearchSuggestions,
} from './generators/suggestions.js';
export type {
  SearchSuggestion,
  SuggestionsResult,
} from './generators/suggestions.js';
