/**
 * Agentik O.S. — backend entry.
 *
 * Stack: Hono 4 + @hono/node-server.
 * Sirve en http://localhost:3001.
 *
 * Rutas:
 *   GET  /health
 *   GET  /leads
 *   GET  /leads/:id
 *   GET  /graphify/status
 *   POST /graphify/reindex
 *
 * El frontend (Vite, :5173) habla con este server a través del proxy
 * `/api/*` configurado en vite.config.ts.
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.js';
import { leadsRouter } from './routes/leads.js';
import { graphifyRouter } from './routes/graphify.js';
import { agentsRouter } from './routes/agents.js';
import { SERVER_PORT } from './config/paths.js';
import { logger } from './utils/logger.js';

const app = new Hono();

app.use('*', requestLogger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.onError(errorHandler);

app.get('/', (c) =>
  c.json({
    name: 'agentik-os-server',
    version: '0.1.0',
    endpoints: [
      'GET /health',
      'GET /leads',
      'GET /leads/:id',
      'GET /graphify/status',
      'POST /graphify/reindex',
      'POST /agents/icp',
      'POST /agents/crm-manager',
    ],
  }),
);

app.route('/health', healthRouter);
app.route('/leads', leadsRouter);
app.route('/graphify', graphifyRouter);
app.route('/agents', agentsRouter);

export type AppType = typeof app;

const port = SERVER_PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info('server', `Agentik OS backend listo en http://localhost:${info.port}`);
  },
);
