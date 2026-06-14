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
import { closeBrowser } from './services/pdf.service.js';
import { killAllActiveProcesses } from './utils/process-manager.js';

const app = new Hono();

app.use('*', requestLogger());
// CORS restrictivo: solo el frontend local servido por Vite.
// En producción esto debe reemplazarse por el dominio real o una env var.
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
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

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info('server', `Agentik OS backend listo en http://localhost:${info.port}`);
  },
);

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    logger.error('server', `Puerto ${port} ocupado. Cierra otra instancia o cambia PORT.`);
    process.exit(1);
  }
  logger.error('server', `Error del servidor: ${err.message}`);
});

function shutdown(signal: string): void {
  logger.info('server', `${signal} recibido, iniciando cierre graceful...`);
  killAllActiveProcesses();
  void closeBrowser().then(() => {
    server.close(() => {
      logger.info('server', 'servidor cerrado');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
