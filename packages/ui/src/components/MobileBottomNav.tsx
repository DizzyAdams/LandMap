'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { cn } from '../lib/index';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const ITEMS: NavItem[] = [
  {
    href: 'search',
    label: 'Buscar',
    icon: (
      <svg {...ICON_PROPS}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    ),
  },
  {
    href: 'map',
    label: 'Mapa',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
      </svg>
    ),
  },
  {
    href: 'favorites',
    label: 'Favoritos',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 21s-7.5-4.6-10-9.2C.5 8.4 2.2 5 5.5 5c2 0 3.4 1.2 4.5 2.6C11.1 6.2 12.5 5 14.5 5 17.8 5 19.5 8.4 22 11.8 19.5 16.4 12 21 12 21Z" />
      </svg>
    ),
  },
  {
    href: 'compare',
    label: 'Comparar',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M12 3v18" />
        <path d="M5 7h4l-1.5 3.5H5L3.5 7Z" />
        <path d="M15 7h4l-1.5 3.5H15L13.5 7Z" />
        <path d="M3 7h4" />
        <path d="M13 7h4" />
        <path d="M4 18h6" />
        <path d="M14 18h6" />
      </svg>
    ),
  },
  {
    href: 'chat',
    label: 'Chat',
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z" />
      </svg>
    ),
  },
];

/**
 * Mobile-only bottom navigation bar (glass). Visible only below `md`.
 * Highlights the active route via `usePathname` / `useParams`.
 */
export function MobileBottomNav() {
  const params = useParams<{ locale?: string }>();
  const pathname = usePathname();
  const locale = params?.locale ?? 'pt-BR';

  const isActive = (href: string) => {
    const full = `/${locale}/${href}`;
    return pathname === full || pathname.startsWith(href + '/');
  };

  return (
    <nav
      aria-label="Navegação principal (mobile)"
      className="fixed inset-x-0 bottom-0 z-50 flex items-stretch border-t border-neutral-800 bg-[#050505]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={`/${locale}/${item.href}`}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 outline-none transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]',
              'motion-reduce:transition-none',
              active ? 'text-emerald-300' : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

MobileBottomNav.displayName = 'MobileBottomNav';
