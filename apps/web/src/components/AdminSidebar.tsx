'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';
  const [collapsed, setCollapsed] = useState(false);

  const links = [
    { href: `/${locale}/admin`, icon: '◈', label: 'Dashboard' },
    { href: `/${locale}/admin/properties`, icon: '🏢', label: 'Imóveis' },
    { href: `/${locale}/admin/leads`, icon: '📋', label: 'Leads' },
    { href: `/${locale}/admin/analytics`, icon: '📊', label: 'Analytics' },
    { href: `/${locale}/admin/exports`, icon: '📤', label: 'Exportações' },
    { href: `/${locale}/admin/webhooks`, icon: '🔗', label: 'Webhooks' },
    { href: `/${locale}/admin/settings`, icon: '⚙️', label: 'Configurações' },
    { href: `/${locale}/admin/audit`, icon: '📝', label: 'Auditoria' },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-neutral-800 bg-neutral-900/40 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Toggle */}
      <div className="flex h-14 items-center border-b border-neutral-800 px-4">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-800 hover:text-neutral-300"
          title={collapsed ? 'Expandir' : 'Recolher'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
        {!collapsed && (
          <span className="ml-3 text-xs font-medium tracking-widest text-neutral-400 uppercase">
            Admin
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-neutral-800 text-neutral-50'
                  : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
              }`}
              title={link.label}
            >
              <span className="shrink-0 text-base">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-neutral-800 p-3">
          <Link
            href={`/${locale}`}
            className="block rounded-lg px-3 py-2 text-[11px] text-neutral-600 transition hover:bg-neutral-800 hover:text-neutral-400"
          >
            ← Voltar ao site
          </Link>
        </div>
      )}
    </aside>
  );
}
