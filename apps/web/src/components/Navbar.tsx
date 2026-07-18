'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Button, NotificationCenter } from '@landmap/ui';
import { PlanBadge } from './PlanGate';
import { ensureFreeAccess, useMockUser } from '../lib/mockAuth';
import { Menu, X } from './lovable/icons';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const locales = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
  { code: 'es-ES', label: 'ES' },
];

const primaryLinks = [
  { href: 'map', labelKey: 'Mapa grátis' },
  { href: 'plans', labelKey: 'Planos' },
];

const marketLinks = [
  { href: 'regions', labelKey: 'Regiões' },
  { href: 'cities', labelKey: 'Cidades' },
  { href: 'neighborhoods', labelKey: 'Bairros' },
  { href: 'market', labelKey: 'Mercado' },
  { href: 'valorization', labelKey: 'Valorização' },
  { href: 'favorites', labelKey: 'Favoritos' },
  { href: 'compare', labelKey: 'Comparar' },
  { href: 'dashboard', labelKey: 'Dashboard' },
  { href: 'kpis', labelKey: 'KPIs' },
  { href: 'insights', labelKey: 'Insights' },
  { href: 'sales', labelKey: 'Terrenos' },
  { href: 'live', labelKey: 'Ao vivo' },
  { href: 'studio', labelKey: 'Studio' },
  { href: 'calculator', labelKey: 'Calculadora' },
  { href: 'alerts', labelKey: 'Alertas' },
  { href: 'resources', labelKey: 'Recursos' },
  { href: 'developers', labelKey: 'Desenvolvedores' },
  { href: 'pricing', labelKey: 'Preços' },
  { href: 'reports', labelKey: 'Relatório' },
  { href: 'watchlist', labelKey: 'Monitoradas' },
  { href: 'api-keys', labelKey: 'API & Webhooks' },
  { href: 'team', labelKey: 'Equipe' },
  { href: 'portfolio', labelKey: 'Carteira' },
  { href: 'leads', labelKey: 'Leads' },
  { href: 'glossary', labelKey: 'Glossário' },
  { href: 'assistant', labelKey: 'Assistente IA' },
  { href: 'chat', labelKey: 'LandBot' },
  { href: 'writer', labelKey: 'Redator IA' },
  { href: 'rag', labelKey: 'Base RAG' },
  { href: 'automations', labelKey: 'Automações' },
  { href: 'agents', labelKey: 'Agentes' },
  { href: 'recommendations', labelKey: 'Recomendações' },
  { href: 'pipeline', labelKey: 'Pipeline IA' },
  { href: 'knowledge', labelKey: 'Conhecimento' },
  { href: 'workflows', labelKey: 'Fluxos' },
  { href: 'integrations', labelKey: 'Integrações' },
  { href: 'status', labelKey: 'Status' },
];

// Every navigable destination, used by the mobile sheet.
const allLinks = [...primaryLinks, ...marketLinks];

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'pt-BR';
  const { user, signOut } = useMockUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const marketRef = useRef<HTMLDivElement>(null);
  const marketBtnRef = useRef<HTMLButtonElement>(null);
  const marketActive = marketLinks.some((l) => {
    const href = `/${locale}/${l.href}`;
    return pathname === href || pathname.startsWith(href + '/');
  });

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
    setMarketOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!marketOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMarketOpen(false);
        marketBtnRef.current?.focus();
      }
    }
    function onPointer(e: MouseEvent) {
      if (marketRef.current && !marketRef.current.contains(e.target as Node)) {
        setMarketOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [marketOpen]);

  return (
    <header className="sticky top-3 z-50 mx-3 flex w-full max-w-5xl items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/85 px-4 py-2.5 backdrop-blur-xl [backdrop-filter:saturate(150%)] shadow-[0_8px_40px_-12px_color-mix(in_srgb,var(--primary)_18%,transparent)] md:mx-auto">
      <Link
        href={`/${locale}`}
        aria-label="LandMap - ir para a pÃ¡gina inicial"
        className={`group flex items-center gap-2 text-sm font-semibold tracking-tight ${focusRing}`}
      >
        <img
          src="/landmap-logo-transparent.png"
          alt="LandMap"
          className="h-6 w-auto object-contain transition group-hover:scale-105"
        />
      </Link>

      <nav
        aria-label="NavegaÃ§Ã£o principal"
        className="hidden items-center gap-1 text-sm text-[var(--muted-foreground)] md:flex"
      >
        {primaryLinks.map((link) => {
          const href = `/${locale}/${link.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={link.href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-full px-3 py-1.5 transition ${focusRing} ${
                isActive
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {link.labelKey}
            </Link>
          );
        })}

        <div ref={marketRef} className="relative">
          <button
            type="button"
            ref={marketBtnRef}
            aria-haspopup="true"
            aria-expanded={marketOpen}
            aria-label="Abrir menu Mercado"
            onClick={() => setMarketOpen((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition ${focusRing} ${
              marketOpen || marketActive
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            Mercado
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={`transition-transform duration-200 ${marketOpen ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {marketOpen && (
            <div
              role="menu"
              aria-label="Mercado"
              className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 p-2 backdrop-blur-xl shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--primary)_22%,transparent)]"
            >
              {marketLinks.map((link) => {
                const href = `/${locale}/${link.href}`;
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={link.href}
                    href={href}
                    role="menuitem"
                    aria-current={isActive ? 'page' : undefined}
                    className={`block rounded-xl px-3 py-2 text-sm transition ${focusRing} ${
                      isActive 
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {link.labelKey}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-2">
        <span className="hidden md:block">
          <NotificationCenter />
        </span>

        <PlanBadge />

        <span className="hidden items-center gap-0.5 rounded-full border border-[var(--border)] bg-[var(--card)] p-0.5 md:flex">
          {locales.map((l) => (
            <Button
              key={l.code}
              variant={locale === l.code ? 'default' : 'ghost'}
              aria-label={`Mudar idioma para ${l.label}`}
              aria-pressed={locale === l.code}
              className={`!px-2.5 !py-0.5 !text-xs ${
                locale === l.code ? '' : 'text-[var(--muted-foreground)]'
              }`}
              onClick={() => switchLocale(l.code)}
            >
              {l.label}
            </Button>
          ))}
        </span>

        {user ? (
          <button
            type="button"
            onClick={() => signOut()}
            title={user.email}
            aria-label="Sair da conta (mock)"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[var(--primary)]/90 ${focusRing} max-md:hidden`}
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href={`/${locale}/map`}
              onClick={() => {
                ensureFreeAccess();
                try {
                  localStorage.setItem('landmap:selected_plan', 'free');
                } catch {
                  /* ignore */
                }
              }}
              className={`inline-flex h-9 items-center rounded-xl bg-[var(--primary)] px-3.5 text-sm font-medium text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[var(--primary)]/90 ${focusRing}`}
            >
              Começar grátis
            </Link>
            <Link
              href={`/${locale}/auth`}
              className={`inline-flex h-9 items-center rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)] ${focusRing}`}
            >
              Entrar
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)] md:hidden ${focusRing}`}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`absolute inset-x-3 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 backdrop-blur-xl shadow-[var(--shadow-card)] md:hidden ${
          mobileOpen ? 'block' : 'hidden'
        }`}
      >
        <nav aria-label="NavegaÃ§Ã£o principal (mobile)" className="flex flex-col gap-0.5">
          {allLinks.map((link) => {
            const href = `/${locale}/${link.href}`;
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={link.href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm transition ${focusRing} ${
                  isActive ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {link.labelKey}
              </Link>
            );
          })}
          <div className="mt-2 flex flex-col gap-2 border-t border-[var(--border)] px-1 pt-3">
            {!user && (
              <>
                <Link
                  href={`/${locale}/map`}
                  onClick={() => {
                    ensureFreeAccess();
                    try {
                      localStorage.setItem('landmap:selected_plan', 'free');
                    } catch {
                      /* ignore */
                    }
                    setMobileOpen(false);
                  }}
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] ${focusRing}`}
                >
                  Começar grátis — mapa
                </Link>
                <Link
                  href={`/${locale}/auth`}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--border)] text-sm font-medium ${focusRing}`}
                >
                  Entrar / criar conta
                </Link>
              </>
            )}
            <div className="flex items-center justify-end gap-2">
              <span className="flex items-center gap-1">
                {locales.map((l) => (
                  <Button
                    key={l.code}
                    variant={locale === l.code ? 'default' : 'ghost'}
                    aria-label={`Mudar idioma para ${l.label}`}
                    aria-pressed={locale === l.code}
                    className={`!px-3 !py-1 !text-xs ${
                      locale === l.code ? '' : 'text-[var(--muted-foreground)]'
                    }`}
                    onClick={() => switchLocale(l.code)}
                  >
                    {l.label}
                  </Button>
                ))}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
