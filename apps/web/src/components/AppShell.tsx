'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import { useEffect, useState, type ComponentType } from 'react';
import {
  ArrowLeftRight,
  Bell,
  LayoutGrid,
  Map,
  MapPin,
  Search,
  Settings,
  Star,
  User,
} from './lovable/icons';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

const navItems: { href: string; label: string; Icon: IconComponent; emBreve?: boolean }[] = [
  { href: 'regions', label: 'Regiões', Icon: MapPin },
  { href: 'favorites', label: 'Favoritos', Icon: Star },
  { href: 'compare', label: 'Comparar', Icon: ArrowLeftRight },
  { href: 'dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { href: 'search', label: 'Buscar', Icon: Search },
  { href: 'map', label: 'Mapa', Icon: Map },
  { href: 'admin', label: 'Admin', Icon: Settings },
];

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

  useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar desktop 68px — indigo LandMap */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[68px] shrink-0 flex-col items-center border-r border-[var(--border)] bg-[var(--sidebar)] py-4 backdrop-blur-xl md:flex">
        <Link href={`/${locale}`} aria-label="LandMap" className={`mb-6 rounded-xl p-1.5 ${focusRing}`}>
          <Image
            src="/landmap-logo-transparent.png"
            alt="LandMap"
            width={24}
            height={24}
            className="h-6 w-auto object-contain"
          />
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
              <item.Icon size={20} />
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
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Buscar imóveis, cidades, bairros…"
              aria-label="Buscar"
              className="w-full rounded-full border border-[var(--border)] bg-[var(--muted)] py-2 pl-9 pr-12 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)]/50"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">
              ⌘K
            </kbd>
          </div>

          <button
            type="button"
            aria-label="Notificações"
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] transition hover:border-[var(--primary)]/40 ${focusRing}`}
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--primary)]" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Conta"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)] ring-1 ring-[var(--border)] ${focusRing}`}
            >
              <User size={18} />
            </button>
          </div>
        </header>

        {/* Conteúdo — pb mobile para bottom nav (antes estava no layout global e vazava no funil) */}
        <main className="min-w-0 flex-1 pt-16 pb-[88px] md:pb-0 md:pt-0">{children}</main>
      </div>

      {/* Bottom nav mobile 4 colunas */}
      <nav
        aria-label="Navegação mobile"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--card)] backdrop-blur-xl md:hidden"
      >
        {bottomItems.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${focusRing} ${
              isActive(item.href) ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            <item.Icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
