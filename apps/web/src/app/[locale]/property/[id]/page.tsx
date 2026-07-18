'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ProductPageShell } from '../../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { FileText, MapPin, TrendingUp, AlertTriangle, Lock, Layers } from '../../../../components/lovable/icons';
import { apiUrl } from '../../../../lib/api';
import { formatBRL } from '../../../../lib/plans';

interface Dossier {
  id: string;
  title: string;
  city: string;
  state: string;
  neighborhood?: string;
  price: number;
  areaM2: number;
  pricePerM2?: number;
  grade?: string;
  score?: number;
  capRate?: number;
  thesis?: string[];
  risks?: string[];
  drivers?: string[];
  comps?: string[];
  tags?: string[];
  latitude?: number;
  longitude?: number;
}

export default function PropertyDossierPage() {
  const locale = useLocale();
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [p, setP] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(apiUrl(`/markdowns?id=${encodeURIComponent(id)}`), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((d) => {
        const it = d.items?.[0];
        if (!it) throw new Error('not found');
        setP(it as Dossier);
      })
      .catch(() => setError('Imóvel não encontrado no dataset.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ProductPageShell
      backHref={`/${locale}/search`}
      eyebrow="Dossier"
      title={p?.title ?? 'Imóvel'}
      description={p ? `${p.city}, ${p.state}${p.neighborhood ? ` · ${p.neighborhood}` : ''}` : 'Carregando…'}
      maxWidth="7xl"
    >
      {loading ? (
        <div className="py-16 text-center text-[var(--muted-foreground)]">Carregando dossier…</div>
      ) : error || !p ? (
        <Card variant="default" className="py-14 text-center text-sm text-[var(--muted-foreground)]">
          {error}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card variant="default" className="p-4">
                <p className="text-xs text-[var(--muted-foreground)]">Preço</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{formatBRL(p.price)}</p>
              </Card>
              <Card variant="default" className="p-4">
                <p className="text-xs text-[var(--muted-foreground)]">Preço/m²</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  {p.pricePerM2 ? formatBRL(p.pricePerM2) : '—'}
                </p>
              </Card>
              <Card variant="default" className="p-4">
                <p className="text-xs text-[var(--muted-foreground)]">Área</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{p.areaM2} m²</p>
              </Card>
              <Card variant="default" className="p-4">
                <p className="text-xs text-[var(--muted-foreground)]">Cap rate</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  {p.capRate ? `${p.capRate}%` : '—'}
                </p>
              </Card>
            </div>

            {p.thesis && p.thesis.length > 0 && (
              <Card variant="default" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Tese</h2>
                </div>
                <ul className="space-y-1.5">
                  {p.thesis.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-[var(--foreground)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {p.drivers && p.drivers.length > 0 && (
                <Card variant="default" className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[var(--success)]" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Drivers</h2>
                  </div>
                  <ul className="space-y-1.5">
                    {p.drivers.map((d, i) => (
                      <li key={i} className="text-sm text-[var(--muted-foreground)]">• {d}</li>
                    ))}
                  </ul>
                </Card>
              )}
              {p.risks && p.risks.length > 0 && (
                <Card variant="default" className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[var(--destructive)]" />
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Riscos</h2>
                  </div>
                  <ul className="space-y-1.5">
                    {p.risks.map((r, i) => (
                      <li key={i} className="text-sm text-[var(--muted-foreground)]">• {r}</li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {p.comps && p.comps.length > 0 && (
              <Card variant="default" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Comps</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.comps.map((c, i) => (
                    <Badge key={i} variant="outline">{c}</Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card variant="highlight" className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Score</span>
                <span className="text-2xl font-bold text-[var(--foreground)]">{p.score ?? '—'}</span>
              </div>
              {p.grade && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Grade</span>
                  <Badge variant="secondary">Grade {p.grade}</Badge>
                </div>
              )}
            </Card>
            {p.tags && p.tags.length > 0 && (
              <Card variant="default" className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[var(--primary)]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((t, i) => (
                    <Badge key={i} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </Card>
            )}
            <Card variant="default" className="p-5">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--foreground)]">Local</h2>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                {p.neighborhood ?? 'Centro'} · {p.city}/{p.state}
              </p>
              {typeof p.latitude === 'number' && typeof p.longitude === 'number' && (
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                </p>
              )}
            </Card>
          </div>
        </div>
      )}
    </ProductPageShell>
  );
}
