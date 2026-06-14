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
 *   POST /leads
 *   PATCH /leads/:id
 *   GET  /leads/:id/proposal/:version
 *   GET  /graphify/status
 *   POST /graphify/reindex
 *   GET  /sessions
 *   GET  /sessions/:id
 *   GET  /sessions/:id/feedback
 *   PATCH /sessions/:id/fipa/:index
 *   POST /agents/icp
 *   POST /agents/crm-manager
 *   POST /agents/proposal
 *   POST /agents/call-analyzer  (multipart)
 *   POST /agents/feedback-coach
 *   GET  /agents/goal-tracker
 *   GET  /digest/ironmonkey          (Fase 4)
 *   GET  /digest/growing             (Fase 4)
 *   GET  /graph                      (Fase 4)
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
import { sessionsRouter } from './routes/sessions.js';
import { digestRouter } from './routes/digest.js';
import { graphRouter } from './routes/graph.js';
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
      'POST /leads',
      'PATCH /leads/:id',
      'GET /leads/:id/proposal/:version',
      'GET /graphify/status',
      'POST /graphify/reindex',
      'GET /sessions',
      'GET /sessions/:id',
      'GET /sessions/:id/feedback',
      'PATCH /sessions/:id/fipa/:index',
      'POST /agents/icp',
      'POST /agents/crm-manager',
      'POST /agents/proposal',
      'POST /agents/call-analyzer',
      'POST /agents/feedback-coach',
      'GET /agents/goal-tracker',
      'GET /digest/ironmonkey',
      'GET /digest/growing',
      'GET /graph',
    ],
  }),
);

app.route('/health', healthRouter);
app.route('/leads', leadsRouter);
app.route('/graphify', graphifyRouter);
app.route('/agents', agentsRouter);
app.route('/sessions', sessionsRouter);
app.route('/digest', digestRouter);
app.route('/graph', graphRouter);

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
