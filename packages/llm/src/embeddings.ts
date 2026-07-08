/* ------------------------------------------------------------------ */
/*  Embeddings provider abstraction                                     */
/* ------------------------------------------------------------------ */

export type EmbeddingVector = number[];

export interface EmbeddingProvider {
  name: string;
  embed(texts: string[]): Promise<EmbeddingVector[]>;
  dimension(): number;
}

/* ------------------------------------------------------------------ */
/*  TF-IDF based embeddings (no external dependency)                    */
/* ------------------------------------------------------------------ */

const STOP = new Set([
  'de', 'do', 'da', 'dos', 'das', 'em', 'para', 'com', 'por',
  'um', 'uma', 'uns', 'umas', 'no', 'na', 'nos', 'nas',
  'ao', 'aos', 'à', 'às', 'e', 'ou', 'que', 'se',
  'nao', 'não', 'é', 'como', 'mais', 'menos', 'tem', 'entre',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9]+/gi, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w));
}

function tf(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const len = tokens.length || 1;
  return Object.fromEntries(
    Object.entries(freq).map(([k, v]) => [k, v / len]),
  ) as Record<string, number>;
}

export class TFIDFEmbeddingProvider implements EmbeddingProvider {
  name = 'tfidf';
  private _dimension = 768;

  dimension() {
    return this._dimension;
  }

  async embed(texts: string[]): Promise<EmbeddingVector[]> {
    // Build document frequency across all texts
    const allTokens = texts.map((t) => tokenize(t));
    const df: Record<string, number> = {};
    const idf: Record<string, number> = {};

    for (const tokens of allTokens) {
      const seen = new Set(tokens);
      for (const t of Array.from(seen)) {
        df[t] = (df[t] || 0) + 1;
      }
    }

    const N = texts.length || 1;
    for (const [term, count] of Object.entries(df)) {
      idf[term] = Math.log((N + 1) / ((count || 0) + 1)) + 1;
    }

    // Build vectors
    return allTokens.map((tokens) => {
      const tfVec = tf(tokens);
      const vec: number[] = [];
      // Fixed-length vector: use top terms by IDF variance
      const terms = Object.entries(idf)
        .sort((a, b) => b[1] - a[1])
        .slice(0, this._dimension)
        .map(([t]) => t);

      for (const term of terms) {
        vec.push((tfVec[term] || 0) * (idf[term] || 0));
      }

      // Pad with zeros if needed
      while (vec.length < this._dimension) vec.push(0);
      return vec.slice(0, this._dimension);
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Cosine similarity for dense vectors                                 */
/* ------------------------------------------------------------------ */

export function cosineSimilarity(a: number[], b: number[]): number {
  let ab = 0,
    aa = 0,
    bb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    ab += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}
