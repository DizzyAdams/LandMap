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

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Allow keyboard users to dismiss the mobile menu with Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className="glass-strong sticky top-0 z-40 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
      <Link
        href={`/${locale}`}
        aria-label="LandMap — ir para a página inicial"
        className={`group flex items-center gap-2 text-sm font-semibold tracking-tight ${focusRing}`}
      >
        <Logo className="h-5 w-5 transition group-hover:scale-110" />
        <span className="text-gradient">LandMap</span>
      </Link>

      <nav
        aria-label="Navegação principal"
        className="hidden items-center gap-4 text-sm text-neutral-300 md:flex"
      >
        {links.map((link) => {
          const href = `/${locale}/${link.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={link.href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`transition hover:text-white ${focusRing} ${
                isActive ? 'rounded-full bg-white/10 px-3 py-1 text-white' : 'text-neutral-300'
              }`}
            >
              {link.labelKey}
            </Link>
          );
        })}

        <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />

        <NotificationCenter />

        <span className="flex items-center gap-1">
          {locales.map((l) => (
            <Button
              key={l.code}
              variant={locale === l.code ? 'default' : 'ghost'}
              aria-label={`Mudar idioma para ${l.label}`}
              aria-pressed={locale === l.code}
              className={`!px-2 !py-0.5 !text-xs ${
                locale === l.code ? '' : 'text-neutral-400'
              }`}
              onClick={() => switchLocale(l.code)}
            >
              {l.label}
            </Button>
          ))}
        </span>
      </nav>

      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-300 transition hover:border-neutral-500 hover:text-white md:hidden ${focusRing}`}
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

      {/* Mobile navigation panel */}
      <div
        id="mobile-nav"
        className={`glass absolute inset-x-0 top-full z-40 border-b border-neutral-800 bg-[#050505]/95 backdrop-blur-md md:hidden ${
          mobileOpen ? 'block' : 'hidden'
        }`}
      >
        <nav
          aria-label="Navegação principal (mobile)"
          className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4"
        >
          {links.map((link) => {
            const href = `/${locale}/${link.href}`;
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={link.href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-800/60 hover:text-white ${focusRing} ${
                  isActive ? 'bg-neutral-800 text-white' : 'text-neutral-300'
                }`}
              >
                {link.labelKey}
              </Link>
            );
          })}
          <div className="mt-2 flex gap-2 border-t border-neutral-800 pt-3">
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
          </div>
        </nav>
      </div>
    </header>
  );
}
