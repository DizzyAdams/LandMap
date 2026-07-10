import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Server-side Overpass proxy for the 3D World viewer.
 *
 * The browser cannot call the public Overpass API directly: those endpoints do
 * not send permissive CORS headers, so every request from the deployed origin
 * is blocked and the viewer silently falls back to a *procedural* city. Running
 * the fetch here (Node runtime, no CORS) lets us serve REAL OpenStreetMap
 * geometry, and the response is cached at the edge so repeat views are instant.
 */

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

type BBox = [number, number, number, number]; // [west, south, east, north]

function buildQuery([w, s, e, n]: BBox): string {
  return `[out:json][timeout:25];
(
  way["building"](${s},${w},${n},${e});
  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service"](${s},${w},${n},${e});
  node["natural"="tree"](${s},${w},${n},${e});
);
out geom;`;
}

function isValidBBox(v: unknown): v is BBox {
  if (!Array.isArray(v) || v.length !== 4) return false;
  const [w, s, e, n] = v;
  return (
    [w, s, e, n].every((x) => typeof x === 'number' && Number.isFinite(x)) &&
    w >= -180 && e <= 180 && s >= -90 && n <= 90 && e > w && n > s &&
    // Guard against absurdly large queries that would hammer Overpass.
    e - w < 1 && n - s < 1
  );
}

export async function POST(request: Request) {
  let bbox: unknown;
  try {
    ({ bbox } = (await request.json()) as { bbox?: unknown });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!isValidBBox(bbox)) {
    return NextResponse.json(
      { error: 'A valid bbox [west, south, east, north] (< 1° span) is required.' },
      { status: 400 },
    );
  }

  const body = 'data=' + encodeURIComponent(buildQuery(bbox));

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const json = await res.json();
      return NextResponse.json(json, {
        headers: {
          // OSM geometry changes slowly — cache hard at the edge.
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        },
      });
    } catch {
      clearTimeout(timer);
      // try next endpoint
    }
  }

  return NextResponse.json(
    { error: 'All Overpass endpoints are unavailable.' },
    { status: 502 },
  );
}
