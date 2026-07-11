'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, NotificationCenter } from '@landmap/ui';
import { Logo } from './Logo';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]';

const locales = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
  { code: 'es-ES', label: 'ES' },
];

const links = [
  { href: 'search', labelKey: 'Buscar' },
  { href: 'map', labelKey: 'Mapa' },
  { href: 'world', labelKey: 'Mundo 3D' },
  { href: 'studio', labelKey: 'Studio' },
  { href: 'live', labelKey: 'Live' },
  { href: 'sales', labelKey: 'Vendas' },
  { href: 'pricing', labelKey: 'Preços' },
  { href: 'alerts', labelKey: 'Alertas' },
  { href: 'favorites', labelKey: 'Favoritos' },
  { href: 'compare', labelKey: 'Comparar' },
];

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'pt-BR';
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/').filter(Boolean);
    if (locales.some((l) => l.code === segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    window.location.href = '/' + segments.join('/');
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="sticky top-3 z-50 mx-3 flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a0a0a]/70 px-4 py-2.5 backdrop-blur-xl [backdrop-filter:saturate(150%)] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.85)] md:mx-auto">
      <Link
        href={`/${locale}`}
        aria-label="LandMap - ir para a página inicial"
        className={`group flex items-center gap-2 text-sm font-semibold tracking-tight ${focusRing}`}
      >
        <Logo className="h-5 w-5 transition group-hover:scale-110" />
        <span className="text-gradient">LandMap</span>
      </Link>

      <nav
        aria-label="Navegação principal"
        className="hidden items-center gap-1 text-sm text-neutral-300 md:flex"
      >
        {links.map((link) => {
          const href = `/${locale}/${link.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={link.href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 transition hover:bg-white/5 hover:text-white ${focusRing} ${
                isActive
                  ? 'bg-emerald-400/10 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]'
                  : 'text-neutral-300'
              }`}
            >
              {link.labelKey}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">
        <span className="hidden md:block">
          <NotificationCenter />
        </span>

        <span className="hidden items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5 md:flex">
          {locales.map((l) => (
            <Button
              key={l.code}
              variant={locale === l.code ? 'default' : 'ghost'}
              aria-label={`Mudar idioma para ${l.label}`}
              aria-pressed={locale === l.code}
              className={`!px-2.5 !py-0.5 !text-xs ${
                locale === l.code ? '' : 'text-neutral-400'
              }`}
              onClick={() => switchLocale(l.code)}
            >
              {l.label}
            </Button>
          ))}
        </span>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition hover:border-emerald-400/40 hover:text-white md:hidden ${focusRing}`}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`absolute inset-x-3 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 p-2 backdrop-blur-xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] md:hidden ${
          mobileOpen ? 'block' : 'hidden'
        }`}
      >
        <nav aria-label="Navegação principal (mobile)" className="flex flex-col gap-0.5">
          {links.map((link) => {
            const href = `/${locale}/${link.href}`;
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={link.href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm transition hover:bg-white/5 hover:text-white ${focusRing} ${
                  isActive ? 'bg-emerald-400/10 text-emerald-200' : 'text-neutral-300'
                }`}
              >
                {link.labelKey}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center justify-end gap-2 border-t border-white/10 px-1 pt-3">
            <span className="flex items-center gap-1">
              {locales.map((l) => (
                <Button
                  key={l.code}
                  variant={locale === l.code ? 'default' : 'ghost'}
                  aria-label={`Mudar idioma para ${l.label}`}
                  aria-pressed={locale === l.code}
                  className={`!px-3 !py-1 !text-xs ${
                    locale === l.code ? '' : 'text-neutral-400'
                  }`}
                  onClick={() => switchLocale(l.code)}
                >
                  {l.label}
                </Button>
              ))}
            </span>
          </div>
        </nav>
      </div>
    </header>
  );
}
