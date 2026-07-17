'use client';

/**
 * Mapa — paridade literal Lovable Map Intelligence
 * (layout flutuante, 8 camadas, heat scale, tops, painel de região).
 * Lovable usa Google Maps; aqui Leaflet + mesmo chrome/copy.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { RequireAuth } from '../../../components/RequireAuth';
import {
  LandMapWordmark,
  Search,
  Layers,
  TrendingUp,
  MapPin,
  X,
  ArrowLeft,
  Activity,
  LineChart,
} from '../../../components/lovable/icons';
import {
  Badge,
  Sparkline,
  buttonVariants,
  cn,
} from '@landmap/ui';
import {
  COPY,
  HEAT_SCALE_GRADIENT,
  INTELLIGENCE_LAYERS,
  INTELLIGENCE_REGIONS,
  MAP_CENTER,
  MAP_DEFAULT_ZOOM,
  SEARCH_PLACEHOLDER,
  filterRegions,
  fmtDelta,
  fmtPriceSqm,
  layerValue,
  scoreColor,
  scoreLabel,
  topByScore,
  topByValorization,
  type IntelligenceRegion,
  type LayerId,
} from '../../../lib/mapIntelligence';

function MapPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [query, setQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<LayerId>('valorization');
  const [showHeat, setShowHeat] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selectedRef = useRef(selectedId);
  const layerRef = useRef(activeLayer);
  const heatRef = useRef(showHeat);
  selectedRef.current = selectedId;
  layerRef.current = activeLayer;
  heatRef.current = showHeat;

  const suggestions = useMemo(() => filterRegions(query).slice(0, 8), [query]);
  const selected = useMemo(
    () => INTELLIGENCE_REGIONS.find((r) => r.id === selectedId) ?? null,
    [selectedId],
  );
  const topVal = useMemo(() => topByValorization(5), []);
  const topOpp = useMemo(() => topByScore(5), []);

  const selectRegion = useCallback((r: IntelligenceRegion) => {
    setSelectedId(r.id);
    setQuery(r.name);
    setSuggestOpen(false);
    const map = mapInstance.current;
    if (map) map.flyTo([r.lat, r.lng], 14, { duration: 0.55 });
  }, []);

  const paintMarkers = useCallback(() => {
    const map = mapInstance.current;
    const L = (window as any).L;
    if (!map || !L) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const layer = layerRef.current;
    const heat = heatRef.current;
    const group = L.layerGroup();

    for (const r of INTELLIGENCE_REGIONS) {
      const w = layerValue(r, layer);
      const color = scoreColor(w);
      const isSel = r.id === selectedRef.current;
      const radius = heat ? 10 + (w / 100) * 16 : isSel ? 12 : 9;
      const marker = L.circleMarker([r.lat, r.lng], {
        radius,
        fillColor: color,
        color: isSel ? '#003594' : '#ffffff',
        weight: isSel ? 3 : 2,
        fillOpacity: heat ? 0.35 + (w / 100) * 0.45 : 0.92,
        opacity: 1,
      });
      marker.bindPopup(
        `<strong>${r.name}</strong><br/>${COPY.score}: <b>${r.score}</b> · ${scoreLabel(r.score)}<br/>${fmtPriceSqm(r.priceSqm)}/m² · ${fmtDelta(r.priceSqmDelta12m)}`,
      );
      marker.on('click', (e: { originalEvent?: { stopPropagation?: () => void } }) => {
        e.originalEvent?.stopPropagation?.();
        setSelectedId(r.id);
      });
      group.addLayer(marker);
    }
    group.addTo(map);
    markersRef.current = [group];
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    let cancelled = false;

    function loadLeaflet(): Promise<any> {
      return new Promise((resolve, reject) => {
        if ((window as any).L) return resolve((window as any).L);
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.crossOrigin = '';
        s.onload = () => resolve((window as any).L);
        s.onerror = () => reject(new Error(COPY.failMap));
        document.head.appendChild(s);
      });
    }

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || mapInstance.current) return;
        const map = L.map(mapRef.current, {
          center: MAP_CENTER,
          zoom: MAP_DEFAULT_ZOOM,
          zoomControl: false,
          preferCanvas: true,
          attributionControl: true,
        });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        // Light basemap close to Lovable Google Maps light style
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OSM &copy; CARTO',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);
        mapInstance.current = map;
        setMapReady(true);
        setTimeout(() => {
          try {
            map.invalidateSize({ animate: false });
          } catch {
            /* ignore */
          }
        }, 120);
      })
      .catch(() => setMapError(true));

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapReady) paintMarkers();
  }, [mapReady, paintMarkers, activeLayer, showHeat, selectedId]);

  const sparkData = selected?.priceHistory.map((p) => p.value) ?? [];

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#f8fafc] text-[var(--foreground)]">
      {/* Full-bleed map */}
      {mapError ? (
        <div className="grid h-full place-items-center p-6">
          <div className="text-center">
            <p className="font-medium text-destructive">{COPY.failMap}</p>
            <p className="mt-1 text-sm text-foreground/60">
              Verifique a conexão e recarregue.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={mapRef}
          role="region"
          aria-label="Mapa de inteligência territorial"
          className="absolute inset-0 z-0 h-full w-full"
        />
      )}

      {/* Top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-[1400px] flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-white/95 px-2 py-1.5 shadow-sm backdrop-blur">
              <Link
                href={lh('/')}
                aria-label="Voltar"
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <LandMapWordmark />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLayersOpen((v) => !v)}
                className={cn(
                  buttonVariants({ variant: layersOpen ? 'default' : 'outline', size: 'sm' }),
                  'min-h-10 rounded-full bg-white/95 shadow-sm',
                  !layersOpen && 'border-border/50',
                )}
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Camadas
              </button>
              <Link
                href={lh('/dashboard')}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'min-h-10 rounded-full border-border/50 bg-white/95 shadow-sm',
                )}
              >
                Painel
              </Link>
            </div>
          </div>

          {/* Search — Lovable placeholder */}
          <div className="relative max-w-xl">
            <div className="flex items-center gap-2 rounded-2xl border border-border/50 bg-white/98 px-3 shadow-sm backdrop-blur">
              <Search className="h-4 w-4 shrink-0 text-foreground/50" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                placeholder={SEARCH_PLACEHOLDER}
                aria-label={SEARCH_PLACEHOLDER}
                className="h-11 w-full border-0 bg-transparent px-0 text-sm shadow-none outline-none focus-visible:ring-0"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Limpar"
                  onClick={() => {
                    setQuery('');
                    setSuggestOpen(false);
                  }}
                  className="grid h-7 w-7 place-items-center rounded-full text-foreground/50 hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {suggestOpen && query.trim() && suggestions.length > 0 && (
              <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border/50 bg-white/98 shadow-lg animate-in fade-in">
                {suggestions.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => selectRegion(r)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-muted"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>
                        <span className="font-medium">{r.name}</span>
                        <span className="text-foreground/50"> · {r.city}</span>
                      </span>
                    </span>
                    <span className="tabular-nums text-xs text-foreground/50">
                      {fmtDelta(r.priceSqmDelta12m)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Layers panel — Lovable floating card */}
      {layersOpen && (
        <div className="pointer-events-none absolute bottom-[auto] left-3 top-[8.5rem] z-20 w-[min(100%-1.5rem,20rem)] sm:left-4 sm:top-[9rem]">
          <div className="pointer-events-auto rounded-2xl border border-border/50 bg-white/98 p-4 shadow-lg backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-sm font-semibold">{COPY.layersTitle}</p>
              <button
                type="button"
                onClick={() => setLayersOpen(false)}
                className="grid h-6 w-6 place-items-center rounded-full text-foreground/50 hover:bg-muted"
                aria-label="Fechar camadas"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mb-3 flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{COPY.heat}</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showHeat}
                onClick={() => setShowHeat((v) => !v)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition',
                  showHeat ? 'bg-primary' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
                    showHeat ? 'left-5' : 'left-0.5',
                  )}
                />
              </button>
            </div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-foreground/50">
              {COPY.heatScale}
            </p>
            <div
              className="h-2 w-full rounded-full"
              style={{ background: HEAT_SCALE_GRADIENT }}
              aria-hidden
            />
            <div className="mt-1 flex justify-between text-[10px] text-foreground/50">
              <span>{COPY.critical}</span>
              <span>{COPY.medium}</span>
              <span>{COPY.exceptional}</span>
            </div>

            <div className="mt-4 space-y-1">
              {INTELLIGENCE_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayer(layer.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition',
                    activeLayer === layer.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground/80',
                  )}
                >
                  {layer.label}
                  {activeLayer === layer.id && (
                    <span className="text-[10px] opacity-80">ativa</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom ranking cards — Lovable grid */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        <div className="pointer-events-auto mx-auto grid max-w-[1400px] gap-3 md:grid-cols-2 lg:grid-cols-3">
          <RankCard
            title={COPY.topValorization}
            icon={<TrendingUp className="h-3.5 w-3.5" />}
            items={topVal.map((r) => ({
              id: r.id,
              name: r.name,
              hint: r.city,
              value: fmtDelta(r.priceSqmDelta12m),
              positive: r.priceSqmDelta12m >= 0,
            }))}
            onSelect={(id) => {
              const r = INTELLIGENCE_REGIONS.find((x) => x.id === id);
              if (r) selectRegion(r);
            }}
          />
          <RankCard
            title={COPY.topOpportunities}
            icon={<MapPin className="h-3.5 w-3.5" />}
            items={topOpp.map((r) => ({
              id: r.id,
              name: r.name,
              hint: `${r.city} · ${r.zoning}`,
              value: String(r.score),
              positive: true,
            }))}
            onSelect={(id) => {
              const r = INTELLIGENCE_REGIONS.find((x) => x.id === id);
              if (r) selectRegion(r);
            }}
          />
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border/50 bg-white/98 p-4 shadow-lg backdrop-blur">
              <div className="mb-2 flex items-center gap-2">
                <LineChart className="h-3.5 w-3.5 text-primary" />
                <div>
                  <p className="font-display text-sm font-semibold">{COPY.indexFlow}</p>
                  <p className="text-[10px] text-foreground/50">{COPY.last7Years}</p>
                </div>
              </div>
              <Sparkline
                data={
                  selected?.priceHistory.map((p) => p.value) ??
                  INTELLIGENCE_REGIONS[0].priceHistory.map((p) => p.value)
                }
                width={260}
                height={56}
                aria-label={COPY.indexFlow}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Region detail sheet */}
      {selected && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 pb-[max(12rem,env(safe-area-inset-bottom))] sm:bottom-auto sm:left-auto sm:right-4 sm:top-[8.5rem] sm:w-[22rem] sm:p-0 sm:pb-0">
          <div className="pointer-events-auto max-h-[min(70dvh,520px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/60 bg-white p-4 shadow-xl sm:max-w-none">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
                  {selected.city}, {selected.state}
                </p>
                <h2 className="font-display text-lg font-bold">
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-muted/50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
                {COPY.score}
              </p>
              <p className="font-display text-lg font-bold" style={{ color: scoreColor(selected.score) }}>
                {scoreLabel(selected.score)} · {selected.score}
              </p>
              <p className="mt-0.5 text-xs text-foreground/60">{COPY.scoreHint}</p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Meta label={COPY.avgPrice} value={fmtPriceSqm(selected.priceSqm)} />
              <Meta label="12m" value={fmtDelta(selected.priceSqmDelta12m)} />
              <Meta label={COPY.stateRank} value={`#${Math.max(1, 12 - Math.floor(selected.score / 10))}`} />
              <Meta label={COPY.nationalRank} value={`#${Math.max(1, 40 - Math.floor(selected.score / 3))}`} />
              <Meta label={COPY.population} value={selected.population.toLocaleString('pt-BR')} />
              <Meta label={COPY.income} value={fmtPriceSqm(selected.incomeAvg)} />
              <Meta label={COPY.idh} value={selected.hdi.toFixed(3)} />
              <Meta label={COPY.zoning} value={selected.zoning} />
              <Meta label={COPY.envRisk} value={selected.environmentalRisk} />
              <Meta label={COPY.floodRisk} value={selected.floodRisk} />
            </div>

            <p className="mb-2 mt-4 font-display text-sm font-semibold">{COPY.composition}</p>
            <div className="space-y-2">
              {INTELLIGENCE_LAYERS.map((layer) => {
                const n = selected.layerScores[layer.id];
                return (
                  <div key={layer.id} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 truncate text-xs text-foreground/70 sm:w-40">
                      {layer.label}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${n}%`,
                          background: scoreColor(n),
                        }}
                      />
                    </div>
                    <span className="w-7 text-right text-xs tabular-nums font-medium">{n}</span>
                  </div>
                );
              })}
            </div>

            <p className="mb-2 mt-4 font-display text-sm font-semibold">{COPY.highlights}</p>
            <ul className="space-y-1.5 text-sm text-foreground/80">
              {selected.highlights.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {h}
                </li>
              ))}
            </ul>

            <p className="mb-2 mt-4 font-display text-sm font-semibold">{COPY.timeline}</p>
            <ul className="space-y-2">
              {selected.timeline.map((t) => (
                <li key={`${t.year}-${t.title}`} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 tabular-nums">
                    {t.year}
                  </Badge>
                  <span className="text-foreground/70">{t.title}</span>
                </li>
              ))}
            </ul>

            {sparkData.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-foreground/50">{COPY.history}</p>
                <Sparkline data={sparkData} width={280} height={40} />
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`${lh('/compare')}?ids=${selected.id}`}
                className={cn(buttonVariants({ size: 'sm' }))}
              >
                {COPY.compare}
              </Link>
              <Link
                href={lh('/regions')}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                Regiões
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-2.5 py-2">
      <p className="text-[10px] text-foreground/50">{label}</p>
      <p className="truncate text-xs font-semibold">{value}</p>
    </div>
  );
}

function RankCard({
  title,
  icon,
  items,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  items: { id: string; name: string; hint: string; value: string; positive?: boolean }[];
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/98 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <p className="font-display text-sm font-semibold">{title}</p>
      </div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={it.id}>
            <button
              type="button"
              onClick={() => onSelect(it.id)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-muted"
            >
              <span className="min-w-0">
                <span className="mr-1.5 tabular-nums text-foreground/40">{i + 1}.</span>
                <span className="font-medium">{it.name}</span>
                <span className="block truncate text-[10px] text-foreground/50 sm:inline sm:before:content-['·_']">
                  {it.hint}
                </span>
              </span>
              <span
                className={cn(
                  'shrink-0 text-xs font-semibold tabular-nums',
                  it.positive ? 'text-primary' : 'text-destructive',
                )}
              >
                {it.value}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function MapPage() {
  return (
    <RequireAuth>
      <MapPageInner />
    </RequireAuth>
  );
}
