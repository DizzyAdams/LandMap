'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { Bell, BellRing, Check, Trash2, ArrowLeft, LandMapWordmark } from '../../../components/lovable/icons';

interface Notif {
  id: string;
  title: string;
  description: string;
  unread: boolean;
}

export default function NotificationsPage() {
  const locale = useLocale();
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    load();
  }, []);

  function load() {
    try {
      const rawAlerts = localStorage.getItem('landmap_alerts');
      const rawFavs = localStorage.getItem('landmap_favorites');
      const readRaw = localStorage.getItem('landmap:notif_read');
      const read = readRaw ? (JSON.parse(readRaw) as string[]) : [];
      const alerts = rawAlerts ? (JSON.parse(rawAlerts) as Array<{ id?: string; label?: string; city?: string }>) : [];
      const favs = rawFavs ? (JSON.parse(rawFavs) as unknown[]) : [];

      const list: Notif[] = [];
      alerts.forEach((a, i) => {
        const id = `alert-${a.id ?? i}`;
        list.push({
          id,
          title: `Alerta: ${a.label ?? 'sem rótulo'}`,
          description: a.city ? `Cidade: ${a.city}` : 'Match de filtro salvo',
          unread: !read.includes(id),
        });
      });
      favs.forEach((f, i) => {
        const id = typeof f === 'string' ? `fav-${f}` : `fav-${(f as { id?: string })?.id ?? i}`;
        list.push({
          id,
          title: 'Favorito salvo',
          description: `Imóvel ${(typeof f === 'string' ? f : (f as { id?: string })?.id ?? '')}`,
          unread: !read.includes(id),
        });
      });
      setItems(list);
    } catch {
      setItems([]);
    }
  }

  function markAllRead() {
    try {
      localStorage.setItem('landmap:notif_read', JSON.stringify(items.map((i) => i.id)));
      setItems((prev) => prev.map((i) => ({ ...i, unread: false })));
    } catch {
      /* noop */
    }
  }

  function clearAll() {
    try {
      localStorage.setItem('landmap_alerts', '[]');
      localStorage.setItem('landmap_favorites', '[]');
      localStorage.setItem('landmap:notif_read', '[]');
      setItems([]);
    } catch {
      /* noop */
    }
  }

  const unreadCount = items.filter((i) => i.unread).length;

  return (
    <ProductPageShell
      backHref={`/${locale}`}
      eyebrow="Notificações"
      title="Central de notificações"
      description="Seus matches de imóveis, alertas e favoritos em um só lugar."
      maxWidth="5xl"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Badge variant={unreadCount ? 'info' : 'secondary'}>
          {unreadCount ? `${unreadCount} não lidas` : 'Tudo lido'}
        </Badge>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={markAllRead} disabled={!unreadCount}>
            <Check className="h-4 w-4" /> Marcar como lidas
          </Button>
          <Button variant="ghost" onClick={clearAll} disabled={!items.length}>
            <Trash2 className="h-4 w-4" /> Limpar tudo
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <Card variant="default" className="flex flex-col items-center gap-2 py-14 text-center">
          <Bell className="h-6 w-6 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">
            Nenhum alerta ainda. Salve imóveis e filtros para receber matches.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.id} variant="interactive" className="flex items-start gap-3 p-4">
              <div className="mt-0.5">
                {it.unread ? (
                  <BellRing className="h-5 w-5 text-[var(--primary)]" />
                ) : (
                  <Bell className="h-5 w-5 text-[var(--muted-foreground)]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-[var(--foreground)]">{it.title}</p>
                <p className="truncate text-xs text-[var(--muted-foreground)]">{it.description}</p>
              </div>
              {it.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]" />}
            </Card>
          ))}
        </div>
      )}
    </ProductPageShell>
  );
}
