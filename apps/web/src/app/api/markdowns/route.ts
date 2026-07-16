import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../lib/serverData';
import type { Property, SearchQuery } from '../../../lib/api';
import { propertyGrade, propertyScore } from '../../../lib/geoMath';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function normalize(s?: string): string {
  return (s || '').toString().trim().toLowerCase();
}

/**
 * GET /api/markdowns — catálogo 3000 (schema v2) para mapa, busca e Free.
 * Filtros: q, type, modality, city, state, grade, minScore, minCapRate, id, limit.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query: SearchQuery & { limit?: number } = {
    q: searchParams.get('q') || undefined,
    type: (searchParams.get('type') as SearchQuery['type']) || undefined,
    modality: (searchParams.get('modality') as SearchQuery['modality']) || undefined,
    city: searchParams.get('city') || undefined,
    state: searchParams.get('state') || undefined,
    grade: searchParams.get('grade') || undefined,
    minScore: searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined,
    minCapRate: searchParams.get('minCapRate')
      ? Number(searchParams.get('minCapRate'))
      : undefined,
    id: searchParams.get('id') || undefined,
  };
  const limitRaw = searchParams.get('limit');
  const limit = limitRaw ? Math.min(Math.max(1, Number(limitRaw)), 3000) : undefined;

  let items: Property[] = loadMarketProperties();

  if (query.id) {
    items = items.filter((p) => p.id === query.id);
  }

  const q = normalize(query.q);
  if (q) {
    items = items.filter(
      (p) =>
        normalize(p.title).includes(q) ||
        normalize(p.city).includes(q) ||
        normalize(p.state).includes(q) ||
        normalize(p.neighborhood).includes(q) ||
        (p.tags || []).some((t) => normalize(t).includes(q)),
    );
  }
  if (query.type) items = items.filter((p) => p.type === query.type);
  if (query.modality) items = items.filter((p) => p.modality === query.modality);
  if (query.city) items = items.filter((p) => normalize(p.city) === normalize(query.city!));
  if (query.state) items = items.filter((p) => normalize(p.state) === normalize(query.state!));
  if (query.grade) {
    const g = query.grade.toUpperCase();
    items = items.filter((p) => propertyGrade(p) === g);
  }
  if (query.minScore != null && Number.isFinite(query.minScore)) {
    items = items.filter((p) => propertyScore(p) >= query.minScore!);
  }
  if (query.minCapRate != null && Number.isFinite(query.minCapRate)) {
    items = items.filter((p) => {
      const cap = p.capRate ?? p.invest?.capRate ?? 0;
      return cap >= query.minCapRate!;
    });
  }

  // Prefer higher-grade assets first (radar investidor)
  items = [...items].sort((a, b) => propertyScore(b) - propertyScore(a));

  const total = items.length;
  if (limit != null) items = items.slice(0, limit);

  return NextResponse.json(
    { items, total, schemaVersion: 2 },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' } },
  );
}
