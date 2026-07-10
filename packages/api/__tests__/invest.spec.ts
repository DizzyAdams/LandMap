import { describe, it, expect } from 'vitest';
import investApp from '../src/routes/invest.js';

describe('invest API', () => {
  it('GET /invest/analyze retorna InvestmentResult com capRate', async () => {
    const res = await investApp.request(
      '/invest/analyze?price=500000&monthlyRent=3000&downPaymentPct=0.2&interestRatePct=7&loanTermYears=30&annualExpensesPct=0.35&vacancyPct=0.08&annualAppreciationPct=0.05&holdingYears=5',
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('capRate');
    expect(typeof data.capRate).toBe('number');
    expect(data).toHaveProperty('score');
    expect(data).toHaveProperty('grade');
    expect(data).toHaveProperty('cashOnCash');
  });

  it('GET /invest/analyze sem price retorna 400', async () => {
    const res = await investApp.request('/invest/analyze');
    expect(res.status).toBe(400);
  });

  it('GET /invest/opportunities?city=Curitiba retorna array ranqueado', async () => {
    const res = await investApp.request('/invest/opportunities?city=Curitiba');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    const first = data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('city', 'Curitiba');
    expect(first).toHaveProperty('state');
    expect(first).toHaveProperty('price');
    expect(first).toHaveProperty('result');
    expect(first.result).toHaveProperty('capRate');
    expect(typeof first.result.score).toBe('number');
  });

  it('GET /invest/opportunities respeita o limite máximo de 50', async () => {
    const res = await investApp.request('/invest/opportunities?city=Curitiba&limit=999');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.length).toBeLessThanOrEqual(50);
  });

  it('POST /invest/score com body válido retorna 200', async () => {
    const res = await investApp.request('/invest/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        price: 500000,
        monthlyRent: 3000,
        downPaymentPct: 0.2,
        interestRatePct: 7,
        loanTermYears: 30,
        annualExpensesPct: 0.35,
        vacancyPct: 0.08,
        annualAppreciationPct: 0.05,
        holdingYears: 5,
      }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('capRate');
    expect(data).toHaveProperty('score');
  });

  it('POST /invest/score com body inválido retorna 400', async () => {
    const res = await investApp.request('/invest/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ price: -1 }),
    });
    expect(res.status).toBe(400);
  });
});
