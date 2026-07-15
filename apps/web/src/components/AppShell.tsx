'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { useTranslations } from 'next-intl';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const navItems: { href: string; label: string; icon: string; emBreve?: boolean }[] = [
  { href: 'regions', label: 'Regiões', icon: 'regions' },
  { href: 'favorites', label: 'Favoritos', icon: 'star' },
  { href: 'compare', label: 'Comparar', icon: 'compare' },
  { href: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { href: 'search', label: 'Buscar', icon: 'search' },
  { href: 'map', label: 'Mapa', icon: 'map' },
  { href: 'admin', label: 'Admin', icon: 'settings' },
];

function Icon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'map': return (<svg {...common}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></svg>);
    case 'grid': return (<svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>);
    case 'compare': return (<svg {...common}><path d="M12 3v18" /><path d="M5 7l-2 2 2 2" /><path d="M19 13l2 2-2 2" /></svg>);
    case 'star': return (<svg {...common}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.1l1-5.8L3.5 9.2l5.9-.9Z" /></svg>);
    case 'bell': return (<svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>);
    case 'file': return (<svg {...common}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>);
    case 'sparkles': return (<svg {...common}><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8Z" /><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9Z" /></svg>);
    case 'settings': return (<svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14.6H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7L4.5 7a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 17 4.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" /></svg>);
    case 'regions': return (<svg {...common}><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>);
    default: return null;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'pt-BR';
  const [mobileNav, setMobileNav] = useState(false);

  const isActive = (href: string) => {
    const full = `/${locale}/${href}`;
    return pathname === full || pathname.startsWith(full + '/');
  };

  const bottomItems = navItems.slice(0, 4);

  useEffect(() => { setMobileNav(false); }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar desktop 68px — azul LandMap #003594 */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[68px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--secondary)] py-4 backdrop-blur-xl md:flex">
        <Link href={`/${locale}`} aria-label="LandMap" className={`mb-6 rounded-xl p-1.5 ${focusRing}`}>
          <Logo className="h-7 w-7" />
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1" aria-label="Navegação do app">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}/${item.href}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
              title={item.label}
              className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition ${focusRing} ${
                  isActive(item.href) 
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' 
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {isActive(item.href) && (
                <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r bg-[var(--primary)]" />
              )}
              <Icon name={item.icon} />
              {item.emBreve && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
              )}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Coluna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header sticky h-16 */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 backdrop-blur-xl md:px-6">
          <div className="relative flex-1 max-w-xl">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              type="search"
              placeholder="Buscar imóveis, cidades, bairros…"
              aria-label="Buscar"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--muted)] py-2 pl-9 pr-12 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]/50"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">⌘K</kbd>
          </div>

          <button type="button" aria-label="Notificações" className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition hover:border-[var(--primary)]/40 ${focusRing}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--primary)]" />
          </button>

          <div className="relative">
            <button type="button" aria-label="Conta" className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] ring-1 ring-[var(--border)] ${focusRing}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="min-w-0 flex-1 pt-16 md:pt-0">{children}</main>
      </div>

      {/* Bottom nav mobile 4 colunas */}
      <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--card)] backdrop-blur-xl md:hidden">
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${focusRing} ${
              isActive(item.href) ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
