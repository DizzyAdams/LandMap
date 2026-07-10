'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatPrompt, type ChatMessage } from '../../../lib/chat';
import {
  sendPuterChat,
  MINIMAX_MODELS,
  DEFAULT_MINIMAX_MODEL,
  LANDMAP_SYSTEM_PROMPT,
} from '../../../lib/puter-chat';
import FreeAIBadge from '../../../components/FreeAIBadge';
import { Button } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [model, setModel] = useState(DEFAULT_MINIMAX_MODEL);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Primary path: free MiniMax via Puter.js (User-Pays, no server keys). */
  async function runPuter(userText: string): Promise<string | null> {
    const assistantId = Date.now();
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', id: assistantId, content: '' },
    ]);

    const history = messages.concat({ role: 'user', content: userText });
    let full = '';
    try {
      full = await sendPuterChat(history, {
        model,
        systemPrompt: LANDMAP_SYSTEM_PROMPT,
        onToken: (delta) => {
          full += delta;
          setMessages((prev) =>
            prev.map((m) =>
              (m as ChatMessage & { id?: number }).id === assistantId
                ? { ...m, content: full }
                : m,
            ),
          );
        },
      });
      setMessages((prev) =>
        prev.map((m) =>
          (m as ChatMessage & { id?: number }).id === assistantId
            ? { ...m, content: full }
            : m,
        ),
      );
      return full;
    } catch {
      // remove the empty placeholder; fall back to server API below
      setMessages((prev) =>
        prev.filter((m) => (m as ChatMessage & { id?: number }).id !== assistantId),
      );
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: ChatMessage = { role: 'user', content: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const answered = await runPuter(userText);
      if (answered === null) {
        // Fallback to the existing server-backed RAG chat
        const result = await sendChatPrompt(userText);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.answer },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSuggest() {
    if (suggesting) return;
    setSuggesting(true);

    const userMsg: ChatMessage = {
      role: 'user',
      content: '🔍 Sugira imóveis com base na conversa',
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const answered = await runPuter(
        'Com base na conversa até agora, recomende os melhores imóveis disponíveis. Considere localização, tipo, preço e necessidades do usuário. Liste até 3 opções com justificativa clara. Responda em português de forma objetiva.',
      );
      if (answered === null) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_LANDMAP_API_BASE || 'http://localhost:4000'}/analyze`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              prompt: `Com base na conversa até agora, recomende os melhores imóveis disponíveis. 
Considere localização, tipo, preço e necessidades do usuário.
Liste até 3 opções com justificativa clara. Responda em português de forma objetiva.`,
            }),
          },
        );
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Não foi possível gerar sugestões agora.' },
      ]);
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl flex-col px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <Reveal>
          <h1 className="text-2xl font-semibold tracking-tight text-gradient">Chat Imobiliário</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-neutral-400">
            Pergunte sobre imóveis, preços, e regiões no Brasil.
            <FreeAIBadge model={model} />
          </p>
        </Reveal>
        <button
          onClick={handleSuggest}
          disabled={suggesting}
          className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-4 py-2 text-xs font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-50 disabled:opacity-40"
        >
          {suggesting ? 'Sugerindo...' : '💡 Sugerir imóveis'}
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
        <span className="uppercase tracking-wide">Modelo MiniMax</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={loading}
          aria-label="Modelo de IA"
          className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 outline-none transition focus:border-emerald-400/50 disabled:opacity-50"
        >
          {MINIMAX_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Histórico da conversa"
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"
      >
        {messages.length === 0 && !loading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-neutral-400">
              Digite uma pergunta para começar. Ex: &quot;Apartamentos em Curitiba até R$ 500 mil&quot;
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <ul role="list" className="space-y-4">
            {messages.map((msg, i) => (
              <li
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-neutral-700 text-neutral-50'
                      : 'border border-neutral-700 bg-neutral-800/60 text-neutral-200'
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-0.5 text-neutral-400" aria-hidden>
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-400">
              <span className="inline-block animate-pulse">Pensando</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                .
              </span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                .
              </span>
            </div>
          </div>
        )}

        {suggesting && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-400">
              <span className="inline-block animate-pulse">Buscando sugestões</span>
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>
                .
              </span>
              <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>
                .
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta sobre imóveis..."
          disabled={loading}
          aria-label="Sua pergunta sobre imóveis"
          className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-50 placeholder-neutral-500 outline-none transition focus:border-emerald-400/50 disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3"
        >
          Enviar
        </Button>
      </form>
    </main>
  );
}
