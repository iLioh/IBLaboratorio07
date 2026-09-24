import { Router } from 'express';
import { transactions } from '../data/transactions.js';

export const transactionsRouter = Router();
transactionsRouter.get('/', (_request, response) => response.json(transactions));
