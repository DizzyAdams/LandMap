'use client';

import { useState, useEffect, useRef } from 'react';
import { RequireAuth } from '../../../components/RequireAuth';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Card,
  Badge,
  Stat,
  Progress,
  Sparkline,
  EmptyState,
  buttonVariants,
  cn,
} from '@landmap/ui';
import {
  Search,
  Filter,
  Layers,
  ArrowLeft,
  MapPin,
  SlidersHorizontal,
  TrendingUp,
  LandMapWordmark,
} from '../../../components/lovable/icons';
import { SpotlightCard } from '../../../components/SpotlightCard';
import {
  searchProperties,
  geoAutocomplete,
  geoReverse,
  type AutocompleteSuggestion,
  type ReverseResult,
  type Property as ApiProperty,
} from '../../../lib/api';
import { AssetDossierDrawer, AssetDossierDrawerBackdrop } from '../../../components/AssetDossierDrawer';
import { gradeToken, propertyGrade, propertyScore } from '../../../lib/geoMath';

const API_BASE = process.env.NEXT_PUBLIC_LANDMAP_API_BASE || '/api';

/* ─── Heatmap palette — resolved from the brand CSS tokens at runtime
   (--success → --primary → --warning). No literal hex anywhere; the
   gradient is interpolated from the same semantic colors used by the UI. ─── */
let paletteCache:
  | { low: [number, number, number]; mid: [number, number, number]; high: [number, number, number] }
  | null = null;

function resolvePalette() {
  if (paletteCache) return paletteCache;
  const resolve = (token: string): [number, number, number] => {
    if (typeof window === 'undefined') return [120, 90, 224];
    const probe = document.createElement('span');
    probe.style.color = `var(${token})`;
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe).color;
    document.body.removeChild(probe);
    const nums = (cs.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    if (cs.startsWith('rgb')) return [nums[0] ?? 120, nums[1] ?? 90, nums[2] ?? 224];
    // oklch/oklab fallback (channel order varies) — normalize to rgba-ish
    return [nums[1] ?? 120, nums[2] ?? 90, nums[3] ?? 224];
  };
  paletteCache = {
    low: resolve('--success'),
    mid: resolve('--primary'),
    high: resolve('--warning'),
  };
  return paletteCache;
}

function weightColor(w: number): string {
  const t = Math.max(0, Math.min(1, w));
  const { low, mid, high } = resolvePalette();
  const lerp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
  let rgb: [number, number, number];
  if (t < 0.5) {
    const k = t / 0.5;
    rgb = [lerp(low[0], mid[0], k), lerp(low[1], mid[1], k), lerp(low[2], mid[2], k)];
  } else {
    const k = (t - 0.5) / 0.5;
    rgb = [lerp(mid[0], high[0], k), lerp(mid[1], high[1], k), lerp(mid[2], high[2], k)];
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

type HeatPoint = {
  lat: number;
  lng: number;
  weight: number;
  neighborhood?: string;
  avgPrice?: number;
};

type Property = ApiProperty;

/** LandMap = inteligência de terrenos — cor única de marca para markers. */
const TERRAIN_MARKER_COLOR = 'var(--primary)';
/** Cap de markers no DOM (Leaflet) para manter FPS em datasets grandes. */
const MAX_MAP_MARKERS = 180;
/** Cap mobile (menos DOM = scroll/touch mais fluido). */
const MAX_MAP_MARKERS_MOBILE = 80;
/** Cap da lista lateral (scroll virtual leve via slice). */
const MAX_SIDEBAR_ITEMS = 40;

function MapPageInner() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  /** Filtros fechados no mobile por padrão (mapa em foco). */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  /** Filtro grade investidor: '' = todas */
  const [gradeFilter, setGradeFilter] = useState<string>('');
  const [minScore, setMinScore] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<Property | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [reverse, setReverse] = useState<
    (ReverseResult & {
      landmap?: {
        nearbyCount?: number;
        topGradeCount?: number;
        avgScore?: number;
        nearby?: Array<{ id: string; title: string; grade?: string; distanceKm?: number }>;
      };
    }) | null
  >(null);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);

  /* ─── Heatmap de preço (toggle) ─── */
  const [heatCity, setHeatCity] = useState('Curitiba');
  const [heat, setHeat] = useState<HeatPoint[]>([]);
  const [showHeat, setShowHeat] = useState(false);
  const [heatLoading, setHeatLoading] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      setIsMobile(mq.matches);
      // Desktop: filtros abertos; mobile: fechados
      setFiltersOpen(!mq.matches);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (!showHeat) return;
    let active = true;
    setHeatLoading(true);
    fetch(`${API_BASE}/market/heatmap?city=${encodeURIComponent(heatCity)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { points: [] }))
      .then((d: { points?: HeatPoint[] }) => {
        if (active) setHeat(d.points ?? []);
      })
      .catch(() => {
        if (active) setHeat([]);
      })
      .finally(() => {
        if (active) setHeatLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showHeat, heatCity]);

  function toggleHeat() {
    setShowHeat((v) => !v);
  }

  // Debounced worldwide geo-autocomplete (open, MIT API)
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      geoAutocomplete(q)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  function selectSuggestion(s: AutocompleteSuggestion) {
    setQuery(s.label);
    setSuggestions([]);
    setActiveIdx(-1);
    flyToRef.current?.(s.lat, s.lng);
  }

  async function handleMapClick(lat: number, lng: number) {
    try {
      setReverse(await geoReverse(lat, lng));
    } catch {
      setReverse(null);
    }
  }

  // Busca só terrenos (produto LandMap = terrenos). Debounce 350ms.
  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      setLoading(true);
      searchProperties({ q: query.trim() || undefined, type: 'terreno' })
        .then((data) => {
          if (!active) return;
          const terrains = (data?.items ?? []).filter(
            (item) =>
              item.latitude != null &&
              item.longitude != null &&
              (item.type === 'terreno' || !item.type),
          );
          setItems(terrains);
        })
        .catch(() => {
          if (active) setItems([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  // Filtro preço + grade/score investidor + hard-cap (Leaflet)
  const markerCap = isMobile ? MAX_MAP_MARKERS_MOBILE : MAX_MAP_MARKERS;
  const filteredItems = items
    .filter((item) => item.price >= minPrice && item.price <= maxPrice)
    .filter((item) => !gradeFilter || propertyGrade(item) === gradeFilter)
    .filter((item) => propertyScore(item) >= minScore)
    .sort((a, b) => propertyScore(b) - propertyScore(a))
    .slice(0, markerCap);

  const brl = (n: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(n);

  const brlCompact = (n: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(n);

  // KPIs — paleta semântica da marca (indigo/success/warning/chart)
  const avgPriceM2 =
    filteredItems.length > 0
      ? Math.round(
          filteredItems.reduce((sum, it) => sum + (it.areaM2 ? it.price / it.areaM2 : 0), 0) /
            (filteredItems.filter((it) => it.areaM2).length || 1),
        )
      : 7200;

  // Decorative price-trend sparkline derived from the current average (no literal data).
  const priceTrend = [0.9, 0.94, 0.97, 1.0, 1.04, 1.08].map((k) => Math.round(avgPriceM2 * k));

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-7xl flex-col bg-background px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-4 sm:pt-6 md:pb-10">
      <header className="sticky top-0 z-30 -mx-3 flex items-center justify-between border-b border-[var(--border)]/60 bg-background/95 px-3 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        <Link
          href={lh('/plans')}
          aria-label="Voltar"
          className="grid h-11 w-11 place-items-center rounded-full transition hover:bg-muted active:scale-95 touch-manipulation"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-col items-center">
          <LandMapWordmark />
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-primary sm:hidden">
            Free · terrenos
          </span>
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="map-filters"
          className={cn(
            'grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] transition active:scale-95 touch-manipulation sm:hidden',
            filtersOpen ? 'bg-primary text-primary-foreground' : 'bg-[var(--card)] text-[var(--muted-foreground)]',
          )}
          aria-label={filtersOpen ? 'Fechar filtros' : 'Abrir filtros'}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <div className="hidden w-9 sm:block" />
      </header>

      {/* Brand chip — desktop only */}
      <div className="pointer-events-none fixed bottom-20 left-3 z-[500] hidden sm:bottom-6 sm:left-6 sm:block">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="font-display text-xs font-bold tracking-tight text-[var(--primary)]">LandMap Free</span>
        </div>
      </div>

      {loading && (
        <div className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-[100] flex justify-center sm:inset-0 sm:grid sm:place-items-center">
          <div className="flex items-center gap-2.5 rounded-full bg-[var(--card)]/95 px-4 py-2 text-sm font-medium text-foreground/75 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
            Carregando terrenos…
          </div>
        </div>
      )}

      {/* Título — compacto no mobile (mapa em foco) */}
      <div className="mt-2 hidden sm:mt-6 sm:block">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <TrendingUp className="h-3 w-3" />
          Inteligência Geoespacial · Free
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Mapa de terrenos</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Explore preços por m² e heatmap de valorização — acesso gratuito.
        </p>
      </div>

      {/* KPIs: escondidos no mobile (economiza altura); 4 no desktop */}
      <section className="mt-6 hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4">
        <Stat label="Preço médio /m²" value={brl(avgPriceM2)} />
        <Stat label="Terrenos" value={String(filteredItems.length)} />
        <Stat label="Valorização YoY" value="+2,4%" trend={2.4} />
        <Card className="p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Confiança dos dados</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">94%</p>
          <Progress value={94} className="mt-3" />
          <Sparkline data={priceTrend} width={120} height={24} className="mt-3" aria-label="Tendência de preço" />
        </Card>
      </section>

      {/* Busca sempre visível + filtros colapsáveis */}
      <Card className="mt-2 space-y-3 p-3 sm:mt-6 sm:space-y-4 sm:p-5" id="map-filters">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded={suggestions.length > 0}
            aria-controls="geo-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={activeIdx >= 0 ? `geo-opt-${activeIdx}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx((i) => Math.min(suggestions.length - 1, i + 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx((i) => Math.max(0, i - 1));
              } else if (e.key === 'Enter' && activeIdx >= 0 && suggestions[activeIdx]) {
                e.preventDefault();
                selectSuggestion(suggestions[activeIdx]);
              } else if (e.key === 'Escape') {
                setSuggestions([]);
                setActiveIdx(-1);
              }
            }}
            placeholder="Buscar cidade…"
            aria-label="Buscar cidade de terrenos"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-3 pl-10 pr-4 text-base text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)] sm:py-2.5 sm:text-sm"
          />
          {suggestions.length > 0 && (
            <ul
              id="geo-suggestions"
              role="listbox"
              aria-label="Sugestões de localização"
              className="absolute z-40 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--card)]/95 shadow-xl backdrop-blur"
            >
              {suggestions.map((s, i) => (
                <li
                  key={s.id}
                  id={`geo-opt-${i}`}
                  role="option"
                  aria-selected={i === activeIdx}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => selectSuggestion(s)}
                  className={cn(
                    'cursor-pointer px-4 py-3 text-sm transition sm:py-2.5',
                    i === activeIdx ? 'bg-primary/10 text-primary' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                  )}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:hidden">
          <span className="text-xs text-[var(--muted-foreground)]">
            Terrenos · até {markerCap} no mapa
          </span>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary"
          >
            <Filter className="h-3.5 w-3.5" />
            {filtersOpen ? 'Ocultar filtros' : 'Filtros'}
          </button>
        </div>

        {filtersOpen && (
          <div className="space-y-4 border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-3">
              <label className="w-20 shrink-0 text-xs text-[var(--muted-foreground)] sm:w-28">Raio:</label>
              <input
                type="range"
                min={5}
                max={200}
                step={5}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                aria-label="Raio de busca em quilômetros"
                className="h-2 flex-1 accent-[var(--primary)]"
              />
              <span className="w-14 text-right text-xs tabular-nums text-[var(--muted-foreground)]">{radiusKm} km</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <label className="w-16 shrink-0 text-xs text-[var(--muted-foreground)]">Mín:</label>
                <input
                  type="range"
                  min={0}
                  max={5_000_000}
                  step={50_000}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  aria-label="Preço mínimo"
                  className="h-2 flex-1 accent-[var(--primary)]"
                />
                <span className="w-20 text-right text-xs tabular-nums text-[var(--muted-foreground)]">{brlCompact(minPrice)}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 shrink-0 text-xs text-[var(--muted-foreground)]">Máx:</label>
                <input
                  type="range"
                  min={0}
                  max={5_000_000}
                  step={50_000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  aria-label="Preço máximo"
                  className="h-2 flex-1 accent-[var(--primary)]"
                />
                <span className="w-20 text-right text-xs tabular-nums text-[var(--muted-foreground)]">{brlCompact(maxPrice)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(buttonVariants({ variant: 'default', size: 'sm' }))} aria-current="true">
                Terrenos
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">Acesso gratuito · Free</span>
            </div>

            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-medium text-[var(--muted-foreground)]">Radar investidor (grade)</p>
              <div className="flex flex-wrap gap-1.5">
                {(['', 'A', 'B', 'C', 'D', 'F'] as const).map((g) => (
                  <button
                    key={g || 'all'}
                    type="button"
                    onClick={() => setGradeFilter(g)}
                    className={cn(
                      'min-h-9 rounded-lg border px-2.5 text-xs font-semibold transition touch-manipulation',
                      gradeFilter === g
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]',
                    )}
                  >
                    {g || 'Todas'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="w-20 shrink-0 text-xs text-[var(--muted-foreground)]">Score min</label>
                <input
                  type="range"
                  min={0}
                  max={90}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  aria-label="Score mínimo de investimento"
                  className="h-2 flex-1 accent-[var(--primary)]"
                />
                <span className="w-10 text-right text-xs tabular-nums text-[var(--muted-foreground)]">
                  {minScore}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-3">
              <Layers className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                value={heatCity}
                onChange={(e) => setHeatCity(e.target.value)}
                aria-label="Cidade do heatmap"
                placeholder="Cidade heatmap"
                className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] sm:max-w-[10rem]"
              />
              <button
                type="button"
                onClick={toggleHeat}
                aria-pressed={showHeat}
                className={cn(buttonVariants({ variant: showHeat ? 'default' : 'ghost', size: 'sm' }), 'min-h-10')}
              >
                {showHeat ? 'Ocultar heat' : 'Heatmap'}
              </button>
              {heatLoading && <span className="text-xs text-[var(--muted-foreground)]">…</span>}
            </div>

            {reverse && (
              <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--muted)] p-3 text-sm">
                <p className="font-medium text-primary">Local selecionado</p>
                <p className="mt-1 text-[var(--foreground)]/80">{reverse.label}</p>
                {reverse.landmap && (
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Radar: {reverse.landmap.nearbyCount ?? 0} ativos · {reverse.landmap.topGradeCount ?? 0}{' '}
                    grade A/B · score médio {reverse.landmap.avgScore ?? '—'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <section className="mt-3 flex-1 sm:mt-6">
        <MapView
          items={filteredItems}
          loading={loading}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          locale={locale}
          onMapClick={handleMapClick}
          onSelectAsset={setSelectedAsset}
          flyToRef={flyToRef}
          heat={heat}
          showHeat={showHeat}
          isMobile={isMobile}
        />
      </section>

      <AssetDossierDrawerBackdrop open={!!selectedAsset} onClose={() => setSelectedAsset(null)} />
      <AssetDossierDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} locale={locale} />
    </main>
  );
}

function MapView({
  items,
  loading,
  sidebarOpen,
  setSidebarOpen,
  locale,
  onMapClick,
  onSelectAsset,
  flyToRef,
  heat,
  showHeat,
  isMobile = false,
}: {
  items: Property[];
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  locale: string;
  onMapClick?: (lat: number, lng: number) => void;
  onSelectAsset?: (p: Property) => void;
  flyToRef?: { current: ((lat: number, lng: number) => void) | null };
  heat: HeatPoint[];
  showHeat: boolean;
  isMobile?: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatRef = useRef<any[]>([]);
  const isMobileRef = useRef(isMobile);
  isMobileRef.current = isMobile;
  const onSelectRef = useRef(onSelectAsset);
  onSelectRef.current = onSelectAsset;

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) return;

    let cancelled = false;

    // Carrega Leaflet (JS+CSS) dinamicamente via CDN — evita quebrar o SSR
    function loadLeaflet(): Promise<any> {
      return new Promise((resolve, reject) => {
        if ((window as any).L) return resolve((window as any).L);
        const cssId = 'leaflet-css';
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.crossOrigin = '';
        s.onload = () => resolve((window as any).L);
        s.onerror = () => reject(new Error('Falha ao carregar Leaflet'));
        document.head.appendChild(s);
      });
    }

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapRef.current || mapInstance.current) return;

        const mobile = isMobileRef.current;
        const map = L.map(mapRef.current, {
          center: [-15.7939, -47.8828],
          zoom: mobile ? 5 : 4,
          zoomControl: false,
          // Touch-friendly defaults (iOS/Android)
          tapTolerance: 20,
          touchZoom: true,
          dragging: true,
          doubleClickZoom: true,
          scrollWheelZoom: !mobile,
          preferCanvas: true,
        });

        L.control
          .zoom({
            position: mobile ? 'bottomright' : 'topleft',
          })
          .addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
          // Menos tiles no mobile
          updateWhenIdle: mobile,
          keepBuffer: mobile ? 1 : 2,
        }).addTo(map);

        // Corrige ícones default do Leaflet (caminho de imagem quebrado em bundlers)
        const iconProto = (L.Icon.Default as any).prototype as any;
        delete iconProto._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        mapInstance.current = map;
        // invalidateSize após layout mobile (header/filtros)
        const fixSize = () => {
          try {
            map.invalidateSize({ animate: false });
          } catch {
            /* ignore */
          }
        };
        setTimeout(fixSize, 80);
        setTimeout(fixSize, 320);
        window.addEventListener('resize', fixSize);
        window.addEventListener('orientationchange', fixSize);
        (map as any).__landmapFixSize = fixSize;

        if (flyToRef) {
          flyToRef.current = (lat: number, lng: number) => {
            map.flyTo([lat, lng], mobile ? 12 : 13, { duration: 0.65 });
          };
        }
        if (onMapClick) {
          map.on('click', (e: any) => onMapClick(e.latlng.lat, e.latlng.lng));
        }
      })
      .catch(() => {
        /* silencioso: mapa reaparece no próximo mount */
      });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        const fix = (mapInstance.current as any).__landmapFixSize;
        if (fix) {
          window.removeEventListener('resize', fix);
          window.removeEventListener('orientationchange', fix);
        }
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // Map is initialized exactly once on mount. flyToRef is a stable ref and
    // onMapClick is read at event time via the closure; re-running this effect
    // would tear down and recreate the Leaflet instance on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalcula tamanho do Leaflet quando troca mobile/desktop ou reabre filtros
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const t = setTimeout(() => {
      try {
        map.invalidateSize({ animate: false });
      } catch {
        /* ignore */
      }
    }, 120);
    return () => clearTimeout(t);
  }, [isMobile, sidebarOpen]);

  // Markers: circleMarker em layerGroup (bem mais leve que divIcon × N)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (items.length === 0) return;

    const group = L.layerGroup();
    const bounds: [number, number][] = [];
    const money = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });

    // Resolve tokens CSS (grade colors) — sem hex de marca no source
    const resolveToken = (token: string, fallback: string) => {
      const probe = document.createElement('span');
      probe.style.color = token;
      probe.style.position = 'absolute';
      probe.style.visibility = 'hidden';
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color || fallback;
      document.body.removeChild(probe);
      return c;
    };
    const gradeFill: Record<string, string> = {
      A: resolveToken('var(--success)', 'rgb(34, 197, 94)'),
      B: resolveToken('var(--primary)', 'rgb(120, 90, 224)'),
      C: resolveToken('var(--accent)', 'rgb(140, 120, 230)'),
      D: resolveToken('var(--warning)', 'rgb(234, 179, 8)'),
      F: resolveToken('var(--danger)', 'rgb(239, 68, 68)'),
    };
    const defaultFill = gradeFill.B;

    // Touch targets maiores no mobile (raio 9 vs 6)
    const radius = isMobileRef.current ? 9 : 6;
    const weight = isMobileRef.current ? 2 : 1.5;
    const pad = isMobileRef.current ? 24 : 30;
    const maxZ = isMobileRef.current ? 12 : 13;

    for (const item of items) {
      if (item.latitude == null || item.longitude == null) continue;
      const latlng: [number, number] = [item.latitude, item.longitude];
      bounds.push(latlng);

      const g = propertyGrade(item);
      const sc = propertyScore(item);
      const cap = item.capRate ?? item.invest?.capRate;
      const fill = gradeFill[g] || defaultFill;
      const marker = L.circleMarker(latlng, {
        radius: g === 'A' || g === 'B' ? radius + 1.5 : radius,
        fillColor: fill,
        color: '#fff',
        weight,
        fillOpacity: 0.92,
        opacity: 1,
      });
      marker.bindPopup(
        `<strong>${item.title}</strong><br/>` +
          `<span style="opacity:.8">Grade <b>${g}</b> · score ${Math.round(sc)}</span><br/>` +
          `${item.city}, ${item.state}<br/>` +
          `${item.areaM2} m² &middot; ${money.format(item.price)}` +
          (cap != null ? `<br/>Cap rate ${(cap * 100).toFixed(2)}%` : '') +
          (item.areaM2
            ? `<br/>${money.format(Math.round(item.price / item.areaM2))}/m²`
            : ''),
        { maxWidth: isMobileRef.current ? 240 : 300, autoPanPadding: [16, 16] },
      );
      marker.on('click', (e: { originalEvent?: { stopPropagation?: () => void } }) => {
        e.originalEvent?.stopPropagation?.();
        onSelectRef.current?.(item);
      });
      group.addLayer(marker);
    }

    group.addTo(map);
    markersRef.current = [group];

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [pad, pad], maxZoom: maxZ });
    }
  }, [items]);

  // Heatmap: cap + circleMarker (sem recriar se vazio)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;

    heatRef.current.forEach((m) => map.removeLayer(m));
    heatRef.current = [];

    if (!showHeat || heat.length === 0) return;

    const group = L.layerGroup();
    const money = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    });
    // Limita densidade do heatmap (perf) — mais agressivo no mobile
    const heatCap = isMobileRef.current ? 60 : 120;
    const points =
      heat.length > heatCap
        ? heat.filter((_, i) => i % Math.ceil(heat.length / heatCap) === 0)
        : heat;

    for (const p of points) {
      const color = weightColor(p.weight);
      group.addLayer(
        L.circleMarker([p.lat, p.lng], {
          radius: (isMobileRef.current ? 4 : 5) + p.weight * (isMobileRef.current ? 10 : 14),
          fillColor: color,
          color,
          weight: 0.5,
          fillOpacity: 0.4,
        }).bindPopup(
          `<strong>${p.neighborhood ?? 'Região'}</strong><br/>` +
            `Preço médio: ${money.format(p.avgPrice ?? 0)}<br/>` +
            `Densidade: ${Math.round((p.weight ?? 0) * 100)}%`,
        ),
      );
    }
    group.addTo(map);
    heatRef.current = [group];
  }, [heat, showHeat]);

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Carregando terrenos no mapa…'
          : `${items.length} terreno${items.length === 1 ? '' : 's'} no mapa.`}
      </p>
      <div className="w-full lg:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-0.5 sm:p-1">
          <div
            ref={mapRef}
            role="region"
            aria-label="Mapa de terrenos"
            className={cn(
              'relative w-full overflow-hidden rounded-xl sm:rounded-lg',
              // Mobile: mapa alto (viewport) — prioridade touch/visual
              'h-[min(58dvh,480px)] min-h-[280px] sm:h-[480px] lg:h-[520px]',
            )}
            style={{ zIndex: 0, touchAction: 'pan-x pan-y' }}
          >
            {loading && (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[var(--card)]/60">
                <span
                  className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="sr-only">Carregando terrenos no mapa…</span>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <EmptyState
                  title="Nenhum terreno neste filtro"
                  description="Ajuste o preço ou a busca por cidade."
                  className="border-0 bg-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'min-h-11 w-full touch-manipulation',
          )}
        >
          {sidebarOpen ? 'Ocultar resultados' : `Mostrar terrenos (${items.length})`}
        </button>
      </div>

      <div className={`${sidebarOpen ? 'block' : 'hidden'} space-y-3 lg:block`}>
        <p className="text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {items.length} terreno{items.length === 1 ? '' : 's'}
          {items.length > MAX_SIDEBAR_ITEMS ? ` · lista: ${MAX_SIDEBAR_ITEMS}` : ''}
        </p>
        <ul
          role="list"
          className="grid max-h-[min(40dvh,320px)] gap-3 overflow-y-auto overscroll-contain pr-1 sm:max-h-[480px] lg:max-h-[520px]"
        >
          {items.slice(0, MAX_SIDEBAR_ITEMS).map((item) => {
            const g = propertyGrade(item);
            return (
              <li key={item.id}>
                <SpotlightCard>
                  <button
                    type="button"
                    onClick={() => onSelectRef.current?.(item)}
                    className="w-full rounded-xl p-4 text-left transition duration-300 active:scale-[0.99] group-hover:-translate-y-1 group-hover:scale-[1.01]"
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1 inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-[var(--primary-foreground)]"
                        style={{ background: gradeToken(g) }}
                      >
                        {g}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                          <MapPin className="h-3 w-3" />
                          {item.city}, {item.state} · {item.areaM2} m²
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge variant="info">{item.type || 'Terreno'}</Badge>
                          <span className="text-[10px] tabular-nums text-[var(--muted-foreground)]">
                            score {Math.round(propertyScore(item))}
                            {item.capRate != null || item.invest?.capRate != null
                              ? ` · cap ${(((item.capRate ?? item.invest?.capRate) || 0) * 100).toFixed(1)}%`
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </SpotlightCard>
              </li>
            );
          })}
        </ul>
      </div>
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
