'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Code2,
  Plug,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Link2,
  Activity,
} from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { PlanGate } from '../../../components/PlanGate';
import { Card, Badge, Button, Stat, Progress, Input } from '@landmap/ui';

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: number;
  lastUsed: number | null;
};

type Webhook = {
  id: string;
  url: string;
  event: string;
  active: boolean;
};

const KEYS_KEY = 'landmap:apikeys';
const HOOKS_KEY = 'landmap:webhooks';
const EVENTS = ['property.created', 'region.updated', 'alert.triggered'];

const QUOTA = 50000;
const REQ_TODAY = 18420;

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function genKey(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    let hex = '';
    for (const b of bytes) hex += b.toString(16).padStart(2, '0');
    return 'lm_live_' + hex;
  }
  return 'lm_live_' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR');
}

export default function ApiKeysPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [hooks, setHooks] = useState<Webhook[]>([]);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEvent, setNewEvent] = useState(EVENTS[0]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setKeys(read<ApiKey[]>(KEYS_KEY, []));
    setHooks(
      read<Webhook[]>(HOOKS_KEY, [
        { id: genId(), url: 'https://app.exemplo.com/webhooks/landmap', event: 'property.created', active: true },
      ]),
    );
  }, []);

  function addKey() {
    const k: ApiKey = {
      id: genId(),
      name: newName.trim() || `Chave ${keys.length + 1}`,
      key: genKey(),
      createdAt: Date.now(),
      lastUsed: null,
    };
    const next = [k, ...keys];
    setKeys(next);
    write(KEYS_KEY, next);
    setNewName('');
  }

  function revokeKey(id: string) {
    const next = keys.filter((k) => k.id !== id);
    setKeys(next);
    write(KEYS_KEY, next);
  }

  function copyKey(k: ApiKey) {
    try {
      window.navigator.clipboard?.writeText(k.key).then(() => {
        setCopied(k.id);
        window.setTimeout(() => setCopied(null), 1500);
      });
    } catch {
      /* ignore */
    }
  }

  function toggleHook(id: string) {
    const next = hooks.map((h) => (h.id === id ? { ...h, active: !h.active } : h));
    setHooks(next);
    write(HOOKS_KEY, next);
  }

  function addHook() {
    if (!newUrl.trim()) return;
    const h: Webhook = { id: genId(), url: newUrl.trim(), event: newEvent, active: true };
    const next = [h, ...hooks];
    setHooks(next);
    write(HOOKS_KEY, next);
    setNewUrl('');
  }

  function removeHook(id: string) {
    const next = hooks.filter((h) => h.id !== id);
    setHooks(next);
    write(HOOKS_KEY, next);
  }

  const usagePct = Math.min(100, Math.round((REQ_TODAY / QUOTA) * 100));
  const activeHooks = hooks.filter((h) => h.active).length;

  return (
    <ProductPageShell
      backHref="/plans"
      eyebrow={
        <>
          <Code2 className="h-3 w-3" /> API &amp; Webhooks
        </>
      }
      title="Chaves de API"
      description="Acesso programático ao seu intelligence de imóveis. Gere chaves, monitore o consumo e conecte webhooks em tempo real."
      maxWidth="5xl"
    >
      <PlanGate required="business">
        {/* Chaves de API */}
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="font-semibold">Chaves de API</h2>
            </div>
            <Button onClick={addKey} size="sm">
              <Plus className="h-4 w-4" /> Gerar nova chave
            </Button>
          </div>

          <div className="mt-4">
            <Input
              placeholder="Nome da chave (opcional)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          {keys.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--muted-foreground)]">
              Nenhuma chave ainda. Gere uma chave para começar a integrar.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {keys.map((k) => {
                const shown = revealed[k.id];
                const display = shown ? k.key : `${k.key.slice(0, 12)}${'•'.repeat(8)}`;
                return (
                  <div
                    key={k.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--accent)] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{k.name}</p>
                      <p className="mt-0.5 break-all font-mono text-xs text-[var(--muted-foreground)]">
                        {display}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
                        Criada em {fmtDate(k.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={shown ? 'Ocultar chave' : 'Mostrar chave'}
                        onClick={() => setRevealed((r) => ({ ...r, [k.id]: !shown }))}
                      >
                        {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Copiar chave"
                        onClick={() => copyKey(k)}
                      >
                        <Copy className="h-4 w-4" />
                        {copied === k.id ? 'Copiado' : ''}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Revogar chave"
                        onClick={() => revokeKey(k.id)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Uso da API */}
        <section className="mt-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Activity className="h-4 w-4 text-[var(--primary)]" /> Uso da API
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat
              label="Requisições hoje"
              value={REQ_TODAY.toLocaleString('pt-BR')}
              hint="atualizado agora"
            />
            <Stat label="Cota mensal" value="50.000" hint="plano Business" />
            <Stat
              label="Webhooks ativos"
              value={activeHooks}
              hint={`${hooks.length} configurado${hooks.length === 1 ? '' : 's'}`}
            />
          </div>

          <Card className="mt-3 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Consumo mensal</span>
              <span className="font-medium">
                {usagePct}% · {REQ_TODAY.toLocaleString('pt-BR')} / {QUOTA.toLocaleString('pt-BR')}
              </span>
            </div>
            <Progress value={usagePct} className="mt-2" />
          </Card>
        </section>

        {/* Webhooks */}
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-[var(--primary)]" />
              <h2 className="font-semibold">Webhooks</h2>
            </div>
            <Badge variant="info">
              {hooks.length} endpoint{hooks.length === 1 ? '' : 's'}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Input
              className="min-w-[200px] flex-1"
              placeholder="https://seu-app.com/webhook"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <select
              value={newEvent}
              onChange={(e) => setNewEvent(e.target.value)}
              className="h-9 rounded-md border border-[var(--border)] bg-[var(--card)] px-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
            >
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
            <Button onClick={addHook} size="sm">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          {hooks.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--border)] p-4 text-center text-sm text-[var(--muted-foreground)]">
              Nenhum webhook configurado.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-2">
              {hooks.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--accent)] p-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {h.active ? (
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--success)]" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--warning)]" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs">{h.url}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{h.event}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant={h.active ? 'success' : 'warning'}>
                      {h.active ? 'ativo' : 'inativo'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={h.active ? 'Desativar webhook' : 'Ativar webhook'}
                      onClick={() => toggleHook(h.id)}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remover webhook"
                      onClick={() => removeHook(h.id)}
                    >
                      <Trash2 className="h-4 w-4 text-[var(--destructive)]" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Demonstração — dados salvos apenas neste navegador (localStorage). Sem rede.
        </p>
      </PlanGate>
    </ProductPageShell>
  );
}
