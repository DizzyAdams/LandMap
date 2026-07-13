'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTranslations } from 'next-intl';
import {
  geoAutocomplete,
  type AutocompleteSuggestion,
} from '../lib/api';
import {
  bboxFromCenter, areaKm2,
  fetchWorld,
  analyzeWorld,
  fetchMarketContext,
  EMPTY_FEATURE_COLLECTION,
  type WorldData,
  type WorldAnalysis,
  type MarketContext,
  type LngLat,
} from '../lib/bmap';

import InvestorPanel from './InvestorPanel';
import EnergyPanel from './EnergyPanel';
import LivePulse from './LivePulse';

const MAPLIBRE_JS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
const MAPLIBRE_CSS = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';

const DARK_TILES = [
  'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
];
const LIGHT_TILES = [
  'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
  'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
];
const TERRAIN_TILES = [
  'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
];

const DEFAULT_CENTER: LngLat = { lng: -46.6333, lat: -23.5505 }; // São Paulo

function buildStyle(night: boolean): any {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      base: {
        type: 'raster',
        tiles: night ? DARK_TILES : LIGHT_TILES,
        tileSize: 256,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · © CARTO',
      },
      terrain: {
        type: 'raster-dem',
        tiles: TERRAIN_TILES,
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 14,
        attribution: 'AWS Terrain Tiles',
      },
      world: {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      },
      thermal: {
        type: 'geojson',
        data: EMPTY_FEATURE_COLLECTION,
      },
    },
    terrain: { source: 'terrain', exaggeration: 1.3 },
    layers: [
      { id: 'base', type: 'raster', source: 'base' },
      {
        id: 'world',
        type: 'fill-extrusion',
        source: 'world',
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'height'], 8],
            0, '#0f766e',
            20, '#34d399',
            60, '#22d3ee',
            120, '#a78bfa',
          ],
          'fill-extrusion-height': ['coalesce', ['get', 'height'], 8],
          'fill-extrusion-base': ['coalesce', ['get', 'base'], 0],
          'fill-extrusion-opacity': 0.9,
        },
      },
      {
        id: 'thermal',
        type: 'fill',
        source: 'thermal',
        layout: { visibility: 'none' },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'heatIndex'], 0],
            0, '#34d399',
            50, '#f59e0b',
            100, '#ef4444',
          ],
          'fill-opacity': 0.55,
        },
      },
      // NOTE: MapLibre GL v4 does NOT support a `sky` layer type (that's a
      // Mapbox GL / MapLibre v5 feature). Including it made the whole style fail
      // validation ("layers[3].type: ... 'sky' found") and broke the 3D world.
      // Atmosphere/depth is provided by the cinematic vignette overlay instead.
    ],
  };
}

function cellPolygon(c: { center: [number, number]; heatIndex: number }): any {
  const [lng, lat] = c.center;
  const d = 0.0016;
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng - d, lat - d],
          [lng + d, lat - d],
          [lng + d, lat + d],
          [lng - d, lat + d],
          [lng - d, lat - d],
        ],
      ],
    },
    properties: { heatIndex: c.heatIndex },
  };
}

function useCountUp(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const x = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - x, 3);
      setValue(target * eased);
      if (x < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function BmapViewer() {
  const t = useTranslations('world');
  const [libReady, setLibReady] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [sizeKm, setSizeKm] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [night, setNight] = useState(true);
  const [spin, setSpin] = useState(false);
  const [placeName, setPlaceName] = useState('');
  const [source, setSource] = useState<WorldData['source'] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [stats, setStats] = useState({
    buildings: 0,
    roadsKm: 0,
    trees: 0,
    areaKm2: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const spinRef = useRef<number | null>(null);
  const nightRef = useRef(night);
  nightRef.current = night;

  const [layer, setLayer] = useState<'3d' | 'investor' | 'solar' | 'thermal'>(
    '3d',
  );
  const [analysis, setAnalysis] = useState<WorldAnalysis | null>(null);

  const sizeRef = useRef(sizeKm);
  sizeRef.current = sizeKm;

  const buildAt = useCallback(
    async (center: LngLat, km: number, label: string) => {
      setLoading(true);
      setNotice(null);
      const bbox = bboxFromCenter(center, km);
      let data: WorldData;
      try {
        data = await fetchWorld(bbox);
      } catch {
        data = {
          features: [],
          buildingCount: 0,
          roadsKm: 0,
          trees: 0,
          areaKm2: Math.round(areaKm2(bbox) * 100) / 100,
          source: 'procedural',
        };
      }
      if (data.source === 'procedural') setNotice(t('fallback'));
      setSource(data.source);
      if (label) setPlaceName(label);
      setStats({
        buildings: data.buildingCount,
        roadsKm: data.roadsKm,
        trees: data.trees,
        areaKm2: data.areaKm2,
      });
      // Turn the 3D world into investable intelligence (offline-first).
      let market: MarketContext = {};
      try {
        market = await fetchMarketContext(center);
      } catch {
        market = {};
      }
      const worldAnalysis = analyzeWorld(data, center, market);
      setAnalysis(worldAnalysis);

      const map = mapRef.current;
      if (map) {
        const src = map.getSource('world');
        if (src && src.setData) {
          src.setData({
            type: 'FeatureCollection',
            features: data.features,
          });
        }
        const thermalSrc = map.getSource('thermal');
        if (thermalSrc && thermalSrc.setData) {
          thermalSrc.setData({
            type: 'FeatureCollection',
            features: worldAnalysis.thermal.cells.map(cellPolygon),
          });
        }
        map.flyTo({
          center: [center.lng, center.lat],
          zoom: km <= 1.5 ? 14 : km <= 3 ? 13 : 12,
          pitch: 60,
          bearing: -18,
          duration: 1500,
        });
      }
      setLoading(false);
    },
    [t],
  );

  // Init MapLibre once the CDN script is ready.
  useEffect(() => {
    if (!libReady || !containerRef.current || mapRef.current) return;
    const ml = (window as any).maplibregl;
    if (!ml) {
      setNotice(t('mapError'));
      return;
    }
    try {
      const map = new ml.Map({
        container: containerRef.current,
        style: buildStyle(nightRef.current),
        center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
        zoom: 11,
        pitch: 60,
        bearing: -18,
        antialias: true,
        maxPitch: 85,
        attributionControl: false,
      });
      map.addControl(
        new ml.NavigationControl({ visualizePitch: true }),
        'top-right',
      );
      map.addControl(
        new ml.AttributionControl({ compact: true }),
        'bottom-right',
      );
      map.on('click', (e: any) => {
        buildAt(
          { lng: e.lngLat.lng, lat: e.lngLat.lat },
          sizeRef.current,
          '',
        );
      });
      mapRef.current = map;
    } catch (err) {
      console.error('[BmapViewer] map init failed', err);
      setNotice(t('mapError'));
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libReady]);

  // Sync map layer visibility with the active analysis layer.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer) return;
    try {
      const showThermal = layer === 'thermal';
      if (map.getLayer('thermal')) {
        map.setLayoutProperty('thermal', 'visibility', showThermal ? 'visible' : 'none');
      }
      if (map.getLayer('world')) {
        map.setPaintProperty('world', 'fill-extrusion-opacity', showThermal ? 0.25 : 0.9);
      }
    } catch {
      // map style not ready yet — ignore.
    }
  }, [layer, analysis]);

  // Debounced worldwide geo-autocomplete (open LandMap geo API).
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const s = await geoAutocomplete(q);
        setSuggestions(s);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function selectSuggestion(s: AutocompleteSuggestion) {
    setQuery(s.label);
    setSuggestions([]);
    setActiveIdx(-1);
    buildAt({ lng: s.lng, lat: s.lat }, sizeRef.current, s.label);
  }

  function toggleSpin() {
    setSpin((v) => {
      const next = !v;
      if (next) {
        spinRef.current = window.setInterval(() => {
          const m = mapRef.current;
          if (m) m.setBearing((m.getBearing() + 0.3) % 360);
        }, 30);
      } else if (spinRef.current != null) {
        clearInterval(spinRef.current);
        spinRef.current = null;
      }
      return next;
    });
  }

  function toggleNight() {
    setNight((v) => {
      const next = !v;
      const map = mapRef.current;
      if (map) {
        const src = map.getSource('base');
        if (src && src.setTiles) {
          src.setTiles(next ? DARK_TILES : LIGHT_TILES);
        }
      }
      return next;
    });
  }
  const animBuildings = useCountUp(stats.buildings);
  const animRoads = useCountUp(stats.roadsKm);
  const animTrees = useCountUp(stats.trees);
  const animArea = useCountUp(stats.areaKm2);

  // Auto-build a starter city shortly after the map is ready.
  useEffect(() => {
    if (!libReady) return;
    const id = setTimeout(() => {
      const m = mapRef.current;
      if (m && m.getSource && m.getSource('world')) {
        buildAt(DEFAULT_CENTER, sizeRef.current, 'São Paulo');
      }
    }, 1200);
    return () => clearTimeout(id);
  }, [libReady, buildAt]);

  function rebuild() {
    const m = mapRef.current;
    const c = m ? m.getCenter() : DEFAULT_CENTER;
    buildAt({ lng: c.lng, lat: c.lat }, sizeRef.current, placeName || 'São Paulo');
  }

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)]">
      <Script
        src={MAPLIBRE_JS}
        strategy="afterInteractive"
        onLoad={() => setLibReady(true)}
      />
      <link rel="stylesheet" href={MAPLIBRE_CSS} crossOrigin="" />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="pointer-events-auto w-full max-w-sm">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveIdx((i) => Math.min(suggestions.length - 1, i + 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveIdx((i) => Math.max(0, i - 1));
                  } else if (e.key === 'Enter') {
                    if (activeIdx >= 0 && suggestions[activeIdx])
                      selectSuggestion(suggestions[activeIdx]);
                    else if (suggestions[0]) selectSuggestion(suggestions[0]);
                  }
                }}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                className="w-full rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none backdrop-blur-md transition focus:border-[var(--primary)]"
              />
              {suggestions.length > 0 && (
                <ul
                  role="listbox"
                  className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] text-sm shadow-xl backdrop-blur-md"
                >
                  {suggestions.map((s, i) => (
                    <li key={s.id} role="option" aria-selected={i === activeIdx}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        onMouseEnter={() => setActiveIdx(i)}
                        className={`block w-full px-4 py-2 text-left transition ${
                          i === activeIdx
                            ? 'bg-[var(--primary)]/10 text-emerald-200'
                            : 'text-neutral-300 hover:bg-[var(--card)] hover:border-[var(--border-lovable)]'
                        }`}
                      >
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs text-[var(--muted-foreground-lovable)]">{t('size')}</label>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={sizeKm}
                onChange={(e) => setSizeKm(Number(e.target.value))}
                aria-label={t('size')}
                className="flex-1 accent-[var(--primary)]"
              />
              <span className="w-12 text-right text-xs text-[var(--muted-foreground-lovable)]">
                {sizeKm} {t('km')}
              </span>
              <button
                type="button"
                onClick={rebuild}
                className="btn btn-primary !px-3 !py-1.5 !text-xs"
              >
                {t('build')}
              </button>
            </div>
          </div>

          <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleSpin}
                aria-pressed={spin}
                className={
                  spin
                    ? 'btn btn-primary !px-3 !py-1.5 !text-xs'
                    : 'btn btn-ghost !px-3 !py-1.5 !text-xs'
                }
              >
                {spin ? t('stop') : t('spin')}
              </button>
              <button
                type="button"
                onClick={toggleNight}
                className="btn btn-ghost !px-3 !py-1.5 !text-xs"
              >
                {night ? t('day') : t('night')}
              </button>
            </div>
            <div
              role="tablist"
              aria-label={t('title')}
              className="flex gap-1 rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] p-1 backdrop-blur-md"
            >
              {(['3d', 'investor', 'solar', 'thermal'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={layer === id}
                  onClick={() => setLayer(id)}
                  className={
                    layer === id
                      ? 'rounded-lg bg-[var(--primary)]/20 px-3 py-1 text-xs font-medium text-emerald-300'
                      : 'rounded-lg px-3 py-1 text-xs text-neutral-400 transition hover:bg-[var(--card)] hover:text-neutral-200'
                  }
                >
                  {t(`layers.${id === '3d' ? 'd3' : id}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="pointer-events-none flex flex-wrap items-center gap-3">
          {analysis && analysis.investment.topByScore.length > 0 && (
            <LivePulse
              priceM2={analysis.investment.topByScore[0].priceM2Proxy}
              roi={analysis.investment.topByScore[0].roiProxy}
            />
          )}
          {source && (
            <span
              className={
                source === 'overpass'
                  ? 'pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/[0.08] px-3 py-1 text-[11px] font-medium text-emerald-200 backdrop-blur-md'
                  : 'pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/[0.08] px-3 py-1 text-[11px] font-medium text-amber-200 backdrop-blur-md'
              }
              title={source === 'overpass' ? 'Geometria real do OpenStreetMap' : 'Modelo procedural (OSM indisponível)'}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  source === 'overpass'
                    ? 'bg-[var(--primary)] shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                }`}
              />
              {source === 'overpass' ? 'Dados reais · OSM' : 'Modelo gerado'}
            </span>
          )}
          <Stat label={t('buildings')} value={Math.round(animBuildings)} />
          <Stat
            label={t('roads')}
            value={Math.round(animRoads * 10) / 10}
            suffix={` ${t('km')}`}
          />
          <Stat label={t('trees')} value={Math.round(animTrees)} />
          <Stat
            label={t('area')}
            value={Math.round(animArea * 100) / 100}
            suffix={` ${t('km2')}`}
          />
          {layer === '3d' && (
            <div className="pointer-events-auto rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] px-3 py-2 backdrop-blur-md">
              <div className="mb-1 text-[10px] uppercase tracking-wider text-[var(--muted-foreground-lovable)]">
                {t('layers.d3')} · altura
              </div>
              <div
                className="h-2 w-28 rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg,#0f766e,#34d399,#22d3ee,#a78bfa)',
                }}
              />
              <div className="mt-1 flex w-28 justify-between text-[10px] text-[var(--muted-foreground-lovable)]">
                <span>0m</span>
                <span>120m+</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {analysis && layer !== '3d' && (
        <div className="pointer-events-auto absolute right-4 top-24 z-20 max-h-[70%] w-[calc(100%-2rem)] max-w-sm overflow-y-auto sm:right-6 sm:top-28">
          {layer === 'investor' && <InvestorPanel data={analysis.investment} />}
          {(layer === 'solar' || layer === 'thermal') && (
            <EnergyPanel data={analysis} />
          )}
        </div>
      )}

      <div
        ref={containerRef}
        role="region"
        aria-label={t('title')}
        className="h-[60vh] min-h-[420px] w-full sm:h-[68vh]"
        style={{ zIndex: 0 }}
      />

      {/* Cinematic vignette for depth — sits above the map, never blocks input. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          background:
            'radial-gradient(125% 125% at 50% 28%, transparent 52%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[var(--card)]">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-lovable)] border-t-[var(--primary)]"
            aria-hidden
          />
          <span className="sr-only">{t('building')}</span>
        </div>
      )}
      {notice && !loading && (
        <div className="pointer-events-none absolute bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-lg border border-amber-500/30 bg-amber-950/40 px-3 py-1.5 text-xs text-amber-200 backdrop-blur-md">
          {notice}
        </div>
      )}
      {!libReady && !loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-sm text-[var(--muted-foreground-lovable)]">
          {t('loadingMap')}
        </div>
      )}

      <p className="px-4 py-2 text-[11px] text-[var(--muted-foreground-lovable)]">{t('source')}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="pointer-events-auto rounded-xl border border-[var(--border-lovable)] bg-[var(--card)] px-4 py-2 backdrop-blur-md">
      <div className="text-lg font-semibold tabular-nums text-gradient">
        {value}
        {suffix}
      </div>
      <div className="text-[11px] text-[var(--muted-foreground-lovable)]">{label}</div>
    </div>
  );
}


