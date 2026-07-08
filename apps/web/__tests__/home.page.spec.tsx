// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

const noopFetch = () =>
  Promise.resolve(
    new Response(JSON.stringify({ ok: true, data: null, items: [], total: 0 }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    <a href={href} {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ locale: 'pt-BR' }),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

const { mockSearchProperties } = vi.hoisted(() => ({
  mockSearchProperties: vi.fn(),
}));

vi.mock('../src/lib/api', () => ({
  searchProperties: mockSearchProperties,
}));

import SearchPage from '../src/app/[locale]/search/page';

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', noopFetch as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it('stubs global fetch to avoid network calls in non-mocked paths', async () => {
    expect(typeof fetch).toBe('function');
  });

  it('should render the search form with heading and back link', async () => {
    mockSearchProperties.mockResolvedValue({ items: [], total: 0 });

    const pageElement = await SearchPage({
      params: Promise.resolve({ locale: 'pt-BR' }),
      searchParams: Promise.resolve({}),
    });

    render(pageElement);

    expect(screen.getByText('Buscar imóveis')).toBeTruthy();
    expect(screen.getByText('Voltar para Home')).toBeTruthy();
  });

  it('should show empty state when no results match', async () => {
    mockSearchProperties.mockResolvedValue({ items: [], total: 0 });

    const pageElement = await SearchPage({
      params: Promise.resolve({ locale: 'pt-BR' }),
      searchParams: Promise.resolve({ type: 'terreno' }),
    });

    render(pageElement);

    expect(screen.getByText(/Nenhum imóvel correspondente/)).toBeTruthy();
  });

  it('should render property results when items are found', async () => {
    const mockItems = [
      { id: '1', title: 'Casa na Praia', city: 'Rio', state: 'RJ', price: 500000, areaM2: 150, bedrooms: 3, type: 'casa' as const, modality: 'venda' as const, available: true, status: 'disponivel', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      { id: '2', title: 'Apartamento Centro', city: 'SP', state: 'SP', price: 300000, areaM2: 80, bedrooms: 2, type: 'apartamento' as const, modality: 'aluguel' as const, available: true, status: 'disponivel', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
    ];
    mockSearchProperties.mockResolvedValue({ items: mockItems, total: 2 });

    const pageElement = await SearchPage({
      params: Promise.resolve({ locale: 'pt-BR' }),
      searchParams: Promise.resolve({}),
    });

    render(pageElement);

    expect(screen.getByText('Casa na Praia')).toBeTruthy();
    expect(screen.getByText('Apartamento Centro')).toBeTruthy();
    expect(screen.getByText('2 resultados')).toBeTruthy();
  });
});
