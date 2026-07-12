'use client';

import { useState, useEffect } from 'react';

type WebhookConfig = {
  url: string;
  events: string[];
};

const STORAGE_KEY = 'landmap_webhooks';
const AVAILABLE_EVENTS = [
  'property.created',
  'property.updated',
  'property.deleted',
  'lead.created',
  'lead.updated',
];

export default function AdminWebhooksPage() {
  const [config, setConfig] = useState<WebhookConfig>({ url: '', events: ['property.created'] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig(JSON.parse(stored));
    } catch {}
  }, []);

  function toggleEvent(event: string) {
    setConfig((prev) => {
      const has = prev.events.includes(event);
      return {
        ...prev,
        events: has
          ? prev.events.filter((e) => e !== event)
          : [...prev.events, event],
      };
    });
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <span className="kicker">Integrações</span>
      <h2 className="mt-2 text-lg font-medium text-[var(--foreground)]">Webhooks</h2>
      <p className="mt-1 text-xs text-[var(--muted-foreground-lovable)]">
        Configurar URLs de callback para eventos do LandMap
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-6 max-w-lg">
        <div className="space-y-5">
          {/* URL input */}
          <label className="block">
            <span className="mb-1 block text-[11px] text-[var(--muted-foreground-lovable)]">URL do Webhook</span>
            <input
              type="url"
              value={config.url}
              onChange={(e) => {
                setConfig((prev) => ({ ...prev, url: e.target.value }));
                setSaved(false);
              }}
              placeholder="https://exemplo.com/webhook"
              className="w-full rounded-lg border border-[var(--border-lovable)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground-lovable)] focus:border-[var(--primary)]"
            />
          </label>

          {/* Events */}
          <div>
            <p className="mb-2 text-[11px] text-[var(--muted-foreground-lovable)]">Eventos</p>
            <div className="space-y-2">
              {AVAILABLE_EVENTS.map((event) => (
                <label
                  key={event}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border-lovable)] bg-[var(--muted-lovable)] px-3 py-2 transition hover:border-[var(--primary)]"
                >
                  <input
                    type="checkbox"
                    checked={config.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="h-4 w-4 rounded border-[var(--border-lovable)] bg-[var(--card)] accent-[var(--primary)]"
                  />
                  <span className="text-xs text-[var(--foreground)] font-mono">{event}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary)]/90"
          >
            {saved ? '✓ Salvo' : 'Salvar Configuração'}
          </button>

          {config.url && (
            <p className="text-xs text-[var(--muted-foreground-lovable)]">
              Webhook configurado para: <span className="text-[var(--foreground)]">{config.url}</span>
              <br />
              Eventos: {config.events.length > 0 ? config.events.join(', ') : 'nenhum'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
