'use client';

import { useState, useEffect, useRef } from 'react';
import { Reveal, Stagger } from '../../../components/Motion';
import { listWorkflows, runWorkflow, ragQuery, type WorkflowDefinition, type WorkflowRunStep } from '../../../lib/api';
import { Button } from '@landmap/ui';

const SAMPLE_INPUT: Record<string, string> = {
  'market-report': JSON.stringify({ query: 'São Paulo', stats: { total: 1500, avgPrice: 520000, avgPricePerSqm: 6800, cities: [{ city: 'São Paulo', state: 'SP', count: 320, avgPrice: 610000 }] } }),
  'lead-enrich': JSON.stringify({ lead: { id: 'L1', name: 'Ana', city: 'Curitiba', state: 'PR', interest: 'apartamento 2 quartos', source: 'organic', engagementCount: 4 } }),
  'property-copy': JSON.stringify({ property: { title: 'Apto Centro', city: 'Curitiba', state: 'PR', price: 420000, type: 'apartamento', modality: 'venda', areaM2: 72, bedrooms: 2, neighborhood: 'Centro', tags: ['centro', 'financiamento'] } }),
};

export default function StudioPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selected, setSelected] = useState<string>('market-report');
  const [input, setInput] = useState<string>(SAMPLE_INPUT['market-report']);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<WorkflowRunStep[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);

  useEffect(() => {
    listWorkflows().then((r) => setWorkflows(r.items)).catch(() => setWorkflows([]));
  }, []);

  useEffect(() => {
    setInput(SAMPLE_INPUT[selected] ?? '{}');
    setRunResult(null);
    setRunError(null);
  }, [selected]);

  async function handleRun() {
    setRunning(true);
    setRunError(null);
    setRunResult(null);
    try {
      const parsed = JSON.parse(input || '{}');
      const res = await runWorkflow(selected, parsed);
      if (!res.ok || res.result.status === 'error') setRunError(res.result.error ?? 'Workflow falhou.');
      else setRunResult(res.result.steps);
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'JSON inválido.');
    } finally {
      setRunning(false);
    }
  }

  const finalOutput = runResult?.[runResult.length - 1]?.output;

  return (
    <>
      <main className="relative min-h-screen bg-[#050505] text-neutral-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(40rem_26rem_at_70%_-10%,rgba(52,211,153,0.10),transparent_70%)]" />

        <Reveal className="mx-auto max-w-6xl px-6 pt-28 pb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-4 py-1 text-xs text-neutral-400 tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            AI Studio · LangChain · LangFlow
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-gradient sm:text-5xl">
            O cérebro agentico do mercado imobiliário
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-400">
            Orchestre fluxos multi-agente, gere relatórios, enriqueça leads e converse com a base RAG — tudo na LandMap.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 transition hover:border-emerald-500/30 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.25)]">
            <h2 className="text-lg font-medium">Laboratório de Workflows</h2>
            <p className="mt-1 text-sm text-neutral-400">Selecione um fluxo e execute passo a passo.</p>

            <Stagger className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {workflows.map((w) => (
                <button key={w.id} onClick={() => setSelected(w.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm transition ${selected === w.id ? 'border-emerald-400/60 bg-emerald-400/10 text-white' : 'border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-600'}`}>
                  <span className="block font-medium">{w.name}</span>
                  <span className="mt-1 block text-xs text-neutral-400">{w.description}</span>
                </button>
              ))}
            </Stagger>

            <label className="mt-5 block text-xs uppercase tracking-wide text-neutral-400">Entrada (JSON)</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} rows={9}
              className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 font-mono text-xs text-neutral-200 outline-none transition focus:border-emerald-400/50" />

            <Button onClick={handleRun} disabled={running} className="mt-4 h-11 px-6">
              {running ? 'Executando…' : 'Executar workflow'}
            </Button>

            {runError && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{runError}</div>
            )}

            {runResult && (
              <div className="mt-5 space-y-3">
                {runResult.map((step) => (
                  <div key={step.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-200">{step.id}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${step.status === 'ok' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{step.status}</span>
                    </div>
                    <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-neutral-400">{typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}</pre>
                  </div>
                ))}
                {finalOutput !== null && finalOutput !== undefined && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-emerald-300/80">Resultado final</p>
                    <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap break-words text-sm text-neutral-200">{typeof finalOutput === 'string' ? finalOutput : JSON.stringify(finalOutput, null, 2)}</pre>
                  </div>
                )}
              </div>
            )}
          </Reveal>

          <RagChat />
        </div>
      </main>
    </>
  );
}

function RagChat() {
  const [chat, setChat] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, chatLoading]);

  async function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChat((p) => [...p, { role: 'user', content: q }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await ragQuery(q);
      setChat((p) => [...p, { role: 'bot', content: res.answer }]);
    } catch {
      setChat((p) => [...p, { role: 'bot', content: 'Erro ao consultar a base de conhecimento.' }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <Reveal delay={0.1} className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 transition hover:border-emerald-500/30 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.25)]">
      <h2 className="text-lg font-medium">Chat RAG</h2>
      <p className="mt-1 text-sm text-neutral-400">Pergunte sobre imóveis, bairros e tendências de mercado.</p>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        {chat.length === 0 && !chatLoading && (
          <p className="text-sm text-neutral-400">Ex: &quot;Quais bairros de Curitiba têm melhor custo-benefício?&quot;</p>
        )}
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-neutral-700 text-neutral-50' : 'border border-neutral-700 bg-neutral-800/60 text-neutral-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-400">
              <span className="inline-block animate-pulse">Pensando</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
            </div>
          </div>
        )}
        <div ref={chatBottom} />
      </div>

      <form onSubmit={handleChat} className="mt-4 flex gap-3">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Sua pergunta…"
          disabled={chatLoading}
          aria-label="Sua pergunta sobre o catálogo de imóveis"
          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-neutral-50 placeholder-neutral-500 outline-none transition focus:border-emerald-400/50 disabled:opacity-50"
        />
        <Button type="submit" disabled={chatLoading || !chatInput.trim()} className="px-5 py-3">
          Enviar
        </Button>
      </form>
    </Reveal>
  );
}
