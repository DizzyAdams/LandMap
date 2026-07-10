import { z } from 'zod';

const s = z.object({
  price: z.coerce.number().positive(),
  taxRatePct: z.coerce.number().optional(),
});

const r = s.safeParse({ price: '1' });
if (r.success) {
  const x: number = r.data.price;
  const y: number | undefined = r.data.taxRatePct;
  void x;
  void y;
}

const b = z.object({
  price: z.number().positive(),
  taxRatePct: z.number().optional(),
});
const rb = b.safeParse({ price: 1 });
if (rb.success) {
  const x2: number = rb.data.price;
  void x2;
}

const u: unknown = { price: 1 };
const ru = b.safeParse(u);
if (ru.success) {
  const x3: number = ru.data.price;
  void x3;
}

const q: { price: string | null } = { price: '1' };
const rq = s.safeParse(q);
if (rq.success) {
  const x4: number = rq.data.price;
  void x4;
}
