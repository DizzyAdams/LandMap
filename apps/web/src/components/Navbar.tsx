'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@landmap/ui';
import { Logo } from './Logo';

const locales = [
  { code: 'pt-BR', label: 'PT' },
  { code: 'en-US', label: 'EN' },
  { code: 'es-ES', label: 'ES' },
];

const links = [
  { href: 'search', labelKey: 'Buscar' },
  { href: 'map', labelKey: 'Mapa' },
  { href: 'studio', labelKey: 'Studio' },
  { href: 'live', labelKey: 'Live' },
  { href: 'pricing', labelKey: 'Preços' },
  { href: 'alerts', labelKey: 'Alertas' },
  { href: 'favorites', labelKey: 'Favoritos' },
  { href: 'compare', labelKey: 'Comparar' },
];

export function Navbar() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'pt-BR';

  function switchLocale(newLocale: string) {
    const segments = pathname.split('/').filter(Boolean);
    if (locales.some((l) => l.code === segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    window.location.href = '/' + segments.join('/');
  }

  return (
    <header className="sticky top-0 z-40 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 glass border-b hairline">
      <Link href={`/${locale}`} className="group flex items-center gap-2 text-sm font-semibold tracking-tight">
        <Logo className="h-5 w-5 transition group-hover:scale-110" />
        <span className="text-gradient">LandMap</span>
      </Link>

      <nav className="flex items-center gap-4 text-sm text-neutral-300">
        {links.map((link) => {
          const href = `/${locale}/${link.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={link.href}
              href={href}
              className={`transition ${
                isActive ? 'text-white' : 'hover:text-white'
              }`}
            >
              {link.labelKey}
            </Link>
          );
        })}

        <span className="mx-1 h-4 w-px bg-white/10" />

        {locales.map((l) => (
          <Button
            key={l.code}
            variant={locale === l.code ? 'default' : 'ghost'}
            className={`!px-2 !py-0.5 !text-xs ${
              locale === l.code ? '' : 'text-neutral-400'
            }`}
            onClick={() => switchLocale(l.code)}
          >
            {l.label}
          </Button>
        ))}
      </nav>
    </header>
  );
}
