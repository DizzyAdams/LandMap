/* ------------------------------------------------------------------ */
/*  Thin tools: one action per tool, no side effects                    */
/* ------------------------------------------------------------------ */

import type { Chunk } from '../rag.js';
import {
  retrieve,
  chunkText,
  ingestDocuments,
} from '../rag.js';
import {
  buildMarkdownChunks,
  searchLocalRag,
} from '../hints.js';
import type { LlmMessage } from '../types.js';
import { chatCompletion } from '../completion.js';
import { TFIDFEmbeddingProvider, cosineSimilarity } from '../embeddings.js';

/* ------------------------------------------------------------------ */
/*  Ingestion tools                                                    */
/* ------------------------------------------------------------------ */

export type IngestDirectoryInput = {
  /** Directory path to scan for markdown files. */
  dir: string;
  /** Optional namespace prefix for source paths. */
  namespace?: string;
};

export type IngestDirectoryOutput = {
  /** Files successfully processed. */
  files: string[];
  /** Total chunks produced. */
  totalChunks: number;
};

export async function ingestDirectoryTool(
  input: IngestDirectoryInput,
): Promise<{ ok: boolean; result: IngestDirectoryOutput; error?: string }> {
  try {
    const { existsSync, readdirSync } = await import('fs');
    const { join } = await import('path');

    const resolved = join(process.cwd(), '..', '..', input.dir);

    if (!existsSync(resolved)) {
      return { ok: false, result: { files: [], totalChunks: 0 }, error: `Directory not found: ${resolved}` };
    }

    const files = readdirSync(resolved).filter((f: string) => f.endsWith('.md'));
    const chunks = ingestDocuments();

    return {
      ok: true,
      result: {
        files: files.map((f: string) => join(resolved, f)),
        totalChunks: chunks.length,
      },
    };
  } catch (e: any) {
    return { ok: false, result: { files: [], totalChunks: 0 }, error: e?.message ?? String(e) };
  }
}

export type SearchSimilarInput = {
  /** Query text to search against the local RAG index. */
  query: string;
  /** Max number of results to return (default: 3). */
  topK?: number;
};

export type SearchSimilarOutput = {
  query: string;
  results: Array<{ id: string; text: string; score: number }>;
};

export async function searchSimilarTool(
  input: SearchSimilarInput,
): Promise<{ ok: boolean; result: SearchSimilarOutput; error?: string }> {
  try {
    const chunks = ingestDocuments();
    const results = retrieve(input.query, chunks, input.topK ?? 3);

    return {
      ok: true,
      result: {
        query: input.query,
        results: results.map((r) => ({
          id: r.chunk.id,
          text: r.chunk.text,
          score: Math.round(r.score * 1000) / 1000,
        })),
      },
    };
  } catch (e: any) {
    return { ok: false, result: { query: input.query, results: [] }, error: e?.message ?? String(e) };
  }
}

export type BuildMarkdownChunksInput = {
  /** Array of markdown documents to chunk. */
  markdowns: Array<{ id: string; content: string; metadata?: Record<string, string> }>;
  /** Optional chunk window in words (default: 220). */
  window?: number;
  /** Optional overlap in words (default: 60). */
  overlap?: number;
};

export type BuildMarkdownChunksOutput = {
  chunks: Array<{ id: string; title: string; text: string; tokens: number }>;
  totalChunks: number;
};

export async function buildMarkdownChunksTool(
  input: BuildMarkdownChunksInput,
): Promise<{ ok: boolean; result: BuildMarkdownChunksOutput; error?: string }> {
  try {
    const chunks: any[] = [];
    for (const md of input.markdowns) {
      const title = (md.content.match(/^#\s+(.+)$/m)?.[1] ?? md.id).trim();
      const parsed = chunkText({ path: md.id, title, text: md.content });
      chunks.push(...parsed.map((c) => ({ ...c, metadata: { ...(md.metadata ?? {}), title } })));
    }

    return {
      ok: true,
      result: {
        chunks: chunks.map((c) => ({
          id: c.id,
          title: c.title,
          text: c.text,
          tokens: c.tokens,
        })),
        totalChunks: chunks.length,
      },
    };
  } catch (e: any) {
    return { ok: false, result: { chunks: [], totalChunks: 0 }, error: e?.message ?? String(e) };
  }
}

/** Load persisted embeddings index from disk (best-effort, empty on failure). */
export function loadPersistedIndexTool<T = any>(): { ok: boolean; result: T[]; error?: string } {
  try {
    const { existsSync, readFileSync } = require('fs');
    const { join } = require('path');

    const INDEX_FILE = join(process.cwd(), '..', '..', 'data', 'landmap', 'embeddings-index.json');

    if (!existsSync(INDEX_FILE)) {
      return { ok: true, result: [] };
    }

    const raw = readFileSync(INDEX_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    return { ok: true, result: Array.isArray(parsed) ? parsed : [parsed] };
  } catch (e: any) {
    return { ok: false, result: [], error: e?.message ?? String(e) };
  }
}

/* ------------------------------------------------------------------ */
/*  Market analysis tools                                             */
/* ------------------------------------------------------------------ */

export type AnalyzeMarketInput = {
  /** Array of properties to analyze. */
  properties: Array<{
    id: string;
    title: string;
    city: string;
    state: string;
    type: string;
    modality: string;
    price: number;
    areaM2: number;
    bedrooms?: number;
    neighborhood?: string;
    zone?: string;
    status?: string;
    tags?: string[];
  }>;
};

export type AnalyzeMarketOutput = {
  avgPriceM2: number;
  hotTypes: string[];
  priceTrend: 'rising' | 'stable' | 'falling';
  demandScore: number; // 0-100
  recommendation: string;
  summary: string;
};

export async function analyzeMarketTool(
  input: AnalyzeMarketInput,
): Promise<{ ok: boolean; result: AnalyzeMarketOutput; error?: string }> {
  try {
    if (input.properties.length === 0) {
      return {
        ok: false,
        result: {
          avgPriceM2: 0,
          hotTypes: [],
          priceTrend: 'stable',
          demandScore: 0,
          recommendation: 'No data provided.',
          summary: 'Empty property list.',
        },
        error: 'No properties to analyze',
      };
    }

    const totalArea = input.properties.reduce((s, p) => s + p.areaM2, 0);
    const avgPriceM2 = totalArea > 0
      ? Math.round(input.properties.reduce((s, p) => s + p.price / p.areaM2, 0) / input.properties.length)
      : 0;

    const byType: Record<string, { count: number; totalPrice: number; totalArea: number }> = {};
    for (const p of input.properties) {
      if (!byType[p.type]) byType[p.type] = { count: 0, totalPrice: 0, totalArea: 0 };
      byType[p.type].count++;
      byType[p.type].totalPrice += p.price;
      byType[p.type].totalArea += p.areaM2;
    }

    const typeStats = Object.entries(byType)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        avgPriceM2: stats.totalArea > 0 ? Math.round(stats.totalPrice / stats.totalArea) : 0,
      }))
      .sort((a, b) => b.avgPriceM2 - a.avgPriceM2);

    const hotTypes = typeStats.slice(0, 3).map((t) => t.type);

    const prices = input.properties.map((p) => p.price);
    const half = Math.ceil(prices.length / 2);
    const firstHalfAvg = prices.slice(0, half).reduce((s, v) => s + v, 0) / (half || 1);
    const secondHalfAvg = prices.slice(half).reduce((s, v) => s + v, 0) / ((prices.length - half) || 1);

    let priceTrend: AnalyzeMarketOutput['priceTrend'] = 'stable';
    const diff = secondHalfAvg - firstHalfAvg;
    if (diff > firstHalfAvg * 0.1) priceTrend = 'rising';
    else if (diff < -firstHalfAvg * 0.1) priceTrend = 'falling';

    const cities = Array.from(new Set(input.properties.map((p) => p.city)));
    const types = Array.from(new Set(input.properties.map((p) => p.type)));

    const { content } = await chatCompletion(
      [
        {
          role: 'system',
          content: `You are a Brazilian real estate market analyst. Given property data, return a JSON object (no markdown) with:
- "recommendation": short strategic recommendation (max 200 chars)
- "summary": short market summary (max 300 chars)
- "demandScore": number 0-100`,
        },
        {
          role: 'user',
          content: `Market data:
- Cities: ${cities.join(', ')}
- Types: ${types.join(', ')}
- Avg price/m²: R$ ${avgPriceM2}
- Hot types: ${hotTypes.join(', ')}
- Trend: ${priceTrend}
- Total analyzed: ${input.properties.length}
- Avg price: R$ ${Math.round(prices.reduce((s, v) => s + v, 0) / (prices.length || 1))}`,
        },
      ],
    );

    let llmResult: { recommendation: string; summary: string; demandScore: number } | null = null;
    try {
      llmResult = JSON.parse(content);
    } catch {
      // fallback below
    }

    return {
      ok: true,
      result: {
        avgPriceM2,
        hotTypes,
        priceTrend,
        demandScore: llmResult?.demandScore ?? Math.round((input.properties.length / 50) * 100),
        recommendation: llmResult?.recommendation ?? 'Mercado com oportunidades.',
        summary: llmResult?.summary ?? `Analysis of ${input.properties.length} properties in ${cities.join(', ')}. Avg price/m²: R$ ${avgPriceM2}.`,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: {
        avgPriceM2: 0,
        hotTypes: [],
        priceTrend: 'stable',
        demandScore: 0,
        recommendation: 'Error analyzing market.',
        summary: '',
      },
      error: e?.message ?? String(e),
    };
  }
}

export type ScoreLeadInput = {
  /** Lead profile to score. */
  lead: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    interest?: string;
    budget?: { min?: number; max?: number };
    source?: string;
    engagementCount?: number;
  };
  /** Property chunks or texts for matching. */
  propertyTexts: string[];
};

export type ScoreLeadOutput = {
  id: string;
  score: number; // 0-100
  breakdown: {
    budgetFit: number;       // 0-40
    interestRelevance: number; // 0-30
    engagementRecency: number; // 0-20
    sourceQuality: number;    // 0-10
  };
};

export async function scoreLeadTool(
  input: ScoreLeadInput,
): Promise<{ ok: boolean; result: ScoreLeadOutput; error?: string }> {
  try {
    const lead = input.lead;
    const chunks: Chunk[] = input.propertyTexts.map((text, idx) => ({
      id: `${lead.id}_prop_${idx}`,
      path: `prop_${idx}`,
      title: `Property ${idx + 1}`,
      text,
      tokens: text.split(/\s+/).filter(Boolean).length,
    }));

    // Budget fit 0-40
    let budgetFit = 20;
    if (lead.budget) {
      const min = lead.budget.min ?? 0;
      const max = lead.budget.max ?? Infinity;
      const priceMatch = chunks.map((c) => c.text.match(/[Rr$]\s*[\d.\s,]+/)).filter(Boolean) as RegExpMatchArray[];
      if (priceMatch.length > 0) {
        const prices = priceMatch.map((m) => {
          const cleaned = m[0].replace(/[Rr$\s]/g, '').replace(',', '.');
          const val = parseFloat(cleaned);
          return Number.isFinite(val) ? val : 0;
        });
        const inBudget = prices.filter((p) => p >= min && p <= max).length;
        budgetFit = Math.round((inBudget / (prices.length || 1)) * 40);
      }
    }

    // Interest relevance 0-30
    let interestRelevance = 15;
    if (lead.interest && chunks.length > 0) {
      const query = `${lead.interest} ${lead.city ?? ''} ${lead.state ?? ''}`.trim();
      const results = retrieve(query, chunks, 5);
      if (results.length > 0) {
        const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
        interestRelevance = Math.round(avg * 30);
      }
    }

    // Engagement 0-20
    const engagementCount = lead.engagementCount ?? 0;
    const engagementRecency = engagementCount <= 0
      ? 0
      : Math.min(20, Math.round(Math.log10(engagementCount + 1) * 15));

    // Source quality 0-10
    const sourceWeights: Record<string, number> = {
      referral: 10,
      organic: 8,
      campaign: 6,
      social: 5,
      cold_email: 3,
      unknown: 3,
    };
    const sourceQuality = sourceWeights[(lead.source ?? 'unknown').toLowerCase()] ?? 3;

    const score = Math.min(100, budgetFit + interestRelevance + engagementRecency + sourceQuality);

    return {
      ok: true,
      result: {
        id: lead.id,
        score,
        breakdown: {
          budgetFit,
          interestRelevance,
          engagementRecency,
          sourceQuality,
        },
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: {
        id: input.lead.id,
        score: 0,
        breakdown: { budgetFit: 0, interestRelevance: 0, engagementRecency: 0, sourceQuality: 0 },
      },
      error: e?.message ?? String(e),
    };
  }
}

export type MatchPropertiesInput = {
  /** Prospect wishlist. */
  prospect: {
    id: string;
    name?: string;
    city?: string;
    state?: string;
    wishlist: string;
    maxBudget?: number;
    minArea?: number;
    types?: Array<'apartamento' | 'casa' | 'terreno' | 'comercial'>;
  };
  /** Property texts. */
  propertyTexts: string[];
  /** Max matches (default: 5). */
  topN?: number;
};

export type MatchPropertiesOutput = {
  prospectId: string;
  matches: Array<{
    propertyId: string;
    score: number;
    rationale: string;
  }>;
};

export async function matchPropertiesTool(
  input: MatchPropertiesInput,
): Promise<{ ok: boolean; result: MatchPropertiesOutput; error?: string }> {
  try {
    const chunks: Chunk[] = input.propertyTexts.map((text, idx) => ({
      id: `prop_${idx}`,
      path: `prop_${idx}`,
      title: `Property ${idx + 1}`,
      text,
      tokens: text.split(/\s+/).filter(Boolean).length,
    }));

    const query = [input.prospect.wishlist, input.prospect.city, input.prospect.state].filter(Boolean).join(' ');
    const candidates = retrieve(query, chunks, (input.topN ?? 5) * 3);

    const filtered = candidates.filter((c) => {
      const text = c.chunk.text;
      if (input.prospect.maxBudget !== undefined) {
        const priceMatch = text.match(/[Rr$]\s*([\d.,\s]+)/);
        if (priceMatch) {
          const cleaned = priceMatch[1].replace(/[.\s]/g, '').replace(',', '.');
          const val = parseFloat(cleaned);
          if (Number.isFinite(val) && val > input.prospect.maxBudget!) return false;
        }
      }
      if (input.prospect.minArea !== undefined) {
        const areaMatch = text.match(/(\d+[\s.,]?\d*)\s*m²/);
        if (areaMatch) {
          const val = parseFloat(areaMatch[1].replace(',', '.'));
          if (Number.isFinite(val) && val < input.prospect.minArea!) return false;
        }
      }
      return true;
    });

    const scored = filtered
      .map((c) => {
        const semanticScore = c.score;
        let budgetScore = 0.5;
        let areaScore = 0.5;

        const text = c.chunk.text;
        if (input.prospect.maxBudget !== undefined) {
          const priceMatch = text.match(/[Rr$]\s*([\d.,\s]+)/);
          if (priceMatch) {
            const cleaned = priceMatch[1].replace(/[.\s]/g, '').replace(',', '.');
            const val = parseFloat(cleaned);
            if (Number.isFinite(val)) {
              budgetScore = val <= input.prospect.maxBudget! * 0.8 ? 1 : val <= input.prospect.maxBudget! ? 0.5 : 0;
            }
          }
        }
        if (input.prospect.minArea !== undefined) {
          const areaMatch = text.match(/(\d+[\s.,]?\d*)\s*m²/);
          if (areaMatch) {
            const val = parseFloat(areaMatch[1].replace(',', '.'));
            if (Number.isFinite(val)) {
              areaScore = val >= input.prospect.minArea! * 1.2 ? 1 : val >= input.prospect.minArea! ? 0.6 : 0;
            }
          }
        }

        const composite = semanticScore * 0.5 + budgetScore * 0.3 + areaScore * 0.2;
        const score = Math.min(100, Math.round(composite * 100));
        const rationale = score >= 80
          ? 'Alta compatibilidade com o perfil.'
          : score >= 50
            ? 'Compatibilidade moderada.'
            : 'Compatibilidade baixa.';

        return { propertyId: c.chunk.id, score, rationale };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, input.topN ?? 5);

    return {
      ok: true,
      result: {
        prospectId: input.prospect.id,
        matches: scored,
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: { prospectId: input.prospect.id, matches: [] },
      error: e?.message ?? String(e),
    };
  }
}

export type GenerateDescriptionInput = {
  /** Property fields for description generation. */
  property: {
    title: string;
    city: string;
    state: string;
    type: string;
    modality: string;
    price: number;
    areaM2: number;
    bedrooms?: number;
    neighborhood?: string;
    zone?: string;
    tags?: string[];
  };
};

export type GenerateDescriptionOutput = {
  description: string;
};

export async function generateDescriptionTool(
  input: GenerateDescriptionInput,
): Promise<{ ok: boolean; result: GenerateDescriptionOutput; error?: string }> {
  try {
    const { content } = await chatCompletion(
      [
        {
          role: 'system',
          content: `You are a real estate copywriter. Generate a concise, appealing property description in Portuguese (Brazil). Return only plain text, max 300 characters.`,
        },
        {
          role: 'user',
          content: `Gerar descrição para:
- Título: ${input.property.title}
- Localização: ${input.property.neighborhood ?? ''} ${input.property.city}/${input.property.state} - zona ${input.property.zone ?? ''}
- Tipo: ${input.property.type} | Modalidade: ${input.property.modality}
- Preço: R$ ${input.property.price}
- Área: ${input.property.areaM2} m²
- Quartos: ${input.property.bedrooms ?? 'não informado'}
- Tags: ${(input.property.tags ?? []).join(', ')}`,
        },
      ],
    );

    return {
      ok: true,
      result: {
        description: content.trim().slice(0, 300),
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: { description: '' },
      error: e?.message ?? String(e),
    };
  }
}

export type PredictPriceInput = {
  /** Property features for price prediction. */
  property: {
    city: string;
    state: string;
    type: string;
    modality: string;
    areaM2: number;
    bedrooms?: number;
    neighborhood?: string;
  };
  /** Recent comparable property texts for heuristic estimation. */
  comparables: string[];
};

export type PredictPriceOutput = {
  predictedPrice: number;
  confidence: number; // 0-1
  basis: string;
};

export async function predictPriceTool(
  input: PredictPriceInput,
): Promise<{ ok: boolean; result: PredictPriceOutput; error?: string }> {
  try {
    const prices: number[] = [];
    for (const text of input.comparables) {
      const match = text.match(/[Rr$]\s*([\d.,\s]+)/);
      if (!match) continue;
      const cleaned = match[1].replace(/[.\s]/g, '').replace(',', '.');
      const val = parseFloat(cleaned);
      if (Number.isFinite(val) && val > 0) prices.push(val);
    }

    const avg = prices.length > 0
      ? Math.round(prices.reduce((s, v) => s + v, 0) / prices.length)
      : Math.round(input.property.areaM2 * 8_000);

    const variance = prices.length > 1
      ? Math.sqrt(prices.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / prices.length) / (avg || 1)
      : 0.6;

    const confidence = Number.isFinite(variance) ? Math.max(0.2, Math.min(0.95, 1 - variance)) : 0.4;

    return {
      ok: true,
      result: {
        predictedPrice: avg,
        confidence: Math.round(confidence * 100) / 100,
        basis: prices.length > 0 ? 'comparable_average' : 'area_estimate',
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: { predictedPrice: 0, confidence: 0, basis: 'error' },
      error: e?.message ?? String(e),
    };
  }
}

export type SuggestionsInput = {
  /** Search context for suggestions. */
  query: string;
  /** Optional filters to constrain suggestions. */
  filters?: { city?: string; state?: string; type?: string };
};

export type SuggestionsOutput = {
  suggestions: string[];
};

export async function suggestionsTool(
  input: SuggestionsInput,
): Promise<{ ok: boolean; result: SuggestionsOutput; error?: string }> {
  try {
    const { content } = await chatCompletion(
      [
        {
          role: 'system',
          content: `You are a real estate search assistant. Generate exactly 5 concise search suggestions based on the user's query and optional filters. Respond as a JSON array of strings (no markdown).`,
        },
        {
          role: 'user',
          content: `Query: ${input.query}
Filters: ${JSON.stringify(input.filters ?? {})}`,
        },
      ],
    );

    let parsed: string[] = [];
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = content
        .split('\n')
        .map((s) => s.replace(/^[-•\s]+/, '').trim())
        .filter((s) => s.length > 0)
        .slice(0, 5);
    }

    return {
      ok: true,
      result: {
        suggestions: Array.isArray(parsed)
          ? parsed.slice(0, 5)
          : [content.slice(0, 100)],
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: { suggestions: [] },
      error: e?.message ?? String(e),
    };
  }
}

/* ------------------------------------------------------------------ */
/*  RAG tools                                                         */
/* ------------------------------------------------------------------ */

export type RagRetrieveInput = {
  /** Query to retrieve against the local RAG index. */
  query: string;
  /** Max results (default: 3). */
  topK?: number;
};

export type RagRetrieveOutput = {
  query: string;
  results: Array<{ id: string; text: string; score: number }>;
};

export async function ragRetrieveTool(
  input: RagRetrieveInput,
): Promise<{ ok: boolean; result: RagRetrieveOutput; error?: string }> {
  try {
    const chunks = ingestDocuments();
    const results = retrieve(input.query, chunks, input.topK ?? 3);

    return {
      ok: true,
      result: {
        query: input.query,
        results: results.map((r) => ({
          id: r.chunk.id,
          text: r.chunk.text,
          score: Math.round(r.score * 1000) / 1000,
        })),
      },
    };
  } catch (e: any) {
    return {
      ok: false,
      result: { query: input.query, results: [] },
      error: e?.message ?? String(e),
    };
  }
}

export type RagBuildIndexInput = {
  /** Source directory to ingest. */
  dir: string;
  /** Optional namespace. */
  namespace?: string;
};

export type RagBuildIndexOutput = {
  totalFiles: number;
  totalChunks: number;
};

export async function ragBuildIndexTool(
  input: RagBuildIndexInput,
): Promise<{ ok: boolean; result: RagBuildIndexOutput; error?: string }> {
  const toolResult = await ingestDirectoryTool({ dir: input.dir, namespace: input.namespace });
  if (!toolResult.ok) {
    return { ok: false, result: { totalFiles: 0, totalChunks: 0 }, error: toolResult.error };
  }

  return {
    ok: true,
    result: {
      totalFiles: toolResult.result.files.length,
      totalChunks: toolResult.result.totalChunks,
    },
  };
}

export type RagHealthOutput = {
  indexExists: boolean;
  totalEntries: number;
};

export function ragHealthTool(): { ok: boolean; result: RagHealthOutput; error?: string } {
  const persisted = loadPersistedIndexTool<any[]>();
  if (!persisted.ok) {
    return { ok: false, result: { indexExists: false, totalEntries: 0 }, error: persisted.error };
  }

  return {
    ok: true,
    result: {
      indexExists: persisted.result.length > 0,
      totalEntries: persisted.result.length,
    },
  };
}
