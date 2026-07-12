'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyState } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { searchProperties, geoAutocomplete, geoReverse, type AutocompleteSuggestion, type GeoFeature, type ReverseResult } from '../../../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_LANDMAP_API_BASE || '/api';

type HeatPoint = {
  lat: number;
  lng: number;
  weight: number;
  neighborhood?: string;
  avgPrice?: number;
};

/** Interpola emerald → cyan → violet conforme o peso (0–1). */
function weightColor(w: number): string {
  const t = Math.max(0, Math.min(1, w));
  const emerald = [52, 211, 153];
  const cyan = [34, 211, 238];
  const violet = [167, 139, 250];
  const lerp = (a: number, b: number, k: number) => Math.round(a + (b - a) * k);
  let rgb: [number, number, number];
  if (t < 0.5) {
    const k = t / 0.5;
    rgb = [lerp(emerald[0], cyan[0], k), lerp(emerald[1], cyan[1], k), lerp(emerald[2], cyan[2], k)];
  } else {
    const k = (t - 0.5) / 0.5;
    rgb = [lerp(cyan[0], violet[0], k), lerp(cyan[1], violet[1], k), lerp(cyan[2], violet[2], k)];
  }
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

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

const MARKER_COLORS: Record<string, string> = {
  apartamento: '#3b82f6', // blue
  casa: '#22c55e',        // green
  terreno: '#f97316',     // orange
  comercial: '#a855f7',   // purple
};

function getMarkerColor(type?: string): string {
  return MARKER_COLORS[type || ''] || '#737373';
}

export default function MapPage() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'todos' | 'apartamento' | 'casa' | 'terreno' | 'comercial'>('todos');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

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

  useEffect(() => {
    let active = true;
    setLoading(true);
    // Use the shared API client (honors NEXT_PUBLIC_LANDMAP_API_BASE) instead of a
    // hardcoded origin so the map works in every environment.
    searchProperties({ q: query.trim() || undefined })
      .then((data) => {
        if (!active) return;
        setItems(
          (data?.items ?? []).filter((item) => item.latitude != null && item.longitude != null),
        );
      })
      .catch(() => {
        if (!active) return;
        setItems([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [query]);

  // Filter by price range
  const filteredItems = items.filter(
    (item) =>
      item.price >= minPrice &&
      item.price <= maxPrice &&
      (typeFilter === 'todos' || item.type === typeFilter),
  );

  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <div className="mb-3"><span className="kicker">Inteligência Geoespacial</span></div>
              <h1 className="text-3xl font-semibold tracking-tight text-gradient">Mapa mundial</h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground-lovable)]">
                Navegue por localizações disponíveis ou refine por cidade.
              </p>
            </div>
            <Link href={`/${locale}`} className="text-xs text-[var(--muted-foreground-lovable)] transition hover:text-[var(--foreground)]">
              Voltar para Home
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4 p-4 space-y-4">
          {/* Search input */}
          <div className="relative">
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
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(suggestions.length - 1, i + 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(0, i - 1)); }
                else if (e.key === 'Enter' && activeIdx >= 0 && suggestions[activeIdx]) { e.preventDefault(); selectSuggestion(suggestions[activeIdx]); }
                else if (e.key === 'Escape') { setSuggestions([]); setActiveIdx(-1); }
              }}
              placeholder="Buscar cidade, estado ou país…"
              aria-label="Buscar localização no mundo todo"
              className="w-full rounded-lg border border-[var(--border-lovable)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground-lovable)] outline-none transition focus:border-[var(--primary)]"
            />
            {suggestions.length > 0 && (
              <ul
                id="geo-suggestions"
                role="listbox"
                aria-label="Sugestões de localização"
                className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-[var(--border-lovable)] bg-[var(--card)]/95 shadow-xl backdrop-blur"
              >
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    id={`geo-opt-${i}`}
                    role="option"
                    aria-selected={i === activeIdx}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => selectSuggestion(s)}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition ${i === activeIdx ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--muted-foreground-lovable)] hover:text-[var(--foreground)]'}`}
                  >
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Radius slider */}
          <div className="flex items-center gap-4">
            <label className="text-xs text-[var(--muted-foreground-lovable)] w-28">Raio de busca:</label>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              aria-label="Raio de busca em quilômetros"
              className="flex-1 accent-neutral-50"
            />
            <span className="text-xs text-[var(--muted-foreground-lovable)] w-16 text-right">{radiusKm} km</span>
          </div>

          {/* Price range */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-[var(--muted-foreground-lovable)]">Preço mín.:</label>
              <input
                type="range"
                min={0}
                max={5_000_000}
                step={50_000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                aria-label="Preço mínimo"
                className="flex-1 accent-neutral-50"
              />
              <span className="text-xs text-[var(--muted-foreground-lovable)] w-24 text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(minPrice)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[var(--muted-foreground-lovable)]">Preço máx.:</label>
              <input
                type="range"
                min={0}
                max={5_000_000}
                step={50_000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Preço máximo"
                className="flex-1 accent-neutral-50"
              />
              <span className="text-xs text-[var(--muted-foreground-lovable)] w-24 text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(maxPrice)}
              </span>
            </div>
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-lovable)] pt-4">
            <span className="text-xs text-[var(--muted-foreground-lovable)]">Tipo de imóvel:</span>
            {(['todos', 'apartamento', 'casa', 'terreno', 'comercial'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                aria-pressed={typeFilter === t}
                className={`btn ${typeFilter === t ? 'btn-primary' : 'btn-ghost'} !px-3 !py-1 !text-xs capitalize`}
              >
                {t === 'terreno' ? '🏞️ Terreno' : t}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-[var(--muted-foreground-lovable)]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MARKER_COLORS.apartamento }} />
              Apartamento
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MARKER_COLORS.casa }} />
              Casa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MARKER_COLORS.terreno }} />
              Terreno
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MARKER_COLORS.comercial }} />
              Comercial
            </span>
          </div>

          {/* Heatmap de preço */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-lovable)] pt-4">
            <span className="text-xs text-[var(--muted-foreground-lovable)]">Heatmap de preço:</span>
            <input
              value={heatCity}
              onChange={(e) => setHeatCity(e.target.value)}
              aria-label="Cidade do heatmap"
              placeholder="Cidade"
              className="w-40 rounded-lg border border-[var(--border-lovable)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
            />
            <button
              type="button"
              onClick={toggleHeat}
              aria-pressed={showHeat}
              className={`btn ${showHeat ? 'btn-primary' : 'btn-ghost'} cta-glow`}
            >
              {showHeat ? 'Ocultar heatmap' : 'Mostrar heatmap'}
            </button>
            {heatLoading && <span className="text-xs text-[var(--muted-foreground-lovable)]">Carregando…</span>}
          </div>

          {reverse && (
            <div className="rounded-lg border border-[var(--primary)]900/60 bg-emerald-950/20 p-3 text-sm text-[var(--foreground)]">
              <p className="font-medium text-[var(--primary)]">Local selecionado</p>
              <p className="mt-1">{reverse.label}</p>
              {reverse.pricePerM2 != null && (
                <p className="mt-1 text-[var(--muted-foreground-lovable)]">
                  Preço/m²:{' '}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(reverse.pricePerM2)}
                  {reverse.yoy != null && ` · ${reverse.yoy > 0 ? '+' : ''}${reverse.yoy}% a.a.`}
                </p>
              )}
              {reverse.zoning && (
                <p className="mt-1 text-[var(--muted-foreground-lovable)]">
                  Zona: {reverse.zoning}
                  {reverse.schools != null && ` · Escolas: ${reverse.schools}`}
                </p>
              )}
            </div>
          )}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
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

      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
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

    const L = (window as any).L;
    if (!L) {
      console.warn('Leaflet not loaded yet');
      return;
    }

    const map = L.map(mapRef.current, {
      center: [-15.7939, -47.8828],
      zoom: 4,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // Expose a flyTo so the parent combobox can recenter the map.
    if (flyToRef) {
      flyToRef.current = (lat: number, lng: number) => {
        map.flyTo([lat, lng], 13, { duration: 0.8 });
      };
    }

    // Reverse-geocode on click (real-estate context panel in the parent).
    if (onMapClick) {
      map.on('click', (e: any) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
    // Map is initialized exactly once on mount. flyToRef is a stable ref and
    // onMapClick is read at event time via the closure; re-running this effect
    // would tear down and recreate the Leaflet instance on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when items change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const L = (window as any).L;
    if (!L) return;

    // Clear existing markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (items.length === 0) return;

    const bounds: [number, number][] = [];

    items.forEach((item) => {
      if (!item.latitude || !item.longitude) return;
      const latlng: [number, number] = [item.latitude, item.longitude];
      bounds.push(latlng);

      const color = getMarkerColor(item.type);

      // SVG marker icon colored by type
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 14px; height: 14px;
          background: ${color};
          border: 2px solid #fff;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker(latlng, { icon })
        .addTo(map)
        .bindPopup(
          `<strong>${item.title}</strong><br/>${item.city}, ${item.state}<br/>` +
            `${item.areaM2} m² &middot; ${new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              maximumFractionDigits: 0,
            }).format(item.price)}`,
        );

      markersRef.current.push(marker);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    }
  }, [items]);

  // Render heatmap de preço (CircleMarkers coloridos por peso)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    const L = (window as any).L;
    if (!L) return;

    heatRef.current.forEach((m) => map.removeLayer(m));
    heatRef.current = [];

    if (!showHeat || heat.length === 0) return;

    heat.forEach((p) => {
      const color = weightColor(p.weight);
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6 + p.weight * 18,
        fillColor: color,
        color,
        weight: 1,
        fillOpacity: 0.45,
      }).addTo(map).bindPopup(
        `<strong>${p.neighborhood ?? 'Região'}</strong><br/>` +
          `Preço médio: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0,
          }).format(p.avgPrice ?? 0)}<br/>` +
          `Densidade: ${Math.round((p.weight ?? 0) * 100)}%`,
      );
      heatRef.current.push(marker);
    });
  }, [heat, showHeat]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Carregando imóveis no mapa…'
          : `${items.length} imóvel${items.length === 1 ? '' : 'eis'} exibido${items.length === 1 ? '' : 's'} no mapa.`}
      </p>
      <div className="lg:col-span-2 w-full">
        <div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4 p-1">
          <div
            ref={mapRef}
            role="region"
            aria-label="Mapa de imóveis"
            className="relative h-[360px] w-full sm:h-[480px] lg:h-[520px] overflow-hidden rounded-lg"
            style={{ zIndex: 0 }}
          >
            {loading && (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-[var(--card)]/60">
                <span
                  className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-lovable)] border-t-[var(--primary)]"
                  aria-hidden="true"
                />
                <span className="sr-only">Carregando imóveis no mapa…</span>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <EmptyState
                  title="Sem pontos para este filtro"
                  description="Tente outro filtro ou explore as próximas tasks do roadmap."
                  className="border-0 bg-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full rounded-xl border border-[var(--border-lovable)] bg-[var(--card)]/40 px-4 py-2.5 text-sm text-[var(--muted-foreground-lovable)] transition hover:border-[var(--border-lovable)]"
        >
          {sidebarOpen ? 'Ocultar resultados' : `Mostrar resultados (${items.length})`}
        </button>
      </div>

      {/* Sidebar with collapse on mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block space-y-3`}>
        <p className="text-xs text-[var(--muted-foreground-lovable)]" aria-live="polite">
          {items.length} ponto{items.length === 1 ? '' : 's'} no mapa
        </p>
        <ul role="list" className="grid gap-3 max-h-[360px] sm:max-h-[480px] lg:max-h-[520px] overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={`${item.latitude}-${item.longitude}-${item.id}`}>
              <SpotlightCard>
                <Link
                  href={`/${locale}/property/${item.id}`}
                  className="block rounded-xl p-4 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: getMarkerColor(item.type) }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--muted-foreground-lovable)] truncate">{item.title}</p>
                      <p className="mt-1 text-xs text-[var(--muted-foreground-lovable)]">
                        {item.city}, {item.state} · {item.areaM2} m²
                      </p>
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
