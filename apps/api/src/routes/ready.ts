import { Router } from 'express';

export const readyRouter = Router();
readyRouter.get('/', (_request, response) => response.status(200).json({ status: 'ready' }));
