import { describe, it, expect } from 'vitest';
import app from '../src/index';
import { valueRealtime } from '../src/routes/valuation.js';

describe('real-time valuation (/value/realtime)', () => {
  it('GET retorna estimativa com telemetria de latência', async () => {
    const res = await app.request('/value/realtime?areaM2=300&type=terreno&basePpm2=4200');
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.predictedPrice).toBeGreaterThan(0);
    expect(d.pricePerM2).toBeGreaterThan(0);
    expect(d.engine).toBe('numpy-ts');
    expect(typeof d.latencyUs).toBe('number');
    expect(d.latencyUs).toBeGreaterThanOrEqual(0);
  });

  it('POST valida e calcula', async () => {
    const res = await app.request('/value/realtime', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ areaM2: 500, type: 'comercial', basePpm2: 8000 }),
    });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.predictedPrice).toBeGreaterThan(0);
  });

  it('areaM2 inválido retorna 400', async () => {
    const res = await app.request('/value/realtime?areaM2=-5');
    expect(res.status).toBe(400);
  });

  it('batch retorna agregados de latência', async () => {
    const res = await app.request('/value/realtime/batch', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        items: [
          { areaM2: 120, type: 'apartamento', basePpm2: 6000 },
          { areaM2: 500, type: 'terreno', basePpm2: 4000 },
        ],
      }),
    });
    expect(res.status).toBe(200);
    const d = await res.json();
    expect(d.count).toBe(2);
    expect(d.items.length).toBe(2);
    expect(typeof d.avgLatencyUs).toBe('number');
  });

  it('preço escala com a área e ordena por tipo (unit)', () => {
    const small = valueRealtime({ areaM2: 100, type: 'terreno', basePpm2: 6000 });
    const big = valueRealtime({ areaM2: 1000, type: 'terreno', basePpm2: 6000 });
    expect(big.predictedPrice).toBeGreaterThan(small.predictedPrice);

    const terreno = valueRealtime({ areaM2: 300, type: 'terreno', basePpm2: 6000 }).pricePerM2;
    const apto = valueRealtime({ areaM2: 300, type: 'apartamento', basePpm2: 6000 }).pricePerM2;
    const comercial = valueRealtime({ areaM2: 300, type: 'comercial', basePpm2: 6000 }).pricePerM2;
    expect(terreno).toBeLessThan(apto);
    expect(apto).toBeLessThan(comercial);
  });
});
