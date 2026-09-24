import { Router } from 'express';
import { environment } from '../config/environment.js';

export const versionRouter = Router();
versionRouter.get('/', (_request, response) =>
  response.json({
    appVersion: environment.appVersion,
    gitSha: environment.gitSha,
    buildTime: environment.buildTime,
    pipelineVersion: environment.pipelineVersion,
    environment: environment.environment,
  }),
);
