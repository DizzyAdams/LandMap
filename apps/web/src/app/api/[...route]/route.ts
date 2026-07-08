import app from '@landmap/api';

export const runtime = 'nodejs';

function handle(request: Request) {
  const url = new URL(request.url);
  // Strip /api prefix for Hono routes
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const newUrl = new URL(path + url.search, url.origin);
  const newReq = new Request(newUrl, request);
  return app.fetch(newReq);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
