'use client';

import { useCallback, useEffect, useState } from 'react';
import { Layers } from '../../../../components/lovable/icons';
import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  listWebhookDeliveries,
  listWebhookEndpoints,
  testWebhookEndpoint,
  type WebhookDelivery,
  type WebhookEndpoint,
  type WebhookEventType,
} from '../../../../lib/api';

const AVAILABLE_EVENTS: WebhookEventType[] = [
  'property.created',
  'property.updated',
  'property.deleted',
  'lead.created',
  'lead.updated',
  'alert.fired',
  'rag.query',
  'score.updated',
  'favorite.added',
  'ping',
];

export default function AdminWebhooksPage() {
  const [items, setItems] = useState<WebhookEndpoint[]>([]);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [name, setName] = useState('Meu projeto');
  const [url, setUrl] = useState('https://webhook.site/your-id');
  const [events, setEvents] = useState<WebhookEventType[]>(['ping', 'rag.query', 'lead.created']);
  const [lastSecret, setLastSecret] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [eps, dels] = await Promise.all([
        listWebhookEndpoints(),
        listWebhookDeliveries(40),
      ]);
      setItems(eps.items);
      setDeliveries(dels.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'API indisponível');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function toggleEvent(event: WebhookEventType) {
    setEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event],
    );
  }

  async function handleCreate() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await createWebhookEndpoint({ name, url, events });
      setLastSecret(res.endpoint.secret);
      setMsg(`Endpoint ${res.endpoint.id} criado. Guarde o secret (mostrado uma vez).`);
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao criar');
    } finally {
      setBusy(false);
    }
  }

  async function handleTest(id: string) {
    setBusy(true);
    try {
      const res = await testWebhookEndpoint(id);
      const d = res.deliveries[0];
      setMsg(
        d
          ? d.ok
            ? `Ping OK · HTTP ${d.status} · ${d.durationMs}ms`
            : `Ping falhou · ${d.error || d.status}`
          : 'Sem delivery (endpoint inativo?)',
      );
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Teste falhou');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setBusy(true);
    try {
      await deleteWebhookEndpoint(id);
      setMsg('Removido');
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erro ao remover');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--primary)]">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Integrações</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Webhooks
          </h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Conecte outros projetos — HMAC-SHA256 em{' '}
            <code className="text-xs">X-LandMap-Signature</code>
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 text-sm text-[var(--muted-foreground)]">
          {error}
          <br />
          <span className="text-xs">Garanta proxy `/api` → Hono com rota `/webhooks`.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Novo endpoint</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11px] text-[var(--muted-foreground)]">Nome</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] text-[var(--muted-foreground)]">
                URL (https ou localhost)
              </span>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://meu-app.com/hooks/landmap"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
              />
            </label>
            <div>
              <p className="mb-2 text-[11px] text-[var(--muted-foreground)]">Eventos</p>
              <div className="grid max-h-48 gap-1 overflow-y-auto sm:grid-cols-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label
                    key={event}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={events.includes(event)}
                      onChange={() => toggleEvent(event)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="font-mono text-[10px] text-[var(--foreground)]">{event}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleCreate()}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-foreground)] transition hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              Criar endpoint
            </button>
            {lastSecret && (
              <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-3 text-xs">
                <p className="font-medium text-[var(--primary)]">Secret (copie agora)</p>
                <code className="mt-1 block break-all font-mono text-[var(--foreground)]">
                  {lastSecret}
                </code>
              </div>
            )}
            {msg && <p className="text-xs text-[var(--muted-foreground)]">{msg}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-semibold">Endpoints ({items.length})</h2>
            <ul className="mt-3 space-y-3">
              {items.length === 0 && (
                <li className="text-xs text-[var(--muted-foreground)]">Nenhum ainda.</li>
              )}
              {items.map((ep) => (
                <li
                  key={ep.id}
                  className="rounded-xl border border-[var(--border)] bg-[var(--muted)] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{ep.name}</p>
                      <p className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        {ep.id}
                      </p>
                      <p className="mt-1 truncate text-xs">{ep.url}</p>
                      <p className="mt-1 font-mono text-[10px] text-[var(--muted-foreground)]">
                        {ep.events.join(', ')}
                      </p>
                      {ep.lastDeliveryAt && (
                        <p className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                          Último: {ep.lastStatus ?? '—'} · {ep.lastDeliveryAt}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleTest(ep.id)}
                        className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] hover:border-[var(--primary)]"
                      >
                        Test ping
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleDelete(ep.id)}
                        className="rounded-lg border border-[var(--border)] px-2 py-1 text-[10px] text-[var(--destructive)] hover:border-[var(--destructive)]"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-semibold">Entregas recentes</h2>
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {deliveries.length === 0 && (
                <li className="text-xs text-[var(--muted-foreground)]">Sem entregas.</li>
              )}
              {deliveries.map((d) => (
                <li
                  key={d.id + d.createdAt}
                  className="flex justify-between gap-2 font-mono text-[10px] text-[var(--muted-foreground)]"
                >
                  <span>
                    {d.event} · {d.ok ? 'OK' : 'FAIL'} {d.status ?? d.error}
                  </span>
                  <span>{d.durationMs}ms</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-xs text-[var(--muted-foreground)]">
        <p className="font-medium text-[var(--foreground)]">Como conectar outro projeto</p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-[var(--muted)] p-3 font-mono text-[10px] text-[var(--foreground)]">{`curl -X POST $API/webhooks/endpoints \\
  -H 'content-type: application/json' \\
  -d '{"name":"outro-app","url":"https://…","events":["rag.query","lead.created"]}'

# Verificar assinatura (Node):
# crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
# compare com header X-LandMap-Signature (sem prefixo sha256=)`}</pre>
      </div>
    </div>
  );
}
