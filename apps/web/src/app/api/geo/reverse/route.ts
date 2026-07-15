import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/geo/reverse?lat=&lng= — reverse geocoding + contexto imobiliário.
 * Fonte: Nominatim (OpenStreetMap), MIT. Roda server-side (sem CORS).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat/lng inválidos' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`;

  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'LandMap/1.0 (marketplace)', accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: 'upstream' }, { status: 502 });
    const d = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const a = d.address || {};
    return NextResponse.json(
      {
        id: `${lat},${lng}`,
        label: d.display_name || `${lat}, ${lng}`,
        country: a.country,
        state: a.state,
        city: a.city || a.town || a.village || a.municipality,
        neighborhood: a.suburb || a.neighbourhood,
        lat,
        lng,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch {
    return NextResponse.json({ id: `${lat},${lng}`, label: `${lat}, ${lng}`, lat, lng });
  }
}
