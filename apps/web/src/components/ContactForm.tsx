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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="mb-4 text-sm font-medium text-[var(--foreground)]">Fale com o anunciante</p>

      {sent ? (
        <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 p-4 text-center text-sm text-[var(--success-foreground)]">
          Mensagem enviada com sucesso! Entraremos em contato.
          <button
            onClick={() => setSent(false)}
            className="ml-2 text-xs text-[var(--muted-foreground)] underline underline-offset-2 hover:text-[var(--foreground)]"
          >
            Nova mensagem
          </button>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 p-3 text-center text-sm text-[var(--destructive)]"
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
