import { Hono } from 'hono';
import { z } from 'zod';
import {
  OpenDesignClient,
  WhatsAppClient,
  CrieClient,
  ViaCepClient,
  IbgeClient,
  LeilaoClient,
  CambioClient,
  TwentyClient,
  CnpjClient,
  BacenClient,
  GeoClient,
  listIntegrations,
} from '@landmap/integrations';

/**
 * Integrations hub — a single mount point (`/integrations`) that exposes
 * every external connector the platform ships with. Every client degrades to
 * **mock mode** when unconfigured, so the hub is fully functional in demo /
 * local / CI without any secrets.
 *
 *   GET  /integrations                  → list all integrations + status
 *   GET  /integrations/opendesign/feed → OpenDesign asset feed
 *   GET  /integrations/whatsapp/health
 *   POST /integrations/whatsapp/send    → { to, text }
 *   GET  /integrations/whatsapp/webhook→ Meta verify handshake
 *   POST /integrations/whatsapp/webhook→ inbound messages
 *   GET  /integrations/crie/health
 *   POST /integrations/crie/lookup      → { type, value, ... }
 */
export function createIntegrationsRouter() {
  const router = new Hono();

  router.onError((err, c) => {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', issues: err.issues }, 400);
    }
    const status = (err as { status?: number }).status ?? 500;
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return c.json({ error: message }, { status });
  });

  /* ─── Registry ─── */
  router.get('/', (c) => {
    const items = listIntegrations();
    return c.json({
      count: items.length,
      integrations: items,
      generatedAt: new Date().toISOString(),
    });
  });

  /* ─── OpenDesign feed ─── */
  router.get('/opendesign/feed', async (c) => {
    const client = new OpenDesignClient();
    try {
      const feed = await client.getDesignFeed({ limit: 8 });
      return c.json({ configured: client.configured, feed, generatedAt: new Date().toISOString() });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message, feed: [] }, 200);
    }
  });

  /* ─── WhatsApp (WABA) ─── */
  router.get('/whatsapp/health', (c) => {
    const client = new WhatsAppClient();
    return c.json({
      id: 'whatsapp',
      configured: client.configured,
      mock: client.mock,
      mode: client.configured ? 'live' : 'mock',
    });
  });

  router.post('/whatsapp/send', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { to, text, template, languageCode } = z
      .object({
        to: z.string().min(8),
        text: z.string().optional(),
        template: z.string().optional(),
        languageCode: z.string().optional(),
      })
      .parse(body);

    const client = new WhatsAppClient();
    const result = template
      ? await client.sendTemplate(to, template, { languageCode })
      : await client.sendText(to, text ?? '');

    return c.json(result, 200);
  });

  // Meta webhook: GET verifies the subscription, POST receives messages.
  router.get('/whatsapp/webhook', (c) => {
    const client = new WhatsAppClient();
    const challenge = client.verifyWebhook({
      mode: c.req.query('hub.mode') ?? undefined,
      token: c.req.query('hub.verify_token') ?? undefined,
      challenge: c.req.query('hub.challenge') ?? undefined,
    });
    if (challenge === null) return c.text('Forbidden', 403);
    return c.text(challenge, 200);
  });

  router.post('/whatsapp/webhook', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const client = new WhatsAppClient();
    const messages = client.parseWebhook(body);
    return c.json({ received: messages.length, messages }, 200);
  });

  /* ─── CRIE (Registro de Imóveis Eletrônico) ─── */
  router.get('/crie/health', (c) => {
    const client = new CrieClient();
    return c.json({
      id: 'crie',
      configured: client.configured,
      mock: client.mock,
      mode: client.configured ? 'live' : 'mock',
    });
  });

  /* ─── ViaCEP (public, live) ─── */
  router.get('/viacep/:cep', async (c) => {
    const client = new ViaCepClient();
    try {
      const address = await client.lookup(c.req.param('cep'));
      return c.json({ configured: client.configured, mock: client.mock, address });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── IBGE (public, live) ─── */
  router.get('/ibge/uf', async (c) => {
    const client = new IbgeClient();
    try {
      const ufs = await client.listUf();
      return c.json({ configured: client.configured, mock: client.mock, count: ufs.length, ufs });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  router.get('/ibge/cities/:uf', async (c) => {
    const client = new IbgeClient();
    try {
      const cities = await client.listCities(c.req.param('uf'));
      return c.json({
        configured: client.configured,
        mock: client.mock,
        uf: c.req.param('uf').toUpperCase(),
        count: cities.length,
        cities,
      });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── Leilão (tempo real) ─── */
  router.get('/leilao', async (c) => {
    const client = new LeilaoClient();
    const estado = c.req.query('estado') ?? undefined;
    const tipo = c.req.query('tipo') ?? undefined;
    const onlyLive = c.req.query('onlyLive') === '1';
    const limit = Number(c.req.query('limit') ?? '10');
    try {
      const lots = await client.listLots({ estado, tipo, onlyLive, limit });
      return c.json({
        configured: client.configured,
        mock: client.mock,
        count: lots.length,
        geradoEm: new Date().toISOString(),
        lots,
      });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── Câmbio (BCB via AwesomeAPI, live) ─── */
  router.get('/cambio', async (c) => {
    const client = new CambioClient();
    const par = c.req.query('par') ?? 'USD-BRL';
    try {
      const quote = await client.getQuote(par);
      return c.json({ configured: client.configured, mock: client.mock, quote });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── Twenty CRM ─── */
  router.get('/twenty/health', async (c) => {
    const client = new TwentyClient();
    try {
      const status = await client.getStatus();
      return c.json(status);
    } catch (e) {
      return c.json(
        { configured: client.configured, mock: client.mock, mode: 'mock', error: (e as Error).message },
        200,
      );
    }
  });

  /* ─── CNPJ (Receita Federal via BrasilAPI, live) ─── */
  router.get('/cnpj/:cnpj', async (c) => {
    const client = new CnpjClient();
    const cnpj = c.req.param('cnpj');
    try {
      const company = await client.getCompany(cnpj);
      return c.json({ configured: client.configured, company });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── Bacen (SGS, live) ─── */
  router.get('/bacen/selic', async (c) => {
    const client = new BacenClient();
    try {
      const dados = await client.getSelic(Number(c.req.query('ultimos') ?? '1'));
      return c.json({ configured: client.configured, mock: client.mock, serie: 11, dados });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  router.get('/bacen/cdi', async (c) => {
    const client = new BacenClient();
    try {
      const dados = await client.getCdi(Number(c.req.query('ultimos') ?? '1'));
      return c.json({ configured: client.configured, mock: client.mock, serie: 12, dados });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  router.get('/bacen/ipca', async (c) => {
    const client = new BacenClient();
    try {
      const dados = await client.getIpca(Number(c.req.query('ultimos') ?? '1'));
      return c.json({ configured: client.configured, mock: client.mock, serie: 433, dados });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  /* ─── Geo (Nominatim / OSM, live) ─── */
  router.get('/geo/search', async (c) => {
    const client = new GeoClient();
    const q = c.req.query('q') ?? '';
    try {
      const results = await client.geocode(q);
      return c.json({ configured: client.configured, mock: client.mock, count: results.length, results });
    } catch (e) {
      return c.json({ configured: client.configured, error: (e as Error).message }, 200);
    }
  });

  router.post('/crie/lookup', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { type, value, cartorio, cidade, estado, endereco } = z
      .object({
        type: z.enum(['matricula', 'cpf', 'imovel']),
        value: z.string().min(1),
        cartorio: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        endereco: z.string().optional(),
      })
      .parse(body);

    const client = new CrieClient();
    let records;
    if (type === 'matricula') {
      records = [await client.lookupMatricula(value, cartorio)];
    } else if (type === 'cpf') {
      records = await client.lookupByCpf(value);
    } else {
      records = await client.lookupImovel(cidade ?? value, estado ?? 'BR', endereco);
    }

    return c.json({ type, configured: client.configured, records, generatedAt: new Date().toISOString() }, 200);
  });

  return router;
}
