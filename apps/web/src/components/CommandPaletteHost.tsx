'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommandPalette, type CommandGroup } from '@landmap/ui';
import { useActiveLocale, localeHref } from '../lib/locale';

const NAV = [
  { href: '', label: 'Início' },
  { href: 'search', label: 'Buscar' },
  { href: 'map', label: 'Mapa' },
  { href: 'studio', label: 'Studio' },
  { href: 'live', label: 'Live' },
  { href: 'sales', label: 'Vendas' },
  { href: 'insights', label: 'Insights' },
  { href: 'pricing', label: 'Preços' },
  { href: 'alerts', label: 'Alertas' },
  { href: 'favorites', label: 'Favoritos' },
  { href: 'compare', label: 'Comparar' },
  { href: 'calculator', label: 'Calculadora' },
  { href: 'chat', label: 'Chat IA' },
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
