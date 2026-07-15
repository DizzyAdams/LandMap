import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * GET /api/geo/autocomplete?q=... — type-ahead de localizações (worldwide).
 * Fonte: Nominatim (OpenStreetMap), MIT. Roda server-side (sem CORS).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(Number(searchParams.get('limit') || 6), 10);

  if (!q) return NextResponse.json([]);

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${limit}&q=${encodeURIComponent(
    q,
  )}`;

  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'LandMap/1.0 (marketplace)', accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json([], { status: 502 });
    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
      type: string;
      address?: Record<string, string>;
    }>;

    const suggestions = data.map((d) => {
      const a = d.address || {};
      const city = a.city || a.town || a.village || a.municipality || a.county || '';
      const state = a.state || '';
      const country = a.country || '';
      const label = [city, state, country].filter(Boolean).join(', ') || d.display_name;
      return {
        id: String(d.place_id),
        label,
        type: (d.type as 'country' | 'state' | 'city' | 'neighborhood') || 'city',
        name: city || label,
        countryCode: a.country_code?.toUpperCase(),
        state,
        city,
        neighborhood: a.suburb || a.neighbourhood || '',
        lat: Number(d.lat),
        lng: Number(d.lon),
      };
    });

    return NextResponse.json(suggestions, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch {
    return NextResponse.json([]);
  }
}
