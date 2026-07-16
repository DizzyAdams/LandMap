import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../../lib/serverData';
import { haversineKm, propertyGrade, propertyScore } from '../../../../lib/geoMath';
import type { Property } from '../../../../lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/geo/nearby?lat=&lng=&radiusKm=25&limit=40&type=terreno&minGrade=
 * Ativos do dataset 3000 no raio — inteligência geo local (sem Nominatim).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  const radiusKm = Math.min(Math.max(Number(searchParams.get('radiusKm') || 25), 0.5), 200);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 40), 1), 200);
  const type = searchParams.get('type') || undefined;
  const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : undefined;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat/lng inválidos' }, { status: 400 });
  }

  let items = loadMarketProperties().filter(
    (p) => p.latitude != null && p.longitude != null,
  ) as Property[];

  if (type) items = items.filter((p) => p.type === type);

  const withDist = items
    .map((p) => {
      const distanceKm = haversineKm(lat, lng, p.latitude!, p.longitude!);
      return {
        ...p,
        distanceKm: Number(distanceKm.toFixed(3)),
        grade: propertyGrade(p),
        score: propertyScore(p),
      };
    })
    .filter((p) => p.distanceKm <= radiusKm);

  if (minScore != null && Number.isFinite(minScore)) {
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  const ranked = withDist
    .filter((p) => (minScore != null ? p.score >= minScore : true))
    .sort((a, b) => {
      // Score alto + perto = surreal radar
      const sa = pScore(a);
      const sb = pScore(b);
      if (Math.abs(sa - sb) > 5) return sb - sa;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, limit);

  function pScore(p: { score?: number }) {
    return p.score ?? 0;
  }

  const avgCap =
    ranked.length > 0
      ? ranked.reduce((s, p) => s + (p.capRate ?? p.invest?.capRate ?? 0), 0) / ranked.length
      : 0;

  return NextResponse.json(
    {
      lat,
      lng,
      radiusKm,
      total: withDist.length,
      returned: ranked.length,
      avgCapRate: Number(avgCap.toFixed(5)),
      gradeMix: ranked.reduce(
        (acc, p) => {
          const g = p.grade || 'C';
          acc[g] = (acc[g] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      items: ranked,
    },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
  );
}
