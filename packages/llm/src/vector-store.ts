import { Document } from '@langchain/core/documents';
import { tokenize } from './rag.js';

/* ------------------------------------------------------------------ */
/*  TF-IDF helpers (inline, based on rag.ts)                           */
/* ------------------------------------------------------------------ */

function tf(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
  const len = tokens.length || 1;
  return Object.fromEntries(
    Object.entries(freq).map(([k, v]) => [k, v / len])
  ) as Record<string, number>;
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (const k of Object.keys(a)) {
    if (b[k]) ab += a[k] * b[k];
    aa += a[k] * a[k];
    bb += (b[k] || 0) * (b[k] || 0);
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}

/* ------------------------------------------------------------------ */
/*  SimpleVectorStore                                                  */
/* ------------------------------------------------------------------ */

export interface VectorStoreResult {
  document: Document;
  score: number;
}

export class SimpleVectorStore {
  private docs: Document[] = [];
  private tfVectors: Map<string, Record<string, number>> = new Map();

  get documentCount(): number {
    return this.docs.length;
  }

  addDocuments(documents: Document[]): void {
    for (const doc of documents) {
      this.docs.push(doc);
      const tokens = tokenize(doc.pageContent);
      this.tfVectors.set(doc.id ?? this.docs.length.toString(), tf(tokens));
    }
  }

  similaritySearch(query: string, topK = 3): VectorStoreResult[] {
    const qTokens = tokenize(query);
    const qVec = tf(qTokens);

    const scored: VectorStoreResult[] = [];

    for (let i = 0; i < this.docs.length; i++) {
      const doc = this.docs[i];
      const docId = doc.id ?? i.toString();
      const docVec = this.tfVectors.get(docId);
      if (!docVec) continue;

      const sim = cosine(qVec, docVec);
      scored.push({ document: doc, score: sim });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}
