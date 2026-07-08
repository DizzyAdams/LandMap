'use client';

import { useState } from 'react';

export function ContactForm() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = { nome, email, telefone, mensagem };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao enviar');
    } catch {
      // Fallback: log to console
      console.log('Contact form submission:', payload);
    }

    setLoading(false);
    setSent(true);
    setNome('');
    setEmail('');
    setTelefone('');
    setMensagem('');
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            required
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="input"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
          <input
            required
            type="tel"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="input"
          />
          <textarea
            required
            rows={3}
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
      )}
    </div>
  );
}
