'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, Send, LandMapWordmark } from '../../../components/lovable/icons';
import { Card, Badge, Button } from '@landmap/ui';
import { ragQuery } from '../../../lib/api';
import {
  INTELLIGENCE_REGIONS,
  fmtDelta,
  fmtPriceSqm,
  scoreLabel,
  topByValorization,
} from '../../../lib/mapIntelligence';

type Msg = { id: string; role: 'user' | 'ai'; text: string };

function localAnswer(text: string): string {
  const q = text.toLowerCase();
  const region = INTELLIGENCE_REGIONS.find(
    (r) => q.includes(r.name.toLowerCase()) || q.includes(r.city.toLowerCase()),
  );
  if (region) {
    return (
      `${region.name} (${region.city}/${region.state}): Score LandMap ${region.score} (${scoreLabel(region.score)}), ` +
      `${fmtPriceSqm(region.priceSqm)}/m², variação 12m ${fmtDelta(region.priceSqmDelta12m)}. ` +
      `Valorização ${region.layerScores.valorization}, infra ${region.layerScores.infrastructure}. ${region.highlights[0]}`
    );
  }
  if (q.includes('top') || q.includes('melhor') || q.includes('valoriz')) {
    const tops = topByValorization(3)
      .map((r, i) => `${i + 1}. ${r.name} (${fmtDelta(r.priceSqmDelta12m)})`)
      .join(' · ');
    return `Top valorização 12m: ${tops}.`;
  }
  return '';
}

const SUGGESTIONS = [
  'O que é o Score LandMap?',
  'Como estão Meireles?',
  'Top 3 valorização',
  'Como funcionam webhooks?',
];

export default function ChatPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 'w',
      role: 'ai',
      text: 'Olá! Sou o LandBot. Uso o mapa intelligence e a base RAG. Pergunte sobre Score, bairros ou webhooks.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setMessages((m) => [...m, { id: 'u' + Date.now(), role: 'user', text: t }]);
    setInput('');
    setBusy(true);

    const local = localAnswer(t);
    try {
      const res = await ragQuery(t);
      const sources =
        res.sources?.length > 0
          ? `\n\nFontes: ${res.sources
              .slice(0, 3)
              .map((s) => s.title)
              .join(' · ')}`
          : '';
      const reply = local
        ? `${local}\n\n— RAG —\n${res.answer}${sources}`
        : `${res.answer}${sources}`;
      setMessages((m) => [...m, { id: 'a' + Date.now(), role: 'ai', text: reply }]);
    } catch {
      const fallback =
        local ||
        'API RAG offline. Resposta local do mapa: pergunte por Meireles, top valorização ou risco.';
      setMessages((m) => [...m, { id: 'a' + Date.now(), role: 'ai', text: fallback }]);
    } finally {
      setBusy(false);
    }
  }

  const count = useMemo(() => messages.length, [messages]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/assistant')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <Badge variant="outline">{count} msgs</Badge>
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" /> LandBot + RAG
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">Chat de inteligência</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Mapa +{' '}
          <Link href={lh('/rag')} className="text-primary hover:underline">
            base RAG
          </Link>{' '}
          ·{' '}
          <Link href={lh('/map')} className="text-primary hover:underline">
            abrir mapa
          </Link>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => void send(s)}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-muted"
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="mt-4 flex max-h-[50dvh] flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && <p className="text-xs text-muted-foreground">Consultando RAG…</p>}
      </Card>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre bairro, Score ou webhooks…"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          disabled={busy}
        />
        <Button type="submit" size="sm" aria-label="Enviar" className="min-h-11 min-w-11 px-0" disabled={busy}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </main>
  );
}
