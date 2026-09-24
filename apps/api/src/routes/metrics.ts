import { Router } from 'express';
import { metrics } from '../data/metrics.js';
import { riskAlerts } from '../data/transactions.js';

export const metricsRouter = Router();
metricsRouter.get('/', (_request, response) =>
  response.json({ ...metrics, riskAlertDetails: riskAlerts }),
);
