'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, Sparkles, Send, User } from '../../../components/lovable/icons';
import { Card, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Msg = { id: string; role: 'user' | 'ai'; text: string };

const SUGGESTIONS = [
  'Qual bairro de SP tem melhor valorização?',
  'Compare terrenos em Curitiba e Floripa',
  'Gere um resumo de risco para Pinheiros',
];

const FAKE_AI =
  'Com base na base LandMap, a região apresenta valorização média de 11,2% em 12 meses, com liquidez alta e risco controlado. Quer que eu detalhe por bairro?';

export default function ChatPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'w', role: 'ai', text: 'Olá! Sou o LandBot. Pergunte sobre valorização, bairros ou risco de qualquer região.' },
  ]);
  const [input, setInput] = useState('');

  function send(text: string) {
    const t = text.trim();
    if (!t) return;
    const uid = 'u' + Date.now();
    setMessages((m) => [...m, { id: uid, role: 'user', text: t }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { id: 'a' + Date.now(), role: 'ai', text: FAKE_AI }]);
    }, 500);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/assistant')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          LandBot · IA conversacional
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Assistente imobiliário</h1>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            )}
            <Card className={`max-w-[80%] ${m.role === 'user' ? 'bg-primary/10' : ''}`}>
              <p className="text-sm">{m.text}</p>
            </Card>
            {m.role === 'user' && (
              <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
                <User className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        ))}

        {messages.length <= 1 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/70 transition hover:border-primary hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="mt-4 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre o mercado..."
          aria-label="Mensagem"
          className="h-11 flex-1 rounded-xl border border-border bg-card px-4 text-sm outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <Button type="submit" aria-label="Enviar" className="h-11 w-11 !px-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </main>
  );
}
