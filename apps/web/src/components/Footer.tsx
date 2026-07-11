'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { localeHref, useActiveLocale } from '../lib/locale';

export function Footer() {
  const year = new Date().getFullYear();
  const locale = useActiveLocale();

  return (
    <footer aria-label="Rodapé do LandMap" className="mx-auto w-full max-w-6xl px-6 py-12 text-xs text-neutral-400">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
      <div className="pt-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-neutral-100">
            <Logo className="h-5 w-5" />
            <span>LandMap</span>
          </div>
          <p className="mt-3 leading-relaxed">
            Inteligência imobiliária soberana e aberta. Dados, busca, mapa e IA — sem custo e sem login.
          </p>
        </div>

        <nav aria-label="Navegação do rodapé" className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-3">
          <Link href={localeHref('/', locale)} className="transition hover:text-neutral-300">Início</Link>
          <Link href={localeHref('/search', locale)} className="transition hover:text-neutral-300">Buscar</Link>
          <Link href={localeHref('/map', locale)} className="transition hover:text-neutral-300">Mapa</Link>
          <Link href={localeHref('/compare', locale)} className="transition hover:text-neutral-300">Comparar</Link>
          <Link href={localeHref('/favorites', locale)} className="transition hover:text-neutral-300">Favoritos</Link>
          <Link href={localeHref('/chat', locale)} className="transition hover:text-emerald-300">Chat IA</Link>
        </nav>
      </div>

      <div className="mt-10 flex items-center justify-between border-t hairline pt-6">
        <p>© {year} LandMap — Sovereign Intelligence.</p>
        <p className="text-neutral-400">Free AI · MiniMax via Puter</p>
      </div>
      </div>
    </footer>
  );
}
