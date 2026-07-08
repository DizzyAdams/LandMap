/* ------------------------------------------------------------------ */
/*  Pinecone-backed embeddings provider (SKELETON / DISABLED BY DEFAULT) */
/*  This file is a non-breaking alternative to TFIDFEmbeddingProvider.  */
/* ------------------------------------------------------------------ */

import type { EmbeddingProvider, EmbeddingVector } from '../embeddings.js';

/**
 * @remarks
 * - Alternativa desativada por padrão.
 * - Ativar apenas se:
 *   1. PINECONE_API_KEY estiver definida em ambiente;
 *   2. O cluster Pinecone aceitar embeddings compatíveis com as fontes
 *      usadas por `TFIDFEmbeddingProvider` (priorize `all-minilm`/OpenAI-style).
 * - Mantém a compatibilidade com a interface `EmbeddingProvider` existente.
 */

export type PineconeProviderOptions = {
  /** Pinecone API key. */
  apiKey: string;
  /** Index name or host. */
  index: string;
  /** Embedding model name (for OpenAI-compatible deployments). */
  model?: string;
  /** Enable provider (false by default). */
  enabled?: boolean;
};

/**
 * Skeleton implementation. No network calls happen unless `enabled` is true.
 */
export function createPineconeEmbeddingProvider(
  options: PineconeProviderOptions,
): EmbeddingProvider | null {
  if (!options.enabled || !options.apiKey || !options.index) {
    return null;
  }

  // If you want to enable this route, uncomment the following imports in the
  // actual implementation:
  // import OpenAI from 'openai';
  // import { Pinecone } from '@pinecone-database/pinecone';

  const model = options.model ?? 'text-embedding-3-small';

  // NOTE: this is intentionally non-functional — it returns the call
  // signature required by EmbeddingProvider without actually calling Pinecone.
  return {
    name: 'pinecone-skeleton',

    async embed(texts: string[]): Promise<EmbeddingVector[]> {
      // If activation is needed, use OpenAI/Pinecone here.
      return texts.map(() => []);
    },

    dimension(): number {
      return 768; // safe fallback aligned with TF-IDF default
    },
  } satisfies EmbeddingProvider;
}
