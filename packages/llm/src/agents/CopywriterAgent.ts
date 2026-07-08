import { chatCompletion } from '../completion.js';
import type { LlmMessage } from '../types.js';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type PropertyForCopy = {
  title: string;
  city: string;
  state: string;
  price: number;
  type: 'apartamento' | 'casa' | 'terreno' | 'comercial' | string;
  modality: 'venda' | 'aluguel' | 'lancamento' | string;
  areaM2?: number;
  bedrooms?: number;
  neighborhood?: string;
  tags?: string[];
  description?: string;
};

export type CopyResult = {
  headline: string;
  description: string;
  bullets: string[];
  cta: string;
  model: string;
  generatedAt: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const TYPE_LABEL: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Sala comercial',
};

const MODALITY_LABEL: Record<string, string> = {
  venda: 'à venda',
  aluguel: 'para alugar',
  lancamento: 'em lançamento',
};

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

function fallbackCopy(p: PropertyForCopy, tone: string): CopyResult {
  const label = TYPE_LABEL[p.type] ?? p.type;
  const modality = MODALITY_LABEL[p.modality] ?? p.modality;
  const where = p.neighborhood ? `${p.neighborhood}, ${p.city}` : p.city;

  const headline = `${label} ${modality} em ${where}`;
  const bullets: string[] = [
    `Área de ${p.areaM2 ? `${p.areaM2} m²` : 'alto padrão'}`,
    p.bedrooms ? `${p.bedrooms} dormitório(s)` : 'Localização privilegiada',
    p.tags?.length ? `Diferenciais: ${p.tags.slice(0, 3).join(', ')}` : 'Oportunidade exclusiva LandMap',
  ];

  const description =
    `${headline} por ${formatBRL(p.price)}. ` +
    `${p.description ?? `Um ${label.toLowerCase()} selecionado pela inteligência de dados LandMap para entregar o melhor custo-benefício em ${p.city}/${p.state}.`} ` +
    `Agende uma visita e receba a análise completa de investimento.`;

  const cta =
    tone === 'urgency'
      ? 'Garanta essa oportunidade — fale com um especialista agora.'
      : 'Descubra se este imóvel é o match perfeito para você.';

  return {
    headline,
    description,
    bullets,
    cta,
    model: 'fallback-template',
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ */
/*  Agent                                                             */
/* ------------------------------------------------------------------ */

/**
 * CopywriterAgent — turns a property record into conversion-ready
 * marketing copy (headline, description, bullets, CTA).
 *
 * Falls back to a deterministic, on-brand template when no LLM key is set,
 * so it always returns usable copy.
 */
export class CopywriterAgent {
  private tone: 'standard' | 'urgency' | 'luxury';

  constructor(tone: 'standard' | 'urgency' | 'luxury' = 'standard') {
    this.tone = tone;
  }

  async generate(property: PropertyForCopy): Promise<CopyResult> {
    const system: LlmMessage = {
      role: 'system',
      content:
        'You are a senior real-estate copywriter for the LandMap brand. ' +
        'Write persuasive, concise, Portuguese (pt-BR) marketing copy. ' +
        'Return ONLY valid JSON (no markdown) with keys: ' +
        'headline (string), description (string), bullets (string[]), cta (string).',
    };

    const user: LlmMessage = {
      role: 'user',
      content:
        `Tone: ${this.tone}.\nProperty:\n` +
        JSON.stringify(property, null, 2),
    };

    try {
      const { content, model } = await chatCompletion([system, user]);
      const parsed = JSON.parse(content) as Partial<CopyResult>;
      return {
        headline: parsed.headline ?? fallbackCopy(property, this.tone).headline,
        description: parsed.description ?? fallbackCopy(property, this.tone).description,
        bullets: Array.isArray(parsed.bullets) ? parsed.bullets : fallbackCopy(property, this.tone).bullets,
        cta: parsed.cta ?? fallbackCopy(property, this.tone).cta,
        model,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return fallbackCopy(property, this.tone);
    }
  }
}
