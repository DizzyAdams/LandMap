/* ------------------------------------------------------------------ */
/*  Bilingual chunking (pt-BR / en-US / es-ES)                         */
/* ------------------------------------------------------------------ */

export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES';

/**
 * Lightweight, dependency-free language detection.
 *
 * We score the text against locale-specific function words / stopwords and
 * pick the highest-scoring locale. This is intentionally simple (no model
 * needed) and good enough to tag chunks for a mixed-language retrieval index.
 */
const LOCALE_STOPWORDS: Record<SupportedLocale, string[]> = {
  'pt-BR': [
    'de', 'do', 'da', 'dos', 'das', 'em', 'para', 'com', 'por', 'um', 'uma',
    'uns', 'umas', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'e', 'ou', 'que',
    'se', 'nao', 'não', 'como', 'mais', 'menos', 'tem', 'entre', 'você',
    'imovel', 'imóvel', 'casa', 'apartamento', 'venda', 'aluguel', 'rua',
  ],
  'en-US': [
    'the', 'a', 'an', 'of', 'to', 'in', 'for', 'with', 'on', 'and', 'or',
    'that', 'this', 'is', 'are', 'you', 'your', 'we', 'our', 'house',
    'apartment', 'sale', 'rent', 'street', 'property', 'home', 'price',
  ],
  'es-ES': [
    'de', 'la', 'el', 'los', 'las', 'en', 'para', 'con', 'por', 'un', 'una',
    'unos', 'unas', 'y', 'o', 'que', 'se', 'no', 'como', 'mas', 'menos',
    'tiene', 'casa', 'apartamento', 'venta', 'alquiler', 'calle', 'propiedad',
  ],
};

const SENTENCE_SPLIT = /(?<=[.!?…])\s+/u;

export function detectLanguage(text: string): SupportedLocale {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-zà-ÿ0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return 'pt-BR';

  let best: SupportedLocale = 'pt-BR';
  let bestScore = -1;

  for (const locale of Object.keys(LOCALE_STOPWORDS) as SupportedLocale[]) {
    const stop = new Set(LOCALE_STOPWORDS[locale]);
    let score = 0;
    for (const t of tokens) if (stop.has(t)) score++;
    if (score > bestScore) {
      bestScore = score;
      best = locale;
    }
  }

  return best;
}

export interface BilingualChunk {
  id: string;
  text: string;
  lang: SupportedLocale;
  index: number;
}

export interface BilingualChunkOptions {
  /** Override auto-detection. */
  lang?: SupportedLocale;
  /** Max words per chunk window. */
  maxWords?: number;
  /** Word overlap between consecutive windows. */
  overlap?: number;
}

/**
 * Split text into language-tagged chunks.
 *
 * The splitter prefers sentence boundaries so we never break a sentence in
 * the middle, then groups sentences into sliding windows. Every chunk is
 * tagged with the (optionally auto-detected) locale so a downstream
 * retrieval index can keep mixed-language corpora coherent.
 */
export function bilingualChunk(
  text: string,
  options: BilingualChunkOptions = {},
): BilingualChunk[] {
  const lang = options.lang ?? detectLanguage(text);
  const maxWords = options.maxWords ?? 180;
  const overlap = options.overlap ?? 40;

  const sentences = text
    .split(SENTENCE_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return text.trim()
      ? [{ id: 'chunk_0', text: text.trim(), lang, index: 0 }]
      : [];
  }

  const chunks: BilingualChunk[] = [];
  let window: string[] = [];
  let wordCount = 0;
  let index = 0;

  const flush = (sentencesInWindow: string[]) => {
    const chunkTextValue = sentencesInWindow.join(' ').trim();
    if (chunkTextValue) {
      chunks.push({
        id: `chunk_${index++}`,
        text: chunkTextValue,
        lang,
        index: chunks.length,
      });
    }
  };

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (wordCount + words.length > maxWords && window.length > 0) {
      flush(window);
      // carry overlap from the tail
      const tail = window.slice(-overlap);
      window = [...tail];
      wordCount = tail.reduce((acc, s) => acc + s.split(/\s+/).length, 0);
    }
    window.push(sentence);
    wordCount += words.length;
  }

  flush(window);
  return chunks;
}

/* ------------------------------------------------------------------ */
/*  Mixed-language retrieval index                                     */
/* ------------------------------------------------------------------ */

export interface MixedLanguageDoc {
  id: string;
  text: string;
  lang?: SupportedLocale;
  metadata?: Record<string, string>;
}

export class MixedLanguageIndex {
  private docs: MixedLanguageDoc[] = [];

  add(documents: MixedLanguageDoc[]): void {
    for (const d of documents) this.docs.push(d);
  }

  get size(): number {
    return this.docs.length;
  }

  /**
   * Retrieve top-K documents for a (possibly different-language) query.
   *
   * Because pt-BR and es-ES share a large amount of vocabulary/stems and we
   * lowercase + strip diacritics, a simple token-overlap score works across
   * the supported locales without an embedding model.
   */
  search(query: string, topK = 5): Array<{ doc: MixedLanguageDoc; score: number }> {
    const qTokens = tokenizeQuery(query);
    const qSet = new Set(qTokens);

    const scored = this.docs.map((doc) => {
      const dTokens = tokenizeQuery(doc.text);
      const dSet = new Set(dTokens);
      let overlap = 0;
      for (const t of qSet) if (dSet.has(t)) overlap++;
      const score = qSet.size ? overlap / Math.sqrt(qSet.size * Math.max(dSet.size, 1)) : 0;
      return { doc, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }
}

function normalizeToken(token: string): string {
  return token
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function tokenizeQuery(text: string): string[] {
  return text
    .split(/[^a-zà-ÿ0-9]+/i)
    .map(normalizeToken)
    .filter((w) => w.length > 1);
}
