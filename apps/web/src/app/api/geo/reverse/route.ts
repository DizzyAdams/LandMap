import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../../lib/serverData';
import { haversineKm, propertyGrade, propertyScore } from '../../../../lib/geoMath';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/geo/reverse?lat=&lng=
 * Reverse (Nominatim) + radar LandMap local (ativos próximos do dataset 3000).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat/lng inválidos' }, { status: 400 });
  }

  let label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  let country: string | undefined;
  let state: string | undefined;
  let city: string | undefined;
  let neighborhood: string | undefined;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, {
      headers: { 'user-agent': 'LandMap/1.0 (marketplace)', accept: 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      const d = (await res.json()) as {
        display_name?: string;
        address?: Record<string, string>;
      };
      const a = d.address || {};
      label = d.display_name || label;
      country = a.country;
      state = a.state;
      city = a.city || a.town || a.village || a.municipality;
      neighborhood = a.suburb || a.neighbourhood;
    }
  } catch {
    /* fallback below */
  }

  // Radar local: densifica o reverse com inteligência do dataset
  const nearby = loadMarketProperties()
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => {
      const distanceKm = haversineKm(lat, lng, p.latitude!, p.longitude!);
      return {
        id: p.id,
        title: p.title,
        city: p.city,
        state: p.state,
        type: p.type,
        price: p.price,
        grade: propertyGrade(p),
        score: propertyScore(p),
        capRate: p.capRate ?? p.invest?.capRate,
        distanceKm: Number(distanceKm.toFixed(3)),
        latitude: p.latitude,
        longitude: p.longitude,
      };
    })
    .filter((p) => p.distanceKm <= 15)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 12);

  // Se Nominatim falhou cidade, infere do dataset
  if (!city && nearby[0]) {
    city = nearby[0].city;
    state = state || nearby[0].state;
  }

  const topGrade = nearby.filter((n) => n.grade === 'A' || n.grade === 'B').length;
  const avgScore =
    nearby.length > 0
      ? Math.round(nearby.reduce((s, n) => s + n.score, 0) / nearby.length)
      : 0;

  return NextResponse.json(
    {
      id: `${lat},${lng}`,
      label,
      country,
      state,
      city,
      neighborhood,
      lat,
      lng,
      landmap: {
        nearbyCount: nearby.length,
        topGradeCount: topGrade,
        avgScore,
        nearby,
      },
    },
    { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
  );
}
