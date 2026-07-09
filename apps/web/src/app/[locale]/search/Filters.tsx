'use client';

import { useState } from 'react';
import { Button } from '@landmap/ui';

type FilterDefaults = {
  q?: string;
  type?: string;
  modality?: string;
  city?: string;
  state?: string;
  minPrice?: string;
  maxPrice?: string;
};

export function Filters({ locale, defaults }: { locale: string; defaults: FilterDefaults }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
      {/* Mobile filter toggle — filters collapse into a sheet on small screens */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="filter-fields"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white"
        >
          {open ? 'Ocultar filtros' : 'Filtros'}
        </button>
        <span className="text-xs text-neutral-500">
          {defaults.q ? `Filtro: ${defaults.q}` : 'Refine sua busca'}
        </span>
      </div>

      <form
        id="filter-fields"
        method="get"
        action={`/${locale}/search`}
        className={`grid gap-3 md:grid-cols-3 lg:grid-cols-5 mt-4 lg:mt-0 ${
          open ? '' : 'hidden'
        } lg:grid`}
      >
        <input
          id="search-input"
          name="q"
          defaultValue={defaults.q}
          placeholder="Busca"
          aria-label="Busca"
          className="input"
        />
        <select name="type" defaultValue={defaults.type} aria-label="Tipo de imóvel" className="input">
          <option value="">Tipo</option>
          <option value="apartamento">Apartamento</option>
          <option value="casa">Casa</option>
          <option value="terreno">Terreno</option>
          <option value="comercial">Comercial</option>
        </select>
        <select
          name="modality"
          defaultValue={defaults.modality}
          aria-label="Modalidade"
          className="input"
        >
          <option value="">Modalidade</option>
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
          <option value="lancamento">Lançamento</option>
        </select>
        <input
          name="city"
          defaultValue={defaults.city}
          placeholder="Cidade"
          aria-label="Cidade"
          className="input"
        />
        <input
          name="state"
          defaultValue={defaults.state}
          placeholder="UF"
          aria-label="UF"
          className="input"
        />
        <input
          name="minPrice"
          defaultValue={defaults.minPrice}
          type="number"
          placeholder="Preço mín."
          aria-label="Preço mínimo"
          className="input"
        />
        <input
          name="maxPrice"
          defaultValue={defaults.maxPrice}
          type="number"
          placeholder="Preço máx."
          aria-label="Preço máximo"
          className="input"
        />
        <div className="lg:col-span-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-500">
            {defaults.q ? `Filtro ativo: ${defaults.q}` : 'Use filtros para refinar.'}
          </p>
          <div className="flex items-center gap-3">
            <span
              className="hidden items-center gap-1 text-[11px] text-neutral-500 sm:inline-flex"
              aria-hidden="true"
            >
              Pressione <kbd className="rounded border border-neutral-700 px-1">/</kbd> ou{' '}
              <kbd className="rounded border border-neutral-700 px-1">⌘K</kbd>
            </span>
            <Button type="submit">Aplicar filtros</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
