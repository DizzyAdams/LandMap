/**
 * bmap.io-style 3D world data layer for LandMap.
 *
 * Given a bounding box, this module pulls REAL OpenStreetMap geometry
 * (buildings, streets, trees) from the public Overpass API — exactly the
 * "draw a box, get the city" idea behind bmap.io — and normalises it into a
 * GeoJSON FeatureCollection that the MapLibre 3D viewer can extrude.
 *
 * If Overpass is unreachable / rate-limited (common), it transparently falls
 * back to a deterministic procedural world so the viewer always shows a place.
 * No API keys, no server — it runs entirely in the browser.
 */

export type LngLat = { lng: number; lat: number };

/** [west, south, east, north] */
export type BBox = [number, number, number, number];

export interface WorldFeature {
  type: 'Feature';
  geometry: { type: 'Polygon'; coordinates: number[][][] };
  properties: { height: number; base: number };
}

export interface WorldData {
  features: WorldFeature[];
  buildingCount: number;
  roadsKm: number;
  trees: number;
  areaKm2: number;
  /** Where the geometry came from — drives the "real vs generated" notice. */
  source: 'overpass' | 'procedural';
}

export const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [] as WorldFeature[],
};

const EARTH_R = 6371000; // metres

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

/** Great-circle distance in metres between two lon/lat points. */
export function haversine(a: LngLat, b: LngLat): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A square-ish bounding box `km` wide centred on `center`. */
export function bboxFromCenter(center: LngLat, km: number): BBox {
  const dLat = km / 110.574;
  const dLng = km / (111.32 * Math.cos(toRad(center.lat)));
  return [
    center.lng - dLng,
    center.lat - dLat,
    center.lng + dLng,
    center.lat + dLat,
  ];
}

export function areaKm2(bbox: BBox): number {
  const [w, s, e, n] = bbox;
  const widthM = haversine({ lng: w, lat: s }, { lng: e, lat: s });
  const heightM = haversine({ lng: w, lat: s }, { lng: w, lat: n });
  return (widthM * heightM) / 1_000_000;
}

/** Overpass QL: buildings, streets and trees for a bbox, with inline geometry. */
function overpassQuery(bbox: BBox): string {
  const [w, s, e, n] = bbox;
  return `[out:json][timeout:25];
(
  way["building"](${s},${w},${n},${e});
  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service"](${s},${w},${n},${e});
  node["natural"="tree"](${s},${w},${n},${e});
);
out geom;`;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function buildingHeight(tags: Record<string, string>): number {
  if (tags.height) {
    const h = parseFloat(tags.height);
    if (!Number.isNaN(h) && h > 0) return Math.min(h, 400);
  }
  if (tags['building:levels']) {
    const l = parseFloat(tags['building:levels']);
    if (!Number.isNaN(l) && l > 0) return Math.min(l * 3, 400);
  }
  return 8;
}
interface OverpassElement {
  type: string;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

function parseOverpass(elements: OverpassElement[], bbox: BBox): WorldData {
  const features: WorldFeature[] = [];
  let roadsKm = 0;
  let trees = 0;

  for (const el of elements) {
    if (el.type === 'node' && el.tags?.natural === 'tree') {
      trees += 1;
      continue;
    }
    if (el.type === 'way' && el.geometry && el.geometry.length >= 4) {
      const ring = el.geometry.map((p) => [p.lon, p.lat]);
      if (el.tags?.building) {
        features.push({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [ring] },
          properties: { height: buildingHeight(el.tags), base: 0 },
        });
      } else if (el.tags?.highway) {
        for (let i = 1; i < el.geometry.length; i++) {
          roadsKm +=
            haversine(
              { lng: el.geometry[i - 1].lon, lat: el.geometry[i - 1].lat },
              { lng: el.geometry[i].lon, lat: el.geometry[i].lat },
            ) / 1000;
        }
      }
    }
  }

  return {
    features,
    buildingCount: features.length,
    roadsKm: Math.round(roadsKm * 10) / 10,
    trees,
    areaKm2: Math.round(areaKm2(bbox) * 100) / 100,
    source: 'overpass',
  };
}

/** Deterministic PRNG so the same place always yields the same world. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A believable low-poly city block when OSM is unavailable. */
export function proceduralWorld(bbox: BBox): WorldData {
  const [w, s, e, n] = bbox;
  const rng = mulberry32(
    Math.round((w + 1) * 1000 + (s + 1) * 7 + e * 13 + n * 3),
  );
  const lat = (s + n) / 2;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos(toRad(lat));

  const sideKm = ((e - w) * mPerDegLng) / 1000;
  const spacingM = 70;
  const cellsLat = Math.max(2, Math.floor((sideKm * 1000) / spacingM));
  const cellsLng = Math.max(2, Math.floor((sideKm * 1000) / spacingM));
  const cap = 2200;

  const features: WorldFeature[] = [];
  const half = spacingM / 2 / mPerDegLat;
  const halfLng = spacingM / 2 / mPerDegLng;

  for (let i = 0; i < cellsLat && features.length < cap; i++) {
    for (let j = 0; j < cellsLng && features.length < cap; j++) {
      if (rng() > 0.72) continue;
      const cy = s + ((i + 0.5) / cellsLat) * (n - s);
      const cx = w + ((j + 0.5) / cellsLng) * (e - w);
      const jitLat = (rng() - 0.5) * half;
      const jitLng = (rng() - 0.5) * halfLng;
      const ring = [
        [cx - halfLng + jitLng, cy - half + jitLat],
        [cx + halfLng + jitLng, cy - half + jitLat],
        [cx + halfLng + jitLng, cy + half + jitLat],
        [cx - halfLng + jitLng, cy + half + jitLat],
        [cx - halfLng + jitLng, cy - half + jitLat],
      ];
      // Downtown bias: taller buildings toward the centre of the box.
      const distC =
        Math.hypot(i - cellsLat / 2, j - cellsLng / 2) /
        (Math.hypot(cellsLat, cellsLng) / 2);
      const r = rng();
      const height = Math.round(6 + r * r * 70 * (1 - distC * 0.6));
      features.push({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [ring] },
        properties: { height, base: 0 },
      });
    }
  }

  const streets = Math.floor((sideKm * 1000) / spacingM);
  return {
    features,
    buildingCount: features.length,
    roadsKm: Math.round(streets * sideKm * 10) / 10,
    trees: Math.round(features.length * 0.4),
    areaKm2: Math.round(areaKm2(bbox) * 100) / 100,
    source: 'procedural',
  };
}
/**
 * Fetch a real 3D world for `bbox`. Tries each Overpass endpoint (with a
 * timeout); on any failure, returns a procedural world instead so the caller
 * always gets something renderable.
 */
export async function fetchWorld(
  bbox: BBox,
  timeoutMs = 26000,
): Promise<WorldData> {
  // Preferred path: our own server-side proxy (/api/overpass). The browser
  // cannot hit the public Overpass endpoints directly (they lack CORS headers),
  // so the proxy is what actually delivers REAL OpenStreetMap geometry. The
  // direct-endpoint loop below is kept only as a best-effort fallback (e.g. when
  // the viewer runs outside the app origin).
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('/api/overpass', {
      method: 'POST',
      body: JSON.stringify({ bbox }),
      headers: { 'content-type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const json = (await res.json()) as { elements?: OverpassElement[] };
      const parsed = parseOverpass(json.elements ?? [], bbox);
      if (parsed.buildingCount > 0) return parsed;
    }
  } catch {
    clearTimeout(timer);
  }

  const q = overpassQuery(bbox);
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const c2 = new AbortController();
    const t2 = setTimeout(() => c2.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        signal: c2.signal,
      });
      clearTimeout(t2);
      if (!res.ok) continue;
      const json = (await res.json()) as { elements?: OverpassElement[] };
      const parsed = parseOverpass(json.elements ?? [], bbox);
      if (parsed.buildingCount > 0) return parsed;
    } catch {
      clearTimeout(t2);
    }
  }
  return proceduralWorld(bbox);
}
/* ───────────────────────────────────────────────────────────────────────────
 * Analysis layer — turns a 3D world into investable intelligence.
 * Deterministic + offline; an optional live market context can refine it.
 * ─────────────────────────────────────────────────────────────────────────── */

export type InvestmentKind = 'multifamily' | 'commercial' | 'mixed' | 'land';

export interface InvestmentOpportunity {
  id: string;
  title: string;
  kind: InvestmentKind;
  areaM2: number;
  heightM: number;
  priceM2Proxy: number;
  capRateProxy: number;
  roiProxy: number;
  ticketBRL: number;
  score: number;
  fundReady: boolean;
}

export interface SolarBuilding {
  id: string;
  roofM2: number;
  kwProxy: number;
  co2TonsYr: number;
}

export interface ThermalCell {
  id: string;
  center: [number, number];
  heatIndex: number;
  buildings: number;
  greenCooling: number;
}

export interface WorldAnalysis {
  investment: {
    opportunities: InvestmentOpportunity[];
    fundReady: number;
    avgCapRate: number;
    totalTicketBRL: number;
    topByScore: InvestmentOpportunity[];
  };
  energy: {
    roofs: SolarBuilding[];
    totalKwp: number;
    totalMwp: number;
    co2TonsYr: number;
    topSolar: SolarBuilding[];
    renewableScore: number;
  };
  thermal: {
    cells: ThermalCell[];
    hottest: ThermalCell[];
    avgHeat: number;
    greenCooling: number;
  };
}

export interface MarketContext {
  pricePerM2?: number;
  yoy?: number;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function ringAreaM2(ring: number[][]): number {
  if (ring.length < 3) return 0;
  const lat0 = ring[0][1];
  const xScale = 111320 * Math.cos(toRad(lat0));
  const yScale = 110574;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += x1 * xScale * (y2 * yScale) - x2 * xScale * (y1 * yScale);
  }
  return Math.abs(area) / 2;
}

function centroid(ring: number[][]): LngLat {
  let sLng = 0;
  let sLat = 0;
  for (const [lng, lat] of ring) {
    sLng += lng;
    sLat += lat;
  }
  return { lng: sLng / ring.length, lat: sLat / ring.length };
}

function classifyKind(height: number, seed: number): InvestmentKind {
  if (height < 8) return seed > 0.5 ? 'land' : 'multifamily';
  if (height < 24) return 'multifamily';
  if (height < 60) return seed > 0.4 ? 'mixed' : 'commercial';
  return 'commercial';
}

const KIND_LABEL_PT: Record<InvestmentKind, string> = {
  multifamily: 'Multifamiliar',
  commercial: 'Comercial',
  mixed: 'Misto',
  land: 'Terreno',
};

export function analyzeWorld(
  world: WorldData,
  center: LngLat,
  market?: MarketContext,
): WorldAnalysis {
  const feats = world.features;
  const basePrice = market?.pricePerM2 ?? 5200;
  const yoy = market?.yoy ?? 6.5;
  const dists = feats.map((f) => haversine(center, centroid(f.geometry.coordinates[0])));
  const maxDist = Math.max(1, ...dists);

  const opportunities: InvestmentOpportunity[] = feats.map((f, i) => {
    const ring = f.geometry.coordinates[0];
    const area = ringAreaM2(ring);
    const height = f.properties.height;
    const seed = hashStr(f.type + i + ring[0][0].toFixed(4));
    const kind = classifyKind(height, seed);
    const prox = 1 - dists[i] / maxDist;
    const heightNorm = Math.min(1, height / 120);
    const areaNorm = Math.min(1, area / 4000);
    const kindBonus =
      kind === 'commercial' ? 1 : kind === 'mixed' ? 0.8 : kind === 'multifamily' ? 0.6 : 0.3;
    const score = Math.round(prox * 42 + heightNorm * 28 + areaNorm * 18 + kindBonus * 12);
    const priceM2 = Math.round(basePrice * (0.7 + prox * 0.5) * (0.85 + (score / 100) * 0.4));
    const capRate = Math.round((9.5 - score * 0.035) * 100) / 100;
    const roi = Math.round((capRate + yoy * 0.4) * 100) / 100;
    const ticket = Math.round(area * height * priceM2 * 0.55);
    const fundReady = score >= 64 && kind !== 'land';
    return {
      id: `opp-${i}`,
      title: `${KIND_LABEL_PT[kind]} · ${Math.round(height)}m`,
      kind,
      areaM2: Math.round(area),
      heightM: Math.round(height),
      priceM2Proxy: priceM2,
      capRateProxy: capRate,
      roiProxy: roi,
      ticketBRL: ticket,
      score,
      fundReady,
    };
  });

  const fundReadyList = opportunities.filter((o) => o.fundReady);
  const avgCapRate =
    fundReadyList.length > 0
      ? Math.round((fundReadyList.reduce((s, o) => s + o.capRateProxy, 0) / fundReadyList.length) * 100) / 100
      : 0;
  const totalTicket = fundReadyList.reduce((s, o) => s + o.ticketBRL, 0);
  const topByScore = [...opportunities].sort((a, b) => b.score - a.score).slice(0, 6);

  const roofs: SolarBuilding[] = feats.map((f, i) => {
    const area = ringAreaM2(f.geometry.coordinates[0]);
    const kw = Math.round(area * 0.16 * 10) / 10;
    return { id: `solar-${i}`, roofM2: Math.round(area), kwProxy: kw, co2TonsYr: Math.round(kw * 0.14 * 10) / 10 };
  });
  const totalKwp = Math.round(roofs.reduce((s, r) => s + r.kwProxy, 0) * 10) / 10;
  const co2 = Math.round(roofs.reduce((s, r) => s + r.co2TonsYr, 0) * 10) / 10;
  const topSolar = [...roofs].sort((a, b) => b.kwProxy - a.kwProxy).slice(0, 6);
  const renewableScore = Math.min(100, Math.round((totalKwp / Math.max(1, feats.length)) * 12));

  /* ── Thermal zoning (urban heat island) ── */
  let minW = 180,
    minS = 90,
    maxE = -180,
    maxN = -90;
  for (const f of feats) {
    for (const [lng, lat] of f.geometry.coordinates[0]) {
      minW = Math.min(minW, lng);
      minS = Math.min(minS, lat);
      maxE = Math.max(maxE, lng);
      maxN = Math.max(maxN, lat);
    }
  }
  if (feats.length === 0) {
    minW = center.lng - 0.01;
    minS = center.lat - 0.01;
    maxE = center.lng + 0.01;
    maxN = center.lat + 0.01;
  }
  const GRID = 8;
  const cells: ThermalCell[] = [];
  for (let gi = 0; gi < GRID; gi++) {
    for (let gj = 0; gj < GRID; gj++) {
      const cw = minW + ((gj + 0.5) / GRID) * (maxE - minW);
      const cs = minS + ((gi + 0.5) / GRID) * (maxN - minS);
      let bCount = 0;
      let vol = 0;
      for (const f of feats) {
        const c = centroid(f.geometry.coordinates[0]);
        if (
          c.lng >= minW + (gj / GRID) * (maxE - minW) &&
          c.lng < minW + ((gj + 1) / GRID) * (maxE - minW) &&
          c.lat >= minS + (gi / GRID) * (maxN - minS) &&
          c.lat < minS + ((gi + 1) / GRID) * (maxN - minS)
        ) {
          bCount++;
          vol += f.properties.height;
        }
      }
      const green = Math.round((1 - hashStr(`${gi}-${gj}`)) * 40);
      const heat = Math.max(0, Math.min(100, Math.round(bCount * 9 + vol * 0.05 - green)));
      cells.push({
        id: `cell-${gi}-${gj}`,
        center: [cw, cs],
        heatIndex: heat,
        buildings: bCount,
        greenCooling: green,
      });
    }
  }
  const hottest = [...cells].sort((a, b) => b.heatIndex - a.heatIndex).slice(0, 4);
  const avgHeat = Math.round(cells.reduce((s, c) => s + c.heatIndex, 0) / cells.length);
  const greenCooling = Math.round(cells.reduce((s, c) => s + c.greenCooling, 0) / cells.length);

  return {
    investment: {
      opportunities,
      fundReady: fundReadyList.length,
      avgCapRate,
      totalTicketBRL: totalTicket,
      topByScore,
    },
    energy: {
      roofs,
      totalKwp,
      totalMwp: Math.round((totalKwp / 1000) * 100) / 100,
      co2TonsYr: co2,
      topSolar,
      renewableScore,
    },
    thermal: { cells, hottest, avgHeat, greenCooling },
  };
}

/** Best-effort reverse-geocode to enrich analysis with live market context. */
export async function fetchMarketContext(
  center: LngLat,
): Promise<MarketContext> {
  try {
    const res = await fetch(`/geo/reverse?lat=${center.lat}&lng=${center.lng}`, {
      cache: 'no-store',
    });
    if (!res.ok) return {};
    const d = (await res.json()) as { pricePerM2?: number; yoy?: number };
    return { pricePerM2: d.pricePerM2, yoy: d.yoy };
  } catch {
    return {};
  }
}



