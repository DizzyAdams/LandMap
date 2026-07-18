'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card } from '@landmap/ui';
import { Activity, Star, Eye, Bell, Plus, Code2 } from '../../../components/lovable/icons';

interface Event {
  id: string;
  icon: 'star' | 'eye' | 'bell' | 'plus' | 'code';
  title: string;
  time: string;
}

function Icon({ kind }: { kind: Event['icon'] }) {
  const cls = 'h-4 w-4 text-[var(--primary)]';
  switch (kind) {
    case 'star':
      return <Star className={cls} />;
    case 'eye':
      return <Eye className={cls} />;
    case 'bell':
      return <Bell className={cls} />;
    case 'plus':
      return <Plus className={cls} />;
    case 'code':
      return <Code2 className={cls} />;
  }
}

function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ActivityPage() {
  const locale = useLocale();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    try {
      const now = Date.now();
      const list: Event[] = [];
      let i = 0;
      const step = 1000 * 60 * 7;

      const favs = JSON.parse(localStorage.getItem('landmap_favorites') ?? '[]') as unknown[];
      favs.forEach((f) => {
        list.push({
          id: `fav-${i}`,
          icon: 'star',
          title: `Favoritou imóvel ${(typeof f === 'string' ? f : (f as { id?: string })?.id ?? '')}`,
          time: fmt(now - i * step),
        });
        i++;
      });

      const alerts = JSON.parse(localStorage.getItem('landmap_alerts') ?? '[]') as Array<{ label?: string }>;
      alerts.forEach((a) => {
        list.push({
          id: `alert-${i}`,
          icon: 'bell',
          title: `Criou alerta: ${a.label ?? 'sem rótulo'}`,
          time: fmt(now - i * step),
        });
        i++;
      });

      const watch = JSON.parse(localStorage.getItem('landmap:watchlist') ?? '[]') as unknown[];
      watch.forEach((w) => {
        list.push({
          id: `watch-${i}`,
          icon: 'eye',
          title: `Monitorou região ${typeof w === 'string' ? w : JSON.stringify(w)}`,
          time: fmt(now - i * step),
        });
        i++;
      });

      const team = JSON.parse(localStorage.getItem('landmap:team') ?? '[]') as unknown[];
      team.forEach((t) => {
        list.push({
          id: `team-${i}`,
          icon: 'plus',
          title: `Convidou membro ${(t as { name?: string })?.name ?? ''}`,
          time: fmt(now - i * step),
        });
        i++;
      });

      const keys = JSON.parse(localStorage.getItem('landmap:apikeys') ?? '[]') as unknown[];
      keys.forEach((k) => {
        list.push({
          id: `key-${i}`,
          icon: 'code',
          title: `Gerou chave de API ${(k as { name?: string })?.name ?? ''}`,
          time: fmt(now - i * step),
        });
        i++;
      });

      setEvents(list);
    } catch {
      setEvents([]);
    }
  }, []);

  return (
    <ProductPageShell
      backHref={`/${locale}`}
      eyebrow="Atividade"
      title="Histórico de atividade"
      description="Um resumo das suas ações recentes na plataforma."
      maxWidth="5xl"
    >
      {events.length === 0 ? (
        <Card variant="default" className="flex flex-col items-center gap-2 py-14 text-center">
          <Activity className="h-6 w-6 text-[var(--muted-foreground)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Nenhuma atividade ainda.</p>
        </Card>
      ) : (
        <div className="relative space-y-3 pl-6">
          <span className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border)]" aria-hidden />
          {events.map((ev) => (
            <div key={ev.id} className="relative flex items-start gap-3">
              <span className="absolute -left-6 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]">
                <Icon kind={ev.icon} />
              </span>
              <Card variant="interactive" className="flex-1 p-3">
                <p className="text-sm text-[var(--foreground)]">{ev.title}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{ev.time}</p>
              </Card>
            </div>
          ))}
        </div>
      )}
    </ProductPageShell>
  );
}
