import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../lib/serverData';
import type { Property, SearchQuery } from '../../../lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function normalize(s?: string): string {
  return (s || '').toString().trim().toLowerCase();
}

/**
 * GET /api/markdowns — catálogo de imóveis (com lat/lng) para o mapa e busca.
 * Espelha a rota homônima do backend Hono (@landmap/api) usando a MESMA fonte
 * de dados (properties.json). Filtra por q/type/modality/city/state.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: SearchQuery = {
    q: searchParams.get('q') || undefined,
    type: (searchParams.get('type') as SearchQuery['type']) || undefined,
    modality: (searchParams.get('modality') as SearchQuery['modality']) || undefined,
    city: searchParams.get('city') || undefined,
    state: searchParams.get('state') || undefined,
  };

  let items: Property[] = loadMarketProperties();

  const q = normalize(query.q);
  if (q) {
    items = items.filter(
      (p) =>
        normalize(p.title).includes(q) ||
        normalize(p.city).includes(q) ||
        normalize(p.state).includes(q) ||
        normalize(p.neighborhood).includes(q),
    );
  }
  if (query.type) items = items.filter((p) => p.type === query.type);
  if (query.modality) items = items.filter((p) => p.modality === query.modality);
  if (query.city) items = items.filter((p) => normalize(p.city) === normalize(query.city!));
  if (query.state) items = items.filter((p) => normalize(p.state) === normalize(query.state!));

  return NextResponse.json(
    { items, total: items.length },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
  );
}
