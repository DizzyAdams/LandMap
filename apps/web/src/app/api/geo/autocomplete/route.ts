import { NextResponse } from 'next/server';
import { loadMarketProperties } from '../../../../lib/serverData';
import { propertyScore } from '../../../../lib/geoMath';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Suggestion = {
  id: string;
  label: string;
  type: 'country' | 'state' | 'city' | 'neighborhood';
  name: string;
  countryCode?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  source?: 'landmap' | 'nominatim';
  assetCount?: number;
  avgScore?: number;
};

/**
 * GET /api/geo/autocomplete?q=...
 * 1) Cidades/bairros do dataset 3000 (instantâneo, BR investidor)
 * 2) Nominatim worldwide (fallback / complemento)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const limit = Math.min(Number(searchParams.get('limit') || 8), 12);

  if (!q) return NextResponse.json([]);

  const qn = q.toLowerCase();
  const props = loadMarketProperties();

  // Aggregate cities + neighborhoods with coords
  const cityMap = new Map<
    string,
    { city: string; state: string; lat: number; lng: number; n: number; scoreSum: number }
  >();
  const nhoodMap = new Map<
    string,
    {
      city: string;
      state: string;
      neighborhood: string;
      lat: number;
      lng: number;
      n: number;
      scoreSum: number;
    }
  >();

  for (const p of props) {
    if (p.latitude == null || p.longitude == null) continue;
    const ck = `${p.city}|${p.state}`;
    const c = cityMap.get(ck) || {
      city: p.city,
      state: p.state,
      lat: 0,
      lng: 0,
      n: 0,
      scoreSum: 0,
    };
    c.lat += p.latitude;
    c.lng += p.longitude;
    c.n += 1;
    c.scoreSum += propertyScore(p);
    cityMap.set(ck, c);

    if (p.neighborhood) {
      const nk = `${p.city}|${p.neighborhood}`;
      const h = nhoodMap.get(nk) || {
        city: p.city,
        state: p.state,
        neighborhood: p.neighborhood,
        lat: 0,
        lng: 0,
        n: 0,
        scoreSum: 0,
      };
      h.lat += p.latitude;
      h.lng += p.longitude;
      h.n += 1;
      h.scoreSum += propertyScore(p);
      nhoodMap.set(nk, h);
    }
  }

  const local: Suggestion[] = [];

  for (const c of cityMap.values()) {
    if (!c.city.toLowerCase().includes(qn) && !c.state.toLowerCase().includes(qn)) continue;
    local.push({
      id: `lm-city-${c.city}-${c.state}`,
      label: `${c.city}, ${c.state} · ${c.n} ativos LandMap`,
      type: 'city',
      name: c.city,
      state: c.state,
      city: c.city,
      lat: c.lat / c.n,
      lng: c.lng / c.n,
      source: 'landmap',
      assetCount: c.n,
      avgScore: Math.round(c.scoreSum / c.n),
    });
  }

  for (const h of nhoodMap.values()) {
    if (
      !h.neighborhood.toLowerCase().includes(qn) &&
      !h.city.toLowerCase().includes(qn)
    ) {
      continue;
    }
    local.push({
      id: `lm-nhood-${h.city}-${h.neighborhood}`,
      label: `${h.neighborhood}, ${h.city}/${h.state} · ${h.n} ativos`,
      type: 'neighborhood',
      name: h.neighborhood,
      state: h.state,
      city: h.city,
      neighborhood: h.neighborhood,
      lat: h.lat / h.n,
      lng: h.lng / h.n,
      source: 'landmap',
      assetCount: h.n,
      avgScore: Math.round(h.scoreSum / h.n),
    });
  }

  local.sort((a, b) => (b.assetCount || 0) - (a.assetCount || 0));
  const localTop = local.slice(0, Math.min(limit, 6));

  let remote: Suggestion[] = [];
  if (localTop.length < limit) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${limit}&countrycodes=br&q=${encodeURIComponent(
        q,
      )}`;
      const res = await fetch(url, {
        headers: { 'user-agent': 'LandMap/1.0 (marketplace)', accept: 'application/json' },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          type: string;
          address?: Record<string, string>;
        }>;
        remote = data.map((d) => {
          const a = d.address || {};
          const city = a.city || a.town || a.village || a.municipality || a.county || '';
          const state = a.state || '';
          const country = a.country || '';
          const label =
            [city, state, country].filter(Boolean).join(', ') || d.display_name;
          return {
            id: String(d.place_id),
            label,
            type: (d.type as Suggestion['type']) || 'city',
            name: city || label,
            countryCode: a.country_code?.toUpperCase(),
            state,
            city,
            neighborhood: a.suburb || a.neighbourhood || '',
            lat: Number(d.lat),
            lng: Number(d.lon),
            source: 'nominatim' as const,
          };
        });
      }
    } catch {
      /* ignore */
    }
  }

  // Merge unique by label-ish
  const seen = new Set(localTop.map((s) => s.label.toLowerCase()));
  const merged = [...localTop];
  for (const r of remote) {
    if (seen.has(r.label.toLowerCase())) continue;
    merged.push(r);
    if (merged.length >= limit) break;
  }

  return NextResponse.json(merged, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
}
