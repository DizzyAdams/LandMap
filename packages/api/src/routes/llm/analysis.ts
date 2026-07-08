import { Hono } from 'hono';
import type { PropertyForAnalysis } from '@landmap/llm/agents/MarketAnalyzerAgent.js';
import type { LeadProfile } from '@landmap/llm/agents/LeadScorerAgent.js';
import type { ProspectProfile } from '@landmap/llm/agents/PropertyMatcherAgent.js';
import type { Chunk } from '@landmap/llm/rag.js';
import type { Env } from '../../index.js';
import { MarketAnalyzerAgent } from '@landmap/llm/agents/MarketAnalyzerAgent.js';
import { LeadScorerAgent } from '@landmap/llm/agents/LeadScorerAgent.js';
import { PropertyMatcherAgent } from '@landmap/llm/agents/PropertyMatcherAgent.js';
import { ingestDocuments } from '@landmap/llm/rag.js';

type AnalyzeMarketBody = {
  properties: PropertyForAnalysis[];
};

type ScoreLeadBody = {
  lead: LeadProfile;
  leads?: LeadProfile[];
};

type MatchPropertiesBody = {
  prospect: ProspectProfile;
  prospects?: ProspectProfile[];
};

function normalizeProperty(input: Record<string, unknown>): PropertyForAnalysis {
  const property: PropertyForAnalysis = {
    id: String(input.id ?? ''),
    title: String(input.title ?? ''),
    city: String(input.city ?? ''),
    state: String(input.state ?? ''),
    type: String(input.type ?? ''),
    modality: String(input.modality ?? ''),
    price: typeof input.price === 'number' ? input.price : Number(input.price ?? 0),
    areaM2: typeof input.areaM2 === 'number' ? input.areaM2 : Number(input.areaM2 ?? 0),
    bedrooms: typeof input.bedrooms === 'number' ? input.bedrooms : undefined,
    neighborhood: typeof input.neighborhood === 'string' && input.neighborhood ? input.neighborhood : undefined,
    zone: typeof input.zone === 'string' && input.zone ? input.zone : undefined,
    status: String(input.status ?? ''),
    tags: Array.isArray(input.tags) ? (input.tags as string[]) : undefined,
  };

  return property;
}

function normalizeLead(input: Record<string, unknown>): LeadProfile {
  const lead: LeadProfile = {
    id: String(input.id ?? ''),
    name: String(input.name ?? ''),
    email: typeof input.email === 'string' && input.email ? input.email : undefined,
    phone: typeof input.phone === 'string' && input.phone ? input.phone : undefined,
    city: typeof input.city === 'string' && input.city ? input.city : undefined,
    state: typeof input.state === 'string' && input.state ? input.state : undefined,
    interest: typeof input.interest === 'string' && input.interest ? input.interest : undefined,
    engagementCount: typeof input.engagementCount === 'number' ? input.engagementCount : undefined,
    source: typeof input.source === 'string' && input.source ? input.source : undefined,
    firstContact: input.firstContact instanceof Date ? input.firstContact : undefined,
  };

  if (input.budget && typeof input.budget === 'object') {
    const budget = input.budget as Record<string, unknown>;
    lead.budget = {
      min: typeof budget.min === 'number' ? budget.min : undefined,
      max: typeof budget.max === 'number' ? budget.max : undefined,
    };
  }

  return lead;
}

function normalizeProspect(input: Record<string, unknown>): ProspectProfile {
  const prospect: ProspectProfile = {
    id: String(input.id ?? ''),
    name: String(input.name ?? ''),
    wishlist: String(input.wishlist ?? ''),
    maxBudget: typeof input.maxBudget === 'number' ? input.maxBudget : undefined,
    minArea: typeof input.minArea === 'number' ? input.minArea : undefined,
    city: typeof input.city === 'string' && input.city ? input.city : undefined,
    state: typeof input.state === 'string' && input.state ? input.state : undefined,
  };

  if (Array.isArray(input.types)) {
    const filtered = input.types.filter(
      (type): type is ProspectProfile['types'][number] =>
        type === 'apartamento' || type === 'casa' || type === 'terreno' || type === 'comercial',
    );
    prospect.types = filtered;
  }

  return prospect;
}

function chunks(): Chunk[] {
  return ingestDocuments().map((chunk) => ({
    id: String(chunk.id ?? ''),
    text: String(chunk.text ?? ''),
    path: String(chunk.path ?? ''),
    title: String(chunk.title ?? ''),
    tokens: typeof chunk.tokens === 'number' ? chunk.tokens : Number(chunk.tokens ?? 0),
  }));
}

export function createLLMAnalysisRouter() {
  const router = new Hono<Env>();
  const analyzer = new MarketAnalyzerAgent();

  router.post('/analyzeMarket', async (c) => {
    const body = await c.req.json<AnalyzeMarketBody>();
    if (!Array.isArray(body.properties) || body.properties.length === 0) {
      return c.json({ error: 'Field "properties" must be a non-empty array' }, 400);
    }

    const normalized = body.properties.map((item) => normalizeProperty(item as unknown as Record<string, unknown>));
    const result = await analyzer.analyze(normalized);
    return c.json({ ok: true, data: result });
  });

  router.post('/scoreLead', async (c) => {
    const body = await c.req.json<ScoreLeadBody>();
    if (!body.lead && !body.leads) {
      return c.json({ error: 'Provide "lead" or "leads"' }, 400);
    }

    const scorerCtx = { chunks: chunks() };
    const scorer = new LeadScorerAgent(scorerCtx);
    if (body.leads) {
      const normalized = body.leads.map((item) => normalizeLead(item as Record<string, unknown>));
      const scored = scorer.scoreBatch(normalized);
      return c.json({ ok: true, items: scored });
    }

    const scored = scorer.score(normalizeLead(body.lead as Record<string, unknown>));
    return c.json({ ok: true, data: scored });
  });

  router.post('/matchProperties', async (c) => {
    const body = await c.req.json<MatchPropertiesBody>();
    if (!body.prospect && !body.prospects) {
      return c.json({ error: 'Provide "prospect" or "prospects"' }, 400);
    }

    const matcherCtx = { chunks: chunks() };
    const matcher = new PropertyMatcherAgent(matcherCtx);
    if (body.prospects) {
      const normalized = body.prospects.map((item) => normalizeProspect(item as Record<string, unknown>));
      const result = matcher.matchBatch(normalized);
      return c.json({ ok: true, items: Array.from(result.entries()).map(([id, matches]) => ({ id, matches })) });
    }

    const matches = matcher.match(normalizeProspect(body.prospect as Record<string, unknown>));
    return c.json({ ok: true, data: matches });
  });

  return router;
}
