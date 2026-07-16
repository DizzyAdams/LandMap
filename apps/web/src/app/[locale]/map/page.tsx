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
} from '../../../lib/api';

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

type Property = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  latitude?: number;
  longitude?: number;
  type?: string;
  modality?: string;
};

/** LandMap = inteligência de terrenos — cor única de marca para markers. */
const TERRAIN_MARKER_COLOR = 'var(--primary)';
/** Cap de markers no DOM (Leaflet) para manter FPS em datasets grandes. */
const MAX_MAP_MARKERS = 180;
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [reverse, setReverse] = useState<ReverseResult | null>(null);
  const flyToRef = useRef<((lat: number, lng: number) => void) | null>(null);

  /* ─── Heatmap de preço (toggle) ─── */
  const [heatCity, setHeatCity] = useState('Curitiba');
  const [heat, setHeat] = useState<HeatPoint[]>([]);
  const [showHeat, setShowHeat] = useState(false);
  const [heatLoading, setHeatLoading] = useState(false);

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

  // Filtro de preço + hard-cap (performance do Leaflet)
  const filteredItems = items
    .filter((item) => item.price >= minPrice && item.price <= maxPrice)
    .slice(0, MAX_MAP_MARKERS);

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
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/market')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      {/* Brand chip - bottom left */}
      <div className="pointer-events-none fixed bottom-4 left-4 z-[999] md:bottom-6 md:left-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="font-display text-xs font-bold tracking-tight text-[var(--primary)]">LandMap</span>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="pointer-events-none fixed inset-0 z-[100] grid place-items-center">
          <div className="flex items-center gap-2.5 rounded-full bg-[var(--card)]/90 px-5 py-2.5 text-sm font-medium text-foreground/75 shadow-sm backdrop-blur">
            <span className="inline-block h-2 w-2 animate-ping rounded-full bg-[var(--primary)]" />
            Carregando inteligência territorial…
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <TrendingUp className="h-3 w-3" />
          Inteligência Geoespacial
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Mapa de valorização</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Explore preços por m², ranking de regiões e heatmap de valorização no Brasil.
        </p>
      </div>

      {/* KPIs do mapa — tokens semânticos da marca (indigo Lovable) */}
      <section className="mt-6 grid grid-cols-2 gap-3 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 sm:grid-cols-4">
        <Stat label="Preço médio /m²" value={brl(avgPriceM2)} />
        <Stat label="Terrenos no mapa" value={String(filteredItems.length)} />
        <Stat label="Valorização YoY" value="+2,4%" trend={2.4} />
        <Card className="p-5">
          <p className="text-xs text-[var(--muted-foreground)]">Confiança dos dados</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--foreground)]">94%</p>
          <Progress value={94} className="mt-3" />
          <Sparkline data={priceTrend} width={120} height={24} className="mt-3" aria-label="Tendência de preço" />
        </Card>
      </section>

      {/* Painel de filtros */}
      <Card className="mt-6 space-y-4 p-5 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        {/* Search input */}
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
            placeholder="Buscar cidade, estado ou país…"
            aria-label="Buscar localização no mundo todo"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)]"
          />
          {suggestions.length > 0 && (
            <ul
              id="geo-suggestions"
              role="listbox"
              aria-label="Sugestões de localização"
              className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]/95 shadow-xl backdrop-blur"
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
                    'cursor-pointer px-4 py-2.5 text-sm transition',
                    i === activeIdx ? 'bg-primary/10 text-primary' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                  )}
                >
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Radius slider */}
        <div className="flex items-center gap-4">
          <label className="text-xs text-[var(--muted-foreground)] w-28">Raio de busca:</label>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            aria-label="Raio de busca em quilômetros"
            className="flex-1 accent-[var(--primary)]"
          />
          <span className="text-xs tabular-nums text-[var(--muted-foreground)] w-16 text-right">{radiusKm} km</span>
        </div>

        {/* Price range */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--muted-foreground)]">Preço mín.:</label>
            <input
              type="range"
              min={0}
              max={5_000_000}
              step={50_000}
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              aria-label="Preço mínimo"
              className="flex-1 accent-[var(--primary)]"
            />
            <span className="text-xs tabular-nums text-[var(--muted-foreground)] w-24 text-right">{brlCompact(minPrice)}</span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--muted-foreground)]">Preço máx.:</label>
            <input
              type="range"
              min={0}
              max={5_000_000}
              step={50_000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              aria-label="Preço máximo"
              className="flex-1 accent-[var(--primary)]"
            />
            <span className="text-xs tabular-nums text-[var(--muted-foreground)] w-24 text-right">{brlCompact(maxPrice)}</span>
          </div>
        </div>

        {/* Escopo: apenas terrenos */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4">
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Filter className="h-3.5 w-3.5" />
            Escopo:
          </span>
          <span
            className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
            aria-current="true"
          >
            Terrenos
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            Apenas terrenos · até {MAX_MAP_MARKERS} no mapa
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: TERRAIN_MARKER_COLOR }}
            />
            Terreno (preço / m²)
          </span>
        </div>

        {/* Heatmap de preço */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Layers className="h-3.5 w-3.5" />
            Heatmap de preço:
          </span>
          <input
            value={heatCity}
            onChange={(e) => setHeatCity(e.target.value)}
            aria-label="Cidade do heatmap"
            placeholder="Cidade"
            className="w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
          />
          <button
            type="button"
            onClick={toggleHeat}
            aria-pressed={showHeat}
            className={cn(buttonVariants({ variant: showHeat ? 'default' : 'ghost', size: 'sm' }))}
          >
            {showHeat ? 'Ocultar heatmap' : 'Mostrar heatmap'}
          </button>
          {heatLoading && <span className="text-xs text-[var(--muted-foreground)]">Carregando…</span>}
        </div>

        {reverse && (
          <div className="rounded-lg border border-[var(--border)]/60 bg-[var(--muted)] p-3 text-sm text-[var(--foreground)]">
            <p className="font-medium text-primary">Local selecionado</p>
            <p className="mt-1">{reverse.label}</p>
            {reverse.pricePerM2 != null && (
              <p className="mt-1 text-[var(--muted-foreground)]">
                Preço/m²:{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
                  reverse.pricePerM2,
                )}
                {reverse.yoy != null && ` · ${reverse.yoy > 0 ? '+' : ''}${reverse.yoy}% a.a.`}
              </p>
            )}
            {reverse.zoning && (
              <p className="mt-1 text-[var(--muted-foreground)]">
                Zona: {reverse.zoning}
                {reverse.schools != null && ` · Escolas: ${reverse.schools}`}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Mapa + sidebar de resultados */}
      <section className="mt-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <MapView
          items={filteredItems}
          loading={loading}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          locale={locale}
          onMapClick={handleMapClick}
          flyToRef={flyToRef}
          heat={heat}
          showHeat={showHeat}
        />
      </section>
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
  flyToRef,
  heat,
  showHeat,
}: {
  items: Property[];
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  locale: string;
  onMapClick?: (lat: number, lng: number) => void;
  flyToRef?: { current: ((lat: number, lng: number) => void) | null };
  heat: HeatPoint[];
  showHeat: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatRef = useRef<any[]>([]);

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

        const map = L.map(mapRef.current, {
          center: [-15.7939, -47.8828],
          zoom: 4,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
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
        setTimeout(() => map.invalidateSize(), 200);

        if (flyToRef) {
          flyToRef.current = (lat: number, lng: number) => {
            map.flyTo([lat, lng], 13, { duration: 0.8 });
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
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
    // Map is initialized exactly once on mount. flyToRef is a stable ref and
    // onMapClick is read at event time via the closure; re-running this effect
    // would tear down and recreate the Leaflet instance on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Resolve --primary once (token, sem hex de marca no source)
    const probe = document.createElement('span');
    probe.style.color = 'var(--primary)';
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    document.body.appendChild(probe);
    const fill = getComputedStyle(probe).color || 'rgb(120, 90, 224)';
    document.body.removeChild(probe);

    // Cap já vem do parent; circleMarker usa path SVG nativo (rápido)
    for (const item of items) {
      if (item.latitude == null || item.longitude == null) continue;
      const latlng: [number, number] = [item.latitude, item.longitude];
      bounds.push(latlng);

      const marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: fill,
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
        opacity: 1,
      }).bindPopup(
        `<strong>${item.title}</strong><br/>${item.city}, ${item.state}<br/>` +
          `${item.areaM2} m² &middot; ${money.format(item.price)}` +
          (item.areaM2
            ? `<br/>${money.format(Math.round(item.price / item.areaM2))}/m²`
            : ''),
      );
      group.addLayer(marker);
    }

    group.addTo(map);
    markersRef.current = [group];

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
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
    // Limita densidade do heatmap (perf)
    const points = heat.length > 120 ? heat.filter((_, i) => i % Math.ceil(heat.length / 120) === 0) : heat;

    for (const p of points) {
      const color = weightColor(p.weight);
      group.addLayer(
        L.circleMarker([p.lat, p.lng], {
          radius: 5 + p.weight * 14,
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Carregando terrenos no mapa…'
          : `${items.length} terreno${items.length === 1 ? '' : 's'} no mapa.`}
      </p>
      <div className="lg:col-span-2 w-full">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1">
          <div
            ref={mapRef}
            role="region"
            aria-label="Mapa de terrenos"
            className="relative h-[360px] w-full overflow-hidden rounded-lg sm:h-[480px] lg:h-[520px]"
            style={{ zIndex: 0 }}
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
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full')}
        >
          {sidebarOpen ? 'Ocultar resultados' : `Mostrar terrenos (${items.length})`}
        </button>
      </div>

      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block space-y-3`}>
        <p className="text-xs text-[var(--muted-foreground)]" aria-live="polite">
          {items.length} terreno{items.length === 1 ? '' : 's'}
          {items.length > MAX_SIDEBAR_ITEMS ? ` · lista: ${MAX_SIDEBAR_ITEMS}` : ''}
        </p>
        <ul
          role="list"
          className="grid max-h-[360px] gap-3 overflow-y-auto pr-1 sm:max-h-[480px] lg:max-h-[520px]"
        >
          {items.slice(0, MAX_SIDEBAR_ITEMS).map((item) => (
            <li key={item.id}>
              <SpotlightCard>
                <Link
                  href={`/${locale}/regions`}
                  className="block rounded-xl p-4 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--primary)]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-[var(--muted-foreground)]">{item.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                        <MapPin className="h-3 w-3" />
                        {item.city}, {item.state} · {item.areaM2} m²
                      </p>
                      <Badge variant="info" className="mt-2">
                        Terreno
                      </Badge>
                    </div>
                  </div>
                </Link>
              </SpotlightCard>
            </li>
          ))}
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
