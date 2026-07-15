import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../lib/serverData';
import { computeKpis, computeOpportunities } from '../../../lib/opportunities';
import type { Opportunity, KpiSnapshot } from '../../../lib/opportunities';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/opportunities?city=...
 *
 * Camada HTTP do core de mercado (lib/opportunities.ts). Deriva KPIs e
 * alertas de oportunidade a partir do dataset real (packages/api/src/data/
 * properties.json). Respeita o ULTIMATE DESIGN STANDARD: devolve apenas
 * dados; a UI consome em /[locale]/kpis.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city')?.trim() || undefined;

  try {
    const all = loadMarketProperties();
    const properties = city ? all.filter((p) => p.city === city) : all;

    const kpis: KpiSnapshot = computeKpis(properties);
    let opportunities: Opportunity[] = computeOpportunities(properties);

    if (city) {
      // Já filtrado por cidade; mantém para exibição consistente.
      opportunities = opportunities.filter((o) => o.city === city);
    }

    return NextResponse.json(
      {
        kpis,
        opportunities: opportunities.slice(0, 50),
        total: opportunities.length,
        generatedAt: kpis.generatedAt,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Falha ao calcular oportunidades.', detail: (err as Error)?.message || '' },
      { status: 500 },
    );
  }
}
