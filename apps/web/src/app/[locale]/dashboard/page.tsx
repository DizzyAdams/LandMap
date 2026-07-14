'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  MapPin,
  Activity,
  Building2,
  ShieldCheck,
} from '../../../components/lovable/icons';

/* ── Dynamically import the map to avoid SSR issues (Leaflet needs `window`) ── */
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => null,
});

/* ── Types ── */
type KpiItem = {
  label: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;
};

const KPI_DATA: KpiItem[] = [
  { label: 'Valorização média', value: '↑ 2,4%', icon: TrendingUp },
  { label: 'Preço médio/m²', value: 'R$ 7.200', icon: MapPin },
  { label: 'Bairros monitorados', value: '24', icon: Activity },
  { label: 'Imóveis ativos', value: '1.847', icon: Building2 },
  { label: 'Confiança dos dados', value: '94%', icon: ShieldCheck },
];

/* ── Loading overlay ── */
function LoadingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="rounded-full bg-[var(--card)]/90 px-5 py-2.5 shadow-sm backdrop-blur">
        <span className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]/75">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--primary)]" />
          </span>
          Carregando inteligência territorial…
        </span>
      </div>
    </div>
  );
}

/* ── Error overlay ── */
function ErrorOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="pointer-events-auto max-w-sm rounded-2xl border border-destructive/20 bg-[var(--card)] p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-destructive">
          Falha ao carregar o mapa
        </h3>
        <p className="mt-1 text-sm text-[var(--foreground)]/70">
          Não foi possível carregar o mapa. Verifique sua conexão e tente
          novamente.
        </p>
      </div>
    </div>
  );
}

/* ── KPI bar ── */
function KpiBar() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-4 md:px-6">
      <div className="pointer-events-auto mx-auto grid max-w-[1400px] grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-[var(--border)]/40 bg-[var(--card)]/90 px-3 py-2.5 shadow-sm backdrop-blur transition hover:bg-[var(--card)]"
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  size={14}
                  className="text-[var(--primary)]"
                />
                <span className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                  {kpi.label}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold tracking-tight text-[var(--foreground)]">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Brand chip ── */
function BrandChip() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 md:bottom-6 md:left-6">
      <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[var(--border)]/40 bg-[var(--card)]/90 px-3.5 py-1.5 shadow-sm backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
        <span className="font-display text-xs font-bold tracking-tight text-[var(--primary)]">
          LandMap
        </span>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate async map initialization
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden text-[var(--foreground)]">
      {/* Leaflet attribution hidden via CSS */}
      <style>{`
        .leaflet-control-attribution { display: none !important; }
      `}</style>

      {/* Full-screen map */}
      <div className="absolute inset-0 z-0">
        <MapView onError={(msg: string) => { setError(msg); setLoading(false); }} />
      </div>

      {/* KPI bar — top */}
      <KpiBar />

      {/* Loading overlay */}
      {loading && !error && <LoadingOverlay />}

      {/* Error overlay */}
      {error && <ErrorOverlay />}

      {/* Brand chip — bottom left */}
      <BrandChip />
    </main>
  );
}
