import type { Chunk, RetrievalResult } from '../rag.js';
import { retrieve } from '../rag.js';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type LeadProfile = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  /** Lead's stated interest (e.g. "apartamento 2 quartos", "casa até 500k"). */
  interest?: string;
  /** Budget range the lead explicitly mentioned. */
  budget?: { min?: number; max?: number };
  /** Source of the lead (organic, referral, campaign, etc.). */
  source?: string;
  /** Timestamp of first contact. */
  firstContact?: Date;
  /** How many times the lead has interacted. */
  engagementCount?: number;
};

export type ScoredLead = LeadProfile & {
  score: number;
  breakdown: {
    budgetFit: number;       // 0 – 40
    interestRelevance: number; // 0 – 30
    engagementRecency: number; // 0 – 20
    sourceQuality: number;    // 0 – 10
  };
};

export type ScorerContext = {
  /** Property catalog chunks for semantic matching. */
  chunks: Chunk[];
  /** Optional: known conversion data to tune scoring. */
  historical?: Array<{ leadId: string; converted: boolean }>;
};

/* ------------------------------------------------------------------ */
/*  Agent                                                             */
/* ------------------------------------------------------------------ */

/**
 * LeadScorerAgent — evaluates lead quality on a 0–100 scale.
 *
 * Scoring dimensions:
 *   - budgetFit (40 pts): how well the lead's budget aligns with available inventory
 *   - interestRelevance (30 pts): semantic similarity between lead interest & property catalog
 *   - engagementRecency (20 pts): how many interactions happened recently
 *   - sourceQuality (10 pts): quality score of the acquisition channel
 */
export class LeadScorerAgent {
  private ctx: ScorerContext;

  constructor(ctx: ScorerContext) {
    this.ctx = ctx;
  }

  /* ---- public API ---- */

  /** Score a single lead. */
  score(lead: LeadProfile): ScoredLead {
    return {
      ...lead,
      score: this.computeScore(lead),
      breakdown: {
        budgetFit: this.scoreBudgetFit(lead),
        interestRelevance: this.scoreInterestRelevance(lead),
        engagementRecency: this.scoreEngagement(lead),
        sourceQuality: this.scoreSource(lead),
      },
    };
  }

  /** Score many leads and return them sorted descending. */
  scoreBatch(leads: LeadProfile[]): ScoredLead[] {
    return leads.map((l) => this.score(l)).sort((a, b) => b.score - a.score);
  }

  /* ---- private dimensions ---- */

  private scoreBudgetFit(lead: LeadProfile): number {
    if (!lead.budget) return 20; // neutral
    const { min = 0, max = Infinity } = lead.budget;

    // Count properties within budget
    const priceField = 'preço';
    let inBudget = 0;
    let total = 0;

    for (const chunk of this.ctx.chunks) {
      total++;
      const priceMatch = chunk.text.match(/[Rr$]\s*[\d.\s,]+/);
      if (!priceMatch) continue;

      const price = this.parsePrice(priceMatch[0]);
      if (price >= min && price <= max) inBudget++;
    }

    if (total === 0) return 20;
    const ratio = inBudget / total;
    // Scale: 0–40 points
    return Math.round(ratio * 40);
  }

  private scoreInterestRelevance(lead: LeadProfile): number {
    if (!lead.interest) return 15; // neutral
    const query = `${lead.interest} ${lead.city ?? ''} ${lead.state ?? ''}`.trim();
    if (!query) return 15;

    const results: RetrievalResult[] = retrieve(query, this.ctx.chunks, 5);
    if (results.length === 0) return 15;

    const avgScore =
      results.reduce((sum, r) => sum + r.score, 0) / results.length;
    // Map cosine similarity [0,1] → score [0,30]
    return Math.round(avgScore * 30);
  }

  private scoreEngagement(lead: LeadProfile): number {
    const count = lead.engagementCount ?? 0;
    if (count <= 0) return 0;

    // Diminishing returns: log scale up to 20
    const raw = Math.log10(count + 1) * 15;
    return Math.min(20, Math.round(raw));
  }

  private scoreSource(lead: LeadProfile): number {
    const weights: Record<string, number> = {
      referral: 10,
      organic: 8,
      campaign: 6,
      social: 5,
      cold_email: 3,
      unknown: 3,
    };
    const src = (lead.source ?? 'unknown').toLowerCase();
    return weights[src] ?? 3;
  }

  /* ---- helpers ---- */

  private computeScore(lead: LeadProfile): number {
    const b = this.scoreBudgetFit(lead);
    const i = this.scoreInterestRelevance(lead);
    const e = this.scoreEngagement(lead);
    const s = this.scoreSource(lead);
    return Math.min(100, b + i + e + s);
  }

  private parsePrice(raw: string): number {
    const cleaned = raw.replace(/[Rr$\s]/g, '').replace(',', '.');
    const val = parseFloat(cleaned);
    return Number.isFinite(val) ? val : 0;
  }
}
