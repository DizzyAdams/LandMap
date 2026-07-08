import type { LlmMessage, SegmentationOutput, AnalyzeResult, TextChunk } from './types.js';
import { inMemoryIndex, retrieve } from './rag.js';

export type CompletionResponse = {
  content: string;
  model: string;
  tokens: number;
};

/**
 * Deterministic offline fallback used when no LANDMAP_LLM_KEY is configured
 * (or LANDMAP_LLM_MOCK=1). Produces a useful, stable answer so the entire
 * agent + workflow surface keeps working in demos and on serverless without
 * any external API dependency.
 */
export function mockCompletion(
  messages: LlmMessage[],
  model?: string,
): CompletionResponse {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText = (lastUser?.content ?? '').replace(/\s+/g, ' ').trim();
  const snippet = userText.slice(0, 160);

  const content = [
    '(modo demo · sem chave de LLM configurada)',
    `Solicitação registrada: ${snippet || 'vazia'}.`,
    'Configure LANDMAP_LLM_KEY para respostas geradas por modelo de linguagem.',
  ].join(' ');

  return { content, model: model ?? 'mock', tokens: 0 };
}

export async function chatCompletion(
  messages: LlmMessage[],
  model?: string,
): Promise<CompletionResponse> {
  const key = process.env.LANDMAP_LLM_KEY;

  // Demo / offline mode: return a deterministic, useful mock so the whole
  // agent + workflow surface works on Vercel without any API key configured.
  if (!key || process.env.LANDMAP_LLM_MOCK === '1') {
    return mockCompletion(messages, model);
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model ?? 'openai/gpt-4o-mini',
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${text}`);
  }

  const json = await res.json() as {
    choices: Array<{ message: { content: string } }>;
    model: string;
    usage: { total_tokens: number };
  };

  return {
    content: json.choices[0]?.message?.content ?? '',
    model: json.model,
    tokens: json.usage?.total_tokens ?? 0,
  };
}

export async function analyzeIntent(query: string): Promise<SegmentationOutput> {
  const { content } = await chatCompletion([
    {
      role: 'system',
      content: `You are an intent analyzer for a real-estate portal. Given a user query, extract search intent and filters.

Respond with a valid JSON object (no markdown) with these keys:
- "intent": "search" | "filter_only" | "general"
- "filters": { "city"?: string, "state"?: string, "type"?: string, "modality"?: string, "q"?: string }
- "answerHint"?: string (optional short hint for the user)

If the query is about searching properties, intent should be "search".
If it is just filtering or browsing, use "filter_only".
Otherwise use "general".`,
    },
    { role: 'user', content: query },
  ]);

  try {
    return JSON.parse(content) as SegmentationOutput;
  } catch {
    return {
      intent: 'general',
      filters: {},
      answerHint: content.slice(0, 200),
    };
  }
}

export type Property = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  type?: string;
  modality?: string;
  description?: string;
};

export async function recommendProperties(
  query: string,
  properties: Property[],
): Promise<AnalyzeResult> {
  const chunks: TextChunk[] = properties.map((p) => ({
    id: p.id,
    text: `${p.title} - ${p.city}/${p.state} - ${p.type ?? ''} - ${p.modality ?? ''} - ${p.description ?? ''}`,
    metadata: { title: p.title, city: p.city, state: p.state },
  }));

  const topChunks = retrieve(query, chunks.map((c) => ({
    id: c.id,
    path: c.id,
    title: c.metadata.title,
    text: c.text,
    tokens: c.text.split(/\s+/).filter(Boolean).length,
  })));

  const context = topChunks
    .map((r) => `- ${r.chunk.title} (${r.chunk.path})`)
    .join('\n');

  const { content } = await chatCompletion([
    {
      role: 'system',
      content: `You are a real-estate recommendation assistant. Based on the query and the most relevant properties, recommend the best matches and explain why.

Respond with a valid JSON object (no markdown) with these keys:
- "answer": string (your recommendation explanation)
- "candidates": array of { "id": string, "score": number } sorted by relevance descending`,
    },
    {
      role: 'user',
      content: `Query: ${query}\n\nRelevant properties:\n${context}`,
    },
  ]);

  try {
    return JSON.parse(content) as AnalyzeResult;
  } catch {
    return {
      answer: content,
      candidates: topChunks.map((r) => ({ id: r.chunk.id, score: r.score })),
    };
  }
}
