import { chatCompletion } from '../completion.js';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface PropertyForAnalysis {
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
  status: string;
  tags?: string[];
}

export interface MarketAnalysis {
  avgPriceM2: number;
  hotTypes: string[];
  priceTrend: 'rising' | 'stable' | 'falling';
  demandScore: number; // 0–100
  recommendation: string;
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Agent                                                             */
/* ------------------------------------------------------------------ */

/**
 * MarketAnalyzerAgent — analisa um conjunto de propriedades e retorna
 * insights de mercado usando chatCompletion.
 */
export class MarketAnalyzerAgent {
  /**
   * analyze — recebe lista de propriedades e retorna análise de mercado.
   */
  async analyze(properties: PropertyForAnalysis[]): Promise<MarketAnalysis> {
    if (properties.length === 0) {
      return {
        avgPriceM2: 0,
        hotTypes: [],
        priceTrend: 'stable',
        demandScore: 0,
        recommendation: 'Não há dados suficientes para análise.',
        summary: 'Sem propriedades para analisar.',
      };
    }

    // Compute basic stats
    const totalArea = properties.reduce((s, p) => s + p.areaM2, 0);
    const avgPriceM2 = totalArea > 0
      ? Math.round(properties.reduce((s, p) => s + p.price / p.areaM2, 0) / properties.length)
      : 0;

    // Group by type
    const byType: Record<string, { count: number; totalPrice: number; totalArea: number }> = {};
    for (const p of properties) {
      if (!byType[p.type]) byType[p.type] = { count: 0, totalPrice: 0, totalArea: 0 };
      byType[p.type].count++;
      byType[p.type].totalPrice += p.price;
      byType[p.type].totalArea += p.areaM2;
    }

    // Hot types: those with highest avg price/m²
    const typeStats = Object.entries(byType)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        avgPriceM2: stats.totalArea > 0 ? Math.round(stats.totalPrice / stats.totalArea) : 0,
      }))
      .sort((a, b) => b.avgPriceM2 - a.avgPriceM2);

    const hotTypes = typeStats.slice(0, 3).map((t) => t.type);

    // Prices for trend
    const prices = properties.map((p) => p.price);
    const firstHalfAvg = prices.slice(0, Math.ceil(prices.length / 2)).reduce((s, v) => s + v, 0) / Math.ceil(prices.length / 2) || 0;
    const secondHalfAvg = prices.slice(Math.ceil(prices.length / 2)).reduce((s, v) => s + v, 0) / Math.floor(prices.length / 2) || 0;

    let priceTrend: 'rising' | 'stable' | 'falling' = 'stable';
    const diff = secondHalfAvg - firstHalfAvg;
    if (diff > firstHalfAvg * 0.1) priceTrend = 'rising';
    else if (diff < -firstHalfAvg * 0.1) priceTrend = 'falling';

    const cities = Array.from(new Set(properties.map((p) => p.city)));
    const types = Array.from(new Set(properties.map((p) => p.type)));

    // Use LLM to generate recommendation
    const { content } = await chatCompletion([
      {
        role: 'system',
        content: `Você é um analista de mercado imobiliário brasileiro. Com base nos dados fornecidos, gere uma análise de mercado.

Responda com um JSON válido (sem markdown) com estas chaves:
- "recommendation": string — recomendação estratégica (máx 200 caracteres)
- "summary": string — resumo da análise (máx 300 caracteres)
- "demandScore": number — pontuação de demanda de 0 a 100`,
      },
      {
        role: 'user',
        content: `Dados do mercado:
- Cidades: ${cities.join(', ')}
- Tipos de imóveis: ${types.join(', ')}
- Preço médio/m²: R$ ${avgPriceM2}
- Tipos mais valorizados: ${hotTypes.join(', ')}
- Tendência de preço: ${priceTrend}
- Total de imóveis analisados: ${properties.length}
- Preço médio: R$ ${Math.round(prices.reduce((s, v) => s + v, 0) / prices.length)}`,
      },
    ]);

    let llmResult: { recommendation: string; summary: string; demandScore: number } | null = null;
    try {
      llmResult = JSON.parse(content);
    } catch {
      // fallback
    }

    return {
      avgPriceM2,
      hotTypes,
      priceTrend,
      demandScore: llmResult?.demandScore ?? Math.round((properties.length / 50) * 100),
      recommendation: llmResult?.recommendation ?? 'Mercado com oportunidades. Analise cada imóvel individualmente.',
      summary: llmResult?.summary ?? `Análise de ${properties.length} imóveis em ${cities.join(', ')}. Preço médio/m²: R$ ${avgPriceM2}.`,
    };
  }
}
