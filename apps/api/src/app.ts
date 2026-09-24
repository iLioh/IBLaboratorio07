import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import { notFound } from './middleware/notFound.js';
import { healthRouter } from './routes/health.js';
import { metricsRouter } from './routes/metrics.js';
import { readyRouter } from './routes/ready.js';
import { releasesRouter } from './routes/releases.js';
import { transactionsRouter } from './routes/transactions.js';
import { versionRouter } from './routes/version.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: true }));
app.use(express.json());

// Critical probes and API routes
app.use('/health', healthRouter);
app.use('/ready', readyRouter);
app.use('/api/version', versionRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/releases', releasesRouter);

// Strict API 404 handler: unknown /api routes must always return JSON 404, never index.html
app.use('/api', notFound);

// Resolve frontend production build directory (apps/web/dist)
const defaultStaticDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../web/dist',
);
const testFixtureDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../tests/fixtures',
);

const staticDir = process.env.STATIC_PATH
  ? path.resolve(process.env.STATIC_PATH)
  : fs.existsSync(defaultStaticDir)
    ? defaultStaticDir
    : fs.existsSync(testFixtureDir)
      ? testFixtureDir
      : defaultStaticDir;

if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir));

  // SPA fallback for client-side navigation (e.g., /transactions, /risk, /services)
  app.use((request, response, next) => {
    if (request.method === 'GET' || request.method === 'HEAD') {
      const indexPath = path.join(staticDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        return response.sendFile(indexPath);
      }
    }
    next();
  });
}

// Fallback 404 handler for non-API, non-GET or unhandled requests
app.use(notFound);
