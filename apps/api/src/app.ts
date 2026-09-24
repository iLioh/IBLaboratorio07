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

app.use('/health', healthRouter);
app.use('/ready', readyRouter);
app.use('/api/version', versionRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/metrics', metricsRouter);
app.use('/api/releases', releasesRouter);
app.use(notFound);
