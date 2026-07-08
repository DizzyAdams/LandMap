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
      <h2 className="text-lg font-medium text-neutral-50">Webhooks</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Configurar URLs de callback para eventos do LandMap
      </p>

      <div className="mt-8 max-w-lg space-y-5">
        {/* URL input */}
        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-500">URL do Webhook</span>
          <input
            type="url"
            value={config.url}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, url: e.target.value }));
              setSaved(false);
            }}
            placeholder="https://exemplo.com/webhook"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-50 outline-none placeholder:text-neutral-700 focus:border-neutral-500"
          />
        </label>

        {/* Events */}
        <div>
          <p className="mb-2 text-[11px] text-neutral-500">Eventos</p>
          <div className="space-y-2">
            {AVAILABLE_EVENTS.map((event) => (
              <label
                key={event}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/20 px-3 py-2 transition hover:border-neutral-700"
              >
                <input
                  type="checkbox"
                  checked={config.events.includes(event)}
                  onChange={() => toggleEvent(event)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 accent-neutral-50"
                />
                <span className="text-xs text-neutral-300 font-mono">{event}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="rounded-lg bg-neutral-50 px-4 py-2 text-xs font-medium text-[#050505] transition hover:bg-neutral-200"
        >
          {saved ? '✓ Salvo' : 'Salvar Configuração'}
        </button>

        {config.url && (
          <p className="text-xs text-neutral-600">
            Webhook configurado para: <span className="text-neutral-400">{config.url}</span>
            <br />
            Eventos: {config.events.length > 0 ? config.events.join(', ') : 'nenhum'}
          </p>
        )}
      </div>
    </div>
  );
}
