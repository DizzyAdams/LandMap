import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import type { Document } from '@langchain/core/documents';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function createModel(modelName?: string) {
  const apiKey = process.env.LANDMAP_LLM_KEY;
  if (!apiKey) throw new Error('LANDMAP_LLM_KEY env var not set');

  return new ChatOpenAI({
    model: modelName ?? DEFAULT_MODEL,
    configuration: { baseURL: OPENROUTER_BASE_URL },
    apiKey,
  });
}

/* ------------------------------------------------------------------ */
/*  RetrievalQAChain                                                   */
/* ------------------------------------------------------------------ */

/**
 * RetrievalQAChain — answer a question based on chunks of text.
 *
 * @param query   The user question.
 * @param chunks  Text chunks to use as context.
 * @returns       The model's answer as a string.
 */
export async function retrievalQaChain(
  query: string,
  chunks: string[],
): Promise<string> {
  const model = createModel();

  const prompt = PromptTemplate.fromTemplate(
    `You are a real-estate assistant. Answer the query based on the provided context.
If the context does not contain enough information, say so.

Context:
{context}

Query:
{query}

Answer:`,
  );

  const chain = RunnableSequence.from([
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return chain.invoke({
    context: chunks.join('\n\n---\n\n'),
    query,
  });
}

/* ------------------------------------------------------------------ */
/*  DocumentQaChain — same but accepts Document[]                      */
/* ------------------------------------------------------------------ */

/**
 * DocumentQaChain — answer a question from a list of LangChain Document objects.
 */
export async function documentQaChain(
  query: string,
  documents: Document[],
): Promise<string> {
  const texts = documents.map((d) => d.pageContent);
  return retrievalQaChain(query, texts);
}

/* ------------------------------------------------------------------ */
/*  Market report chain                                               */
/* ------------------------------------------------------------------ */

export type MarketStats = {
  total?: number;
  avgPrice?: number;
  medianPrice?: number;
  avgPricePerSqm?: number;
  cities?: Array<{ city: string; state: string; count: number; avgPrice: number }>;
  byType?: Record<string, number>;
  byModality?: Record<string, number>;
};

/**
 * Pure builder for the market-report prompt. Kept side-effect free so it can
 * be unit tested without any LLM call.
 */
export function buildMarketReportPrompt(query: string, stats: MarketStats): string {
  const topCities = (stats.cities ?? [])
    .slice(0, 5)
    .map((c) => `${c.city}/${c.state} (${c.count})`)
    .join(', ');

  return [
    `Mercado: ${query}`,
    `Total de imóveis: ${stats.total ?? 'n/d'}`,
    `Preço médio: ${stats.avgPrice ?? 'n/d'}`,
    `Preço/m² médio: ${stats.avgPricePerSqm ?? 'n/d'}`,
    `Principais cidades: ${topCities || 'n/d'}`,
    '',
    'Gere um relatório de mercado em português (pt-BR), com 3 parágrafos:',
    '1) Visão geral, 2) Oportunidades, 3) Recomendação para investidores.',
  ].join('\n');
}

/** Turn raw market stats into a narrative report via LangChain. */
export async function marketReportChain(
  query: string,
  stats: MarketStats,
  model?: string,
): Promise<string> {
  const prompt = buildMarketReportPrompt(query, stats);
  return retrievalQaChain(query, [prompt]);
}

/* ------------------------------------------------------------------ */
/*  Summarization chain                                               */
/* ------------------------------------------------------------------ */

export function buildSummarizePrompt(text: string, maxSentences = 3): string {
  return `Resuma o texto abaixo em no máximo ${maxSentences} frases, em português (pt-BR).\n\nTexto:\n${text}`;
}

/** Condense a long document into a short summary via LangChain. */
export async function summarizeChain(text: string, maxSentences = 3, model?: string): Promise<string> {
  const model_ = createModel(model);
  const prompt = PromptTemplate.fromTemplate(`{input}`);
  const chain = RunnableSequence.from([prompt, model_, new StringOutputParser()]);
  return chain.invoke({ input: buildSummarizePrompt(text, maxSentences) });
}

