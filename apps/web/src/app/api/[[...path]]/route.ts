import app from '@landmap/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Mount the full LandMap Hono API (`@landmap/api`) under /api/*.
 *
 * The full app exposes the routes the web client actually calls:
 *   /invest/score, /value/realtime, /value/realtime/batch, /market/terrain,
 *   /market/heatmap, /funnel, /admin/*, /cities, /stats, /favorites, /compare,
 *   /kpi, /insights, /embeddings, /neighborhoods, /markdowns, etc.
 *
 * More specific Next routes (e.g. /api/rag, /api/sales, /api/webhooks,
 * /api/geo, /api/markdowns) take routing precedence over this catch-all, so
 * they keep their dedicated handlers; everything else falls through here.
 */
function handle(request: Request) {
  const url = new URL(request.url);
  // Strip /api prefix for Hono routes.
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const newUrl = new URL(path + url.search, url.origin);
  const newReq = new Request(newUrl, request);
  return app.fetch(newReq);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
