'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LineChart,
  Building2,
  Star,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  BellRing,
  ShieldCheck,
  Activity,
  ChevronRight,
  ChevronDown,
} from './lovable/icons';

const ICONS = {
  dashboard: LineChart,
  properties: Building2,
  leads: Star,
  analytics: SlidersHorizontal,
  exports: ArrowUpDown,
  webhooks: Layers,
  settings: BellRing,
  audit: ShieldCheck,
} as const;

type IconKey = keyof typeof ICONS;

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';
  const [collapsed, setCollapsed] = useState(false);

  const links: { href: string; icon: IconKey; label: string }[] = [
    { href: `/${locale}/admin`, icon: 'dashboard', label: 'Dashboard' },
    { href: `/${locale}/admin/properties`, icon: 'properties', label: 'Imóveis' },
    { href: `/${locale}/admin/leads`, icon: 'leads', label: 'Leads' },
    { href: `/${locale}/admin/analytics`, icon: 'analytics', label: 'Analytics' },
    { href: `/${locale}/admin/exports`, icon: 'exports', label: 'Exportações' },
    { href: `/${locale}/admin/webhooks`, icon: 'webhooks', label: 'Webhooks' },
    { href: `/${locale}/admin/settings`, icon: 'settings', label: 'Configurações' },
    { href: `/${locale}/admin/audit`, icon: 'audit', label: 'Auditoria' },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Toggle */}
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          className="rounded-lg p-1.5 text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {!collapsed && (
          <span className="ml-3 text-xs font-medium tracking-widest text-[var(--muted-foreground)] uppercase">
            Admin
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = ICONS[link.icon];
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
              title={link.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-[var(--border)] p-3">
          <Link
            href={`/${locale}`}
            className="block rounded-lg px-3 py-2 text-[11px] text-[var(--muted-foreground)] transition hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← Voltar ao site
          </Link>
        </div>
      )}
    </aside>
  );
}
