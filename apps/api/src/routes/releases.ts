import { Router } from 'express';
import { environment } from '../config/environment.js';

export const releasesRouter = Router();
releasesRouter.get('/', (_request, response) => {
  const isContainer = environment.environment === 'container' || environment.environment === 'ci';
  const containerImage =
    process.env.CONTAINER_IMAGE ?? (isContainer ? `techbank:${environment.gitSha}` : 'not-built');
  const releaseStatus =
    process.env.RELEASE_STATUS ?? (isContainer ? 'Container execution' : 'Local development');

  response.json({
    appVersion: environment.appVersion,
    gitSha: environment.gitSha,
    buildTime: environment.buildTime,
    pipelineVersion: environment.pipelineVersion,
    environment: environment.environment,
    containerImage,
    releaseStatus,
  });
});
