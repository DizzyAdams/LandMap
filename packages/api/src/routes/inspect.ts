import { Hono } from 'hono';
import { z } from 'zod';

/**
 * Inspection image analysis proxy.
 *
 * The actual computer-vision metrics (brightness, contrast, sharpness, dominant
 * color, edge ratio, focus score) are produced by the Python `landmap-serving`
 * FastAPI service (`POST /inspect/image`). This router forwards the uploaded
 * image to that service when `LANDMAP_SERVING_URL` is configured, returning its
 * `InspectionAnalysisResponse` verbatim.
 *
 * The web client (`apps/web/src/app/[locale]/inspect`) already performs an
 * equivalent pixel analysis locally as a fallback, so the feature stays fully
 * functional even when the Python service is not deployed.
 */
const schema = z.object({
  brightness: z.number(),
  contrast: z.number(),
  sharpness: z.number(),
  score: z.number(),
  verdict: z.string(),
  notes: z.array(z.string()),
  dominantColor: z.string(),
  edgesRatio: z.number(),
  focusScore: z.number(),
  imageWidth: z.number(),
  imageHeight: z.number(),
});

export function createInspectRouter() {
  const app = new Hono();

  app.post('/image', async (c) => {
    const servingUrl = process.env.LANDMAP_SERVING_URL;
    if (!servingUrl) {
      return c.json(
        {
          error:
            'Inspection service not configured. Set LANDMAP_SERVING_URL to enable server-side image analysis, or rely on client-side pixel analysis.',
          code: 'SERVING_UNCONFIGURED',
        },
        501,
      );
    }

    const form = await c.req.parseBody({ all: true }).catch(() => null);
    const file = form?.image;
    if (!file || !(file instanceof File)) {
      return c.json({ error: 'Field "image" (file) is required' }, 400);
    }

    const maxWidth = c.req.query('max_width') ?? '1024';
    const upstream = await fetch(`${servingUrl.replace(/\/$/, '')}/inspect/image?max_width=${maxWidth}`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: (() => {
        const fd = new FormData();
        fd.append('image', file, file.name || 'capture.jpg');
        fd.append('max_width', maxWidth);
        return fd;
      })(),
    }).catch((err) => {
      return new Response(JSON.stringify({ error: `Upstream serving error: ${(err as Error).message}` }), {
        status: 502,
      });
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return c.json({ error: `Upstream serving error`, detail: text.slice(0, 500) }, 502);
    }

    const data = await upstream.json().catch(() => null);
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return c.json({ error: 'Malformed response from serving service' }, 502);
    }
    return c.json(parsed.data);
  });

  return app;
}
