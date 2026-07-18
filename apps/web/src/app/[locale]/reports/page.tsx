'use client';

import { useState } from 'react';
import {
  Sparkles,
  FileText,
  Building2,
  MapPin,
  Share2,
  Star,
  Check,
} from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { PlanGate } from '../../../components/PlanGate';
import { Card, Badge, Button, Stat, Sparkline } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  fmtPriceSqm,
  fmtDelta,
  topByScore,
  topByValorization,
} from '../../../lib/mapIntelligence';

type GradeVariant = 'success' | 'info' | 'warning' | 'destructive';

function gradeFor(score: number): { letter: string; variant: GradeVariant } {
  if (score >= 90) return { letter: 'A', variant: 'success' };
  if (score >= 80) return { letter: 'B', variant: 'info' };
  if (score >= 70) return { letter: 'C', variant: 'warning' };
  return { letter: 'D', variant: 'destructive' };
}

const inputCls =
  'mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-1 focus:ring-[var(--ring)]';
const labelCls = 'block text-xs font-medium text-[var(--muted-foreground)]';

const MAX_REGIONS = 3;

export default function ReportsPage() {
  const [company, setCompany] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [contact, setContact] = useState('');
  const [selected, setSelected] = useState<string[]>(['meireles', 'cambeba']);

  const scoreRank = topByScore(INTELLIGENCE_REGIONS.length);
  const topValorizationIds = new Set(topByValorization(3).map((r) => r.id));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_REGIONS) return prev;
      return [...prev, id];
    });
  };

  const selectedRegions = INTELLIGENCE_REGIONS.filter((r) => selected.includes(r.id));

  const brandHeader = (
    <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied logo URL (demo)
        <img
          src={logoUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border)] object-contain"
        />
      ) : (
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
          <Building2 className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold text-[var(--foreground)]">
          {company || 'Sua empresa'}
        </p>
        {contact && (
          <p className="truncate text-xs text-[var(--muted-foreground)]">{contact}</p>
        )}
      </div>
      <Badge variant="outline" className="ml-auto shrink-0">
        Relatório do investidor
      </Badge>
    </div>
  );

  return (
    <ProductPageShell
      backHref="/plans"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Relatório
        </>
      }
      title="Relatório do investidor"
      description="Gere um relatório em PDF com a marca da sua empresa, reunindo as regiões mais promissoras, preço médio do m², score LandMap e histórico de valorização."
      maxWidth="5xl"
    >
      <PlanGate required="pro">
        {/* Brand form */}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--primary)]" />
            <p className="font-semibold text-[var(--foreground)]">Marca do relatório</p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className={labelCls}>
              Nome da empresa
              <input
                className={inputCls}
                placeholder="Ex.: LandMap Capital"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </label>
            <label className={labelCls}>
              URL do logo
              <input
                className={inputCls}
                placeholder="https://exemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Contato principal
              <input
                className={inputCls}
                placeholder="nome@empresa.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </label>
          </div>
        </Card>

        {/* Region picker */}
        <Card className="mt-3 p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--primary)]" />
            <p className="font-semibold text-[var(--foreground)]">Regiões</p>
            <Badge variant="secondary" className="ml-auto">
              {selected.length}/{MAX_REGIONS}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Selecione até {MAX_REGIONS} regiões para compor o relatório.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {INTELLIGENCE_REGIONS.map((r) => {
              const active = selected.includes(r.id);
              const disabled = !active && selected.length >= MAX_REGIONS;
              const g = gradeFor(r.score);
              return (
                <Card
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={active}
                  variant={active ? 'highlight' : 'interactive'}
                  onClick={() => toggle(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle(r.id);
                    }
                  }}
                  className={`flex items-center justify-between p-3 ${
                    disabled ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {r.name}
                    </p>
                    <p className="truncate text-[11px] text-[var(--muted-foreground)]">
                      {r.city} · {r.state}
                    </p>
                  </div>
                  {active ? (
                    <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  ) : (
                    <Badge variant={g.variant} className="shrink-0">
                      {g.letter}
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Generated preview */}
        <Card variant="highlight" className="mt-3 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[var(--primary)]" />
            <p className="font-semibold text-[var(--foreground)]">Pré-visualização</p>
            <Badge variant="outline" className="ml-auto">
              demo
            </Badge>
          </div>

          <div className="mt-4">
            {brandHeader}

            {selectedRegions.length === 0 ? (
              <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
                Selecione ao menos uma região para gerar o relatório.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {selectedRegions.map((r) => {
                  const g = gradeFor(r.score);
                  const rank = scoreRank.findIndex((x) => x.id === r.id) + 1;
                  const isTopVal = topValorizationIds.has(r.id);
                  return (
                    <div
                      key={r.id}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--primary)]" />
                        <p className="font-semibold text-[var(--foreground)]">{r.name}</p>
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {r.city} · {r.state}
                        </span>
                        <Badge variant={g.variant} className="ml-auto">
                          Nota {g.letter}
                        </Badge>
                      </div>

                      {isTopVal && (
                        <div className="mt-2">
                          <Badge variant="warning">Top valorização</Badge>
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <Stat
                          label="Preço médio m²"
                          value={fmtPriceSqm(r.priceSqm)}
                          hint="Valor atual"
                        />
                        <Stat
                          label="Score LandMap"
                          value={r.score}
                          hint={`Top ${rank} do ranking`}
                        />
                        <Stat
                          label="Valorização 12m"
                          value={fmtDelta(r.priceSqmDelta12m)}
                          trend={r.priceSqmDelta12m}
                        />
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <Sparkline
                          data={r.priceHistory.map((p) => p.value)}
                          width={180}
                          height={40}
                          aria-label={`Histórico de preço do m² em ${r.name}`}
                        />
                        <span className="text-xs text-[var(--muted-foreground)]">
                          Histórico do m² · 2019–2025
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  alert('Download PDF (demo) — geração do relatório em breve.')
                }
              >
                <FileText className="h-4 w-4" />
                Baixar PDF (demo)
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  alert('Link de compartilhamento (demo) copiado para a área de transferência.')
                }
              >
                <Share2 className="h-4 w-4" />
                Compartilhar (demo)
              </Button>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
              <Star className="h-3 w-3" />
              Relatório gerado com dados de inteligência LandMap · modo demonstração.
            </p>
          </div>
        </Card>
      </PlanGate>
    </ProductPageShell>
  );
}
