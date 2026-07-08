import Link from 'next/link';
import React from 'react';
import { searchProperties } from '../../lib/api';
import { Reveal, Stagger, ScrollProgress } from '../../components/Motion';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Marquee } from '../../components/Marquee';

export const dynamic = 'force-dynamic';

export default async function LocaleHomePage() {
  let featured: Array<{
    id: string; title: string; city: string; state: string;
    price: number; areaM2: number; bedrooms?: number;
    type: string; modality: string;
  }> = [];
  try {
    const res = await searchProperties({});
    featured = res.items.slice(0, 6);
  } catch {}

  return (
    <main className="relative min-h-screen text-neutral-50">
      <ScrollProgress />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(40rem_30rem_at_50%_-10%,rgba(52,211,153,0.10),transparent_70%)]" />

      {/* Hero */}
      <Reveal className="relative mx-auto max-w-6xl px-6 pt-32 pb-20">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-1 text-xs text-neutral-400 tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Inteligência Imobiliária
          </span>
          <h1 className="mt-8 text-5xl font-semibold tracking-tight leading-tight text-gradient">
            Dados que transformam<br />o mercado imobiliário
          </h1>
          <p className="mt-4 text-base text-neutral-400 max-w-lg">
            1.500+ imóveis estruturados, busca inteligente, mapa interativo e análises RAG — com IA 100% gratuita.
          </p>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="./search"
              className="glow-emerald inline-flex h-11 items-center rounded-lg bg-white px-6 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
            >
              Buscar imóveis
            </Link>
            <Link
              href="./map"
              className="inline-flex h-11 items-center rounded-lg border border-neutral-800 px-6 text-sm font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              Explorar mapa
            </Link>
          </div>
        </div>
      </Reveal>

      <Marquee />

      {/* Quick stats */}
      <Reveal delay={0.1} className="mx-auto max-w-6xl px-6 pb-16">
        <Stagger className="grid gap-px overflow-hidden rounded-xl border border-neutral-800 bg-neutral-800 sm:grid-cols-3">
          {[
            { label: 'Imóveis catalogados', value: '1.500+' },
            { label: 'Cidades mapeadas', value: '50+' },
            { label: 'Modalidades', value: 'Venda · Aluguel · Lançamento' },
          ].map((stat) => (
            <SpotlightCard key={stat.label} className="bg-[#050505] p-6">
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
            </SpotlightCard>
          ))}
        </Stagger>
      </Reveal>

      {/* Featured */}
      {featured.length > 0 && (
        <Reveal delay={0.2} className="mx-auto max-w-6xl px-6 pb-24">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-medium">Imóveis em destaque</h2>
              <p className="mt-1 text-sm text-neutral-500">Explore alguns imóveis disponíveis.</p>
            </div>
            <Link href="./search" className="text-xs text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition hover:text-white">
              Ver todos
            </Link>
          </div>
          <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <SpotlightCard key={item.id} className="p-5">
                <Link
                  href={`./property/${item.id}`}
                  className="group block h-full"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-neutral-300 transition group-hover:text-white">{item.title}</p>
                    <span className="shrink-0 ml-2 text-xs text-neutral-500">{item.modality}</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    {item.city}, {item.state} · {item.areaM2} m²
                    {item.bedrooms ? ` · ${item.bedrooms} quarto(s)` : ''}
                  </p>
                  <p className="mt-3 text-sm font-medium">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.price)}
                  </p>
                </Link>
              </SpotlightCard>
            ))}
          </Stagger>
        </Reveal>
      )}

      {/* CTA */}
      <Reveal className="border-t hairline">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-xl font-medium">Plataforma aberta de dados</h2>
          <p className="mt-2 text-sm text-neutral-500 mx-auto max-w-md">
            API REST, schema.org, RAG local, CRM — tudo open-source.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="./search"
              className="inline-flex h-10 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              Começar busca
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
