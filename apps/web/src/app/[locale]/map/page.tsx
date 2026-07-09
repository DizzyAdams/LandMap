'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { EmptyState } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';

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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  useEffect(() => {
    let active = true;
    setLoading(true);
    const base = new URL('/markdowns', 'http://localhost:4000');
    if (query.trim()) base.searchParams.set('q', query.trim());
    fetch(base.toString(), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (!active) return;
        setItems((data?.items ?? []).filter((item: Property) => item.latitude && item.longitude));
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
    (item) => item.price >= minPrice && item.price <= maxPrice,
  );

  return (
    <main className="min-h-screen grid-bg text-neutral-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gradient">Mapa mundial</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Navegue por localizações disponíveis ou refine por cidade.
              </p>
            </div>
            <Link href={`/${locale}`} className="text-xs text-neutral-400 transition hover:text-white">
              Voltar para Home
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-4">
          {/* Search input */}
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filtrar por cidade ou bairro"
            aria-label="Filtrar por cidade ou bairro"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-50 placeholder-neutral-600 outline-none transition focus:border-neutral-500"
          />

          {/* Radius slider */}
          <div className="flex items-center gap-4">
            <label className="text-xs text-neutral-500 w-28">Raio de busca:</label>
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
            <span className="text-xs text-neutral-400 w-16 text-right">{radiusKm} km</span>
          </div>

          {/* Price range */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-500">Preço mín.:</label>
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
              <span className="text-xs text-neutral-400 w-24 text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(minPrice)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-500">Preço máx.:</label>
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
              <span className="text-xs text-neutral-400 w-24 text-right">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                  notation: 'compact',
                }).format(maxPrice)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-neutral-400">
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
}: {
  items: Property[];
  loading: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  locale: string;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

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

    return () => {
      map.remove();
      mapInstance.current = null;
    };
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

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <p className="sr-only" aria-live="polite">
        {loading
          ? 'Carregando imóveis no mapa…'
          : `${items.length} imóvel${items.length === 1 ? '' : 'eis'} exibido${items.length === 1 ? '' : 's'} no mapa.`}
      </p>
      <div className="lg:col-span-2 w-full">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-1">
          <div
            ref={mapRef}
            role="region"
            aria-label="Mapa de imóveis"
            className="relative h-[360px] w-full sm:h-[480px] lg:h-[520px] overflow-hidden rounded-lg"
            style={{ zIndex: 0 }}
          >
            {loading && (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-neutral-950/60">
                <span
                  className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-emerald-400"
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
          className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-2.5 text-sm text-neutral-300 transition hover:border-neutral-500"
        >
          {sidebarOpen ? 'Ocultar resultados' : `Mostrar resultados (${items.length})`}
        </button>
      </div>

      {/* Sidebar with collapse on mobile */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block space-y-3`}>
        <p className="text-xs text-neutral-500" aria-live="polite">
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
                      <p className="text-sm text-neutral-300 truncate">{item.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">
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
