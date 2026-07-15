'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommandPalette, type CommandGroup } from '@landmap/ui';
import { useActiveLocale, localeHref } from '../lib/locale';

const NAV = [
  { href: '', label: 'Início' },
  { href: 'onboarding', label: 'Conheça o LandMap' },
  { href: 'plans', label: 'Planos' },
  { href: 'map', label: 'Mapa' },
  { href: 'favorites', label: 'Favoritos' },
  { href: 'compare', label: 'Comparar' },
  { href: 'dashboard', label: 'Dashboard' },
  { href: 'regions', label: 'Regiões' },
];

/**
 * Global ⌘K / Ctrl+K command palette. Mounted once in the locale layout so the
 * shortcut advertised by ShortcutsHelp actually does something.
 */
export function CommandPaletteHost() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useActiveLocale();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const groups: CommandGroup[] = [
    {
      heading: 'Ir para',
      items: NAV.map((n) => ({
        id: `nav-${n.href || 'home'}`,
        label: n.label,
        hint: n.href ? `/${n.href}` : '/',
        tone: 'neutral',
        onSelect: () => {
          setOpen(false);
          router.push(localeHref(n.href ? `/${n.href}` : '/', locale));
        },
      })),
    },
  ];

  return <CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} />;
}
