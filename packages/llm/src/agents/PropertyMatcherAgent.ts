import type { Chunk, RetrievalResult } from '../rag.js';
import { retrieve } from '../rag.js';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type ProspectProfile = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  /** Space-separated keywords describing the ideal property. */
  wishlist: string;
  /** Maximum budget the prospect is willing to pay. */
  maxBudget?: number;
  /** Minimum area in m². */
  minArea?: number;
  /** Preferred property types. */
  types?: Array<'apartamento' | 'casa' | 'terreno' | 'comercial'>;
};

export type MatchResult = {
  /** The matched property (identified by its chunk id / markdown id). */
  propertyId: string;
  /** Overall match score 0–100. */
  score: number;
  /** Why this match makes sense. */
  rationale: string;
};

export type MatcherContext = {
  chunks: Chunk[];
};

/* ------------------------------------------------------------------ */
/*  Agent                                                             */
/* ------------------------------------------------------------------ */

/**
 * PropertyMatcherAgent — matches prospect wishlists against the
 * available property catalog using semantic retrieval + rule filters.
 *
 * Pipeline:
 *   1. Semantic candidate pool — retrieves top N chunks via cosine TF-IDF.
 *   2. Rule-based filter — applies budget, area, type constraints.
 *   3. Scoring — re-ranks candidates with a composite score.
 *   4. Rationale — generates a human-readable explanation per match.
 */
export class PropertyMatcherAgent {
  private ctx: MatcherContext;

  constructor(ctx: MatcherContext) {
    this.ctx = ctx;
  }

  /* ---- public API ---- */

  /** Find the top matches for a single prospect. */
  match(prospect: ProspectProfile, topN = 5): MatchResult[] {
    // 1. Semantic candidate pool
    const candidates = this.retrieveCandidates(prospect, topN * 3);

    // 2. Rule-based filter
    const filtered = candidates.filter((c) => this.passesFilters(c, prospect));

    // 3. Score + rank
    const scored = filtered
      .map((c) => this.scoreMatch(c, prospect))
      .sort((a, b) => b.score - a.score);

    // 4. Attach rationale
    const matches = scored.slice(0, topN).map((m) => ({
      ...m,
      rationale: this.buildRationale(m, prospect),
    }));

    return matches;
  }

  /** Match a batch of prospects, returns Map<prospectId, MatchResult[]>. */
  matchBatch(
    prospects: ProspectProfile[],
    topN = 5,
  ): Map<string, MatchResult[]> {
    const results = new Map<string, MatchResult[]>();
    for (const p of prospects) {
      results.set(p.id, this.match(p, topN));
    }
    return results;
  }

  /* ---- private pipeline steps ---- */

  private retrieveCandidates(
    prospect: ProspectProfile,
    limit: number,
  ): RetrievalResult[] {
    const query = [
      prospect.wishlist,
      prospect.city,
      prospect.state,
    ]
      .filter(Boolean)
      .join(' ');

    return retrieve(query, this.ctx.chunks, limit);
  }

  private passesFilters(
    candidate: RetrievalResult,
    prospect: ProspectProfile,
  ): boolean {
    const text = candidate.chunk.text;

    // Budget filter
    if (prospect.maxBudget !== undefined) {
      const price = this.extractPrice(text);
      if (price !== null && price > prospect.maxBudget) return false;
    }

    // Area filter
    if (prospect.minArea !== undefined) {
      const area = this.extractArea(text);
      if (area !== null && area < prospect.minArea) return false;
    }

    // Type filter
    if (prospect.types && prospect.types.length > 0) {
      const type = this.extractType(text);
      if (type && !prospect.types.includes(type)) return false;
    }

    return true;
  }

  private scoreMatch(
    candidate: RetrievalResult,
    prospect: ProspectProfile,
  ): { propertyId: string; score: number; rationale: string } {
    const semanticScore = candidate.score; // 0–1
    const price = this.extractPrice(candidate.chunk.text);
    const area = this.extractArea(candidate.chunk.text);

    let budgetScore = 0.5;
    if (prospect.maxBudget !== undefined && price !== null) {
      budgetScore = price <= prospect.maxBudget * 0.8 ? 1 : price <= prospect.maxBudget ? 0.5 : 0;
    }

    let areaScore = 0.5;
    if (prospect.minArea !== undefined && area !== null) {
      areaScore = area >= prospect.minArea * 1.2 ? 1 : area >= prospect.minArea ? 0.6 : 0;
    }

    // Composite: semantic (50%) + budget (30%) + area (20%)
    const composite = semanticScore * 0.5 + budgetScore * 0.3 + areaScore * 0.2;
    const score = Math.min(100, Math.round(composite * 100));

    return {
      propertyId: candidate.chunk.id,
      score,
      rationale: '', // filled below
    };
  }

  private buildRationale(
    match: { propertyId: string; score: number },
    prospect: ProspectProfile,
  ): string {
    const parts: string[] = [];

    if (match.score >= 80) {
      parts.push('alta compatibilidade com o perfil do cliente');
    } else if (match.score >= 50) {
      parts.push('compatibilidade moderada');
    } else {
      parts.push('compatibilidade baixa');
    }

    if (prospect.wishlist) {
      parts.push(`interesse em "${prospect.wishlist}"`);
    }
    if (prospect.maxBudget) {
      parts.push(`orçamento até ${formatBRL(prospect.maxBudget)}`);
    }

    return `Match de ${match.score}% — ${parts.join(', ')}.`;
  }

  /* ---- extraction helpers ---- */

  private extractPrice(text: string): number | null {
    const match = text.match(/[Rr$]\s*([\d.,\s]+)/);
    if (!match) return null;
    const cleaned = match[1].replace(/[.\s]/g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return Number.isFinite(val) ? val : null;
  }

  private extractArea(text: string): number | null {
    const match = text.match(/(\d+[\s.,]?\d*)\s*m²/);
    if (!match) return null;
    const val = parseFloat(match[1].replace(',', '.'));
    return Number.isFinite(val) ? val : null;
  }

  private extractType(
    text: string,
  ): 'apartamento' | 'casa' | 'terreno' | 'comercial' | null {
    const lower = text.toLowerCase();
    if (lower.includes('apartamento')) return 'apartamento';
    if (lower.includes('casa')) return 'casa';
    if (lower.includes('terreno')) return 'terreno';
    if (lower.includes('comercial') || lower.includes('sala')) return 'comercial';
    return null;
  }
}

/* ---- misc ---- */

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
