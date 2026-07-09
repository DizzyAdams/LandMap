'use client';

import { useState } from 'react';

export function ContactForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { nome, email, telefone, mensagem };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao enviar a mensagem.');
      setSent(true);
      setNome('');
      setEmail('');
      setTelefone('');
      setMensagem('');
    } catch (err) {
      // Graceful fallback: surface the failure instead of faking success.
      setError(err instanceof Error ? err.message : 'Erro ao enviar a mensagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="mb-4 text-sm font-medium text-neutral-200">Fale com o anunciante</p>

      {sent ? (
        <div className="rounded-lg border border-neutral-700 bg-neutral-800/40 p-4 text-center text-sm text-neutral-300">
          Mensagem enviada com sucesso! Entraremos em contato.
          <button
            onClick={() => setSent(false)}
            className="ml-2 text-xs text-neutral-500 underline underline-offset-2 hover:text-white"
          >
            Nova mensagem
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-200"
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            aria-label="Nome"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
          />
          <input
            required
            type="email"
            aria-label="E-mail"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            required
            type="tel"
            aria-label="Telefone"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="input"
          />
          <textarea
            required
            rows={3}
            aria-label="Mensagem"
            placeholder="Mensagem"
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            className="input resize-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-40"
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
        </>
      )}
    </div>
  );
}
