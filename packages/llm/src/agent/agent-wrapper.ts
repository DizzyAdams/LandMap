/* ------------------------------------------------------------------ */
/*  Lightweight LangChain/legacy agent wrapper                         */
/* ------------------------------------------------------------------ */

import type { LlmMessage } from '../types.js';
import { chatCompletion } from '../completion.js';
import type {
  IngestDirectoryInput,
  IngestDirectoryOutput,
  SearchSimilarInput,
  SearchSimilarOutput,
  BuildMarkdownChunksInput,
  BuildMarkdownChunksOutput,
  AnalyzeMarketInput,
  AnalyzeMarketOutput,
  ScoreLeadInput,
  ScoreLeadOutput,
  MatchPropertiesInput,
  MatchPropertiesOutput,
  GenerateDescriptionInput,
  GenerateDescriptionOutput,
  PredictPriceInput,
  PredictPriceOutput,
  SuggestionsInput,
  SuggestionsOutput,
  RagRetrieveInput,
  RagRetrieveOutput,
  RagBuildIndexInput,
  RagBuildIndexOutput,
} from '../tools/index.js';

export type {
  IngestDirectoryInput,
  IngestDirectoryOutput,
  SearchSimilarInput,
  SearchSimilarOutput,
  BuildMarkdownChunksInput,
  BuildMarkdownChunksOutput,
  AnalyzeMarketInput,
  AnalyzeMarketOutput,
  ScoreLeadInput,
  ScoreLeadOutput,
  MatchPropertiesInput,
  MatchPropertiesOutput,
  GenerateDescriptionInput,
  GenerateDescriptionOutput,
  PredictPriceInput,
  PredictPriceOutput,
  SuggestionsInput,
  SuggestionsOutput,
  RagRetrieveInput,
  RagRetrieveOutput,
  RagBuildIndexInput,
  RagBuildIndexOutput,
};

import {
  ingestDirectoryTool,
  searchSimilarTool,
  loadPersistedIndexTool,
  buildMarkdownChunksTool,
  analyzeMarketTool,
  scoreLeadTool,
  matchPropertiesTool,
  generateDescriptionTool,
  predictPriceTool,
  suggestionsTool,
  ragRetrieveTool,
  ragBuildIndexTool,
  ragHealthTool,
} from '../tools/index.js';

export type ToolName =
  | 'ingestDirectory'
  | 'searchSimilar'
  | 'loadPersistedIndex'
  | 'buildMarkdownChunks'
  | 'analyzeMarket'
  | 'scoreLead'
  | 'matchProperties'
  | 'generateDescription'
  | 'predictPrice'
  | 'suggestions'
  | 'ragRetrieve'
  | 'ragBuildIndex'
  | 'ragHealth';

export type ToolCall = {
  name: ToolName;
  input: any;
};

export type AgentEnvelope<T = any> = {
  ok: boolean;
  result: T;
  error?: string;
};

type ToolRegistry = {
  [K in ToolName]: (...args: any[]) => Promise<any> | any;
};

const toolRegistry: ToolRegistry = {
  ingestDirectory: ingestDirectoryTool,
  searchSimilar: searchSimilarTool,
  loadPersistedIndex: loadPersistedIndexTool,
  buildMarkdownChunks: buildMarkdownChunksTool,
  analyzeMarket: analyzeMarketTool,
  scoreLead: scoreLeadTool,
  matchProperties: matchPropertiesTool,
  generateDescription: generateDescriptionTool,
  predictPrice: predictPriceTool,
  suggestions: suggestionsTool,
  ragRetrieve: ragRetrieveTool,
  ragBuildIndex: ragBuildIndexTool,
  ragHealth: ragHealthTool,
};

/**
 * Execute a single tool call and wrap the response into a structured envelope {ok, result, error}.
 */
export async function runTool<K extends ToolName>(
  tool: K,
  input: Parameters<ToolRegistry[K]>[0],
): Promise<AgentEnvelope<Awaited<ReturnType<ToolRegistry[K]>>>> {
  const start = Date.now();
  try {
    const fn = toolRegistry[tool];
    if (!fn) {
      return { ok: false, result: undefined as any, error: `Unknown tool: ${tool}` };
    }

    const raw = await (fn as any)(input);
    const durationMs = Date.now() - start;

    if (typeof raw === 'object' && raw !== null && 'ok' in raw) {
      const cast = raw as { ok: boolean; result: any; error?: string };
      return {
        ok: !!cast.ok,
        result: cast.result,
        error: cast.error,
        ...(cast.ok ? {} : { _durationMs: durationMs }),
      } as any;
    }

    return { ok: true, result: raw };
  } catch (e: any) {
    return {
      ok: false,
      result: undefined as any,
      error: e?.message ?? String(e),
    };
  }
}

/**
 * Run an array of tools sequentially, grouping outputs by request envelope.
 */
export async function runAgentTools(
  calls: ToolCall[],
): Promise<{ outputs: AgentEnvelope[]; aggregated: Record<string, any> }> {
  const outputs: AgentEnvelope[] = [];

  for (const call of calls) {
    const out = await runTool(call.name, call.input);
    outputs.push(out);
  }

  const aggregated: Record<string, any> = {};
  for (let i = 0; i < outputs.length; i++) {
    aggregated[`${calls[i]?.name ?? 'unknown'}_${i}`] = outputs[i];
  }

  return { outputs, aggregated };
}

/**
 * Small LangChain-compatible dispatcher: given a user message, decide whether
 * to run a tool or fall back to chatCompletion. This is intentionally thin;
 * it does not implement graph/plan orchestration.
 */
export type AgentDispatchInput = {
  /** Plain user prompt/request. */
  messages: LlmMessage[];
  /** Optional forced tool. */
  tool?: ToolName;
  /** Optional input to the forced tool. */
  toolInput?: any;
};

export type AgentDispatchOutput = {
  usedTool: string | null;
  envelopes: AgentEnvelope[];
  reply?: string;
};

export async function dispatchAgentWorkflow(
  input: AgentDispatchInput,
): Promise<AgentDispatchOutput> {
  const toolsToRun: ToolCall[] = [];

  if (input.tool && input.toolInput !== undefined) {
    toolsToRun.push({ name: input.tool, input: input.toolInput });
  } else {
    const { content } = await chatCompletion(input.messages);
    toolsToRun.push({ name: 'ragRetrieve', input: { query: content, topK: 3 } });
  }

  const { outputs } = await runAgentTools(toolsToRun);

  return {
    usedTool: input.tool ?? toolsToRun[0]?.name ?? null,
    envelopes: outputs,
  };
}
