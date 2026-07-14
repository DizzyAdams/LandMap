import { serve } from '@hono/node-server';
import app from './index.js';

const port = parseInt(process.env.PORT ?? '4000', 10);

console.log(`[landmap-api] starting on :${port}`);

serve({
  fetch: app.fetch,
  port,
});