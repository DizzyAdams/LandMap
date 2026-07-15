'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Sparkles, TrendingUp, Building2, MapPin, BarChart } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Sparkline } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Insight = {
  city: string;
  neighborhood: string;
  pricePerM2: number;
  change12m: number;
  trend: number[];
  tag: 'alta' | 'media' | 'estavel';
};

const INSIGHTS: Insight[] = [
  { city: 'São Paulo', neighborhood: 'Pinheiros', pricePerM2: 11200, change12m: 18.4, trend: [8200, 8700, 9100, 9600, 10200, 10900, 11200], tag: 'alta' },
  { city: 'Curitiba', neighborhood: 'Batel', pricePerM2: 7800, change12m: 11.2, trend: [6100, 6400, 6700, 7000, 7300, 7600, 7800], tag: 'alta' },
  { city: 'Florianópolis', neighborhood: 'Lagoa da Conceição', pricePerM2: 13400, change12m: 9.6, trend: [10800, 11300, 11800, 12300, 12700, 13100, 13400], tag: 'media' },
  { city: 'Belo Horizonte', neighborhood: 'Savassi', pricePerM2: 6900, change12m: 4.1, trend: [6200, 6300, 6500, 6600, 6750, 6850, 6900], tag: 'estavel' },
  { city: 'Recife', neighborhood: 'Boa Viagem', pricePerM2: 8100, change12m: -3.2, trend: [8800, 8600, 8500, 8400, 8300, 8200, 8100], tag: 'estavel' },
  { city: 'Porto Alegre', neighborhood: 'Moinhos de Vento', pricePerM2: 7400, change12m: 6.8, trend: [6400, 6600, 6800, 7000, 7150, 7300, 7400], tag: 'media' },
];

const tagVariant = (t: Insight['tag']) =>
  t === 'alta' ? 'success' : t === 'media' ? 'warning' : 'outline';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function InsightsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/map')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Insights de mercado
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Onde o valor está se movendo</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Sinais de valorização por bairro nas principais cidades do Brasil, atualizados com a base LandMap.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3">
        <Stat label="Cidades monitoradas" value="10" hint="Base LandMap" />
        <Stat label="Bairros em alta" value="6" trend={12.4} hint="vs. 12 meses" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {INSIGHTS.map((it) => (
          <Card key={`${it.city}-${it.neighborhood}`} variant="interactive">
            <Link href={lh('/regions')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{it.neighborhood}</p>
                  <Badge variant={tagVariant(it.tag)}>{it.tag}</Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {it.city}
                </p>
                <p className="mt-2 font-mono text-lg font-semibold tabular-nums">{fmtBRL(it.pricePerM2)}/m²</p>
                <p
                  className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
                    it.change12m >= 0 ? 'text-primary' : 'text-destructive'
                  }`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {it.change12m >= 0 ? '+' : ''}
                  {it.change12m}% 12m
                </p>
              </div>
              <Sparkline data={it.trend} width={96} height={40} className="shrink-0" />
            </Link>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <BarChart className="h-4 w-4" />
        Dados ilustrativos — conecte a API LandMap para valores ao vivo.
      </div>
    </main>
  );
}
