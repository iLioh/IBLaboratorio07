import { Router } from 'express';
import { environment } from '../config/environment.js';

export const releasesRouter = Router();
releasesRouter.get('/', (_request, response) => {
  const env = environment.environment;
  const statusMap: Record<string, string> = {
    local: 'Local development',
    container: 'Container Runtime',
    ci: 'CI Validation',
    qa: 'QA Environment',
  };
  const releaseStatus = process.env.RELEASE_STATUS ?? statusMap[env] ?? 'Container Runtime';

  response.json({
    appVersion: environment.appVersion,
    gitSha: environment.gitSha,
    buildTime: environment.buildTime,
    pipelineVersion: environment.pipelineVersion,
    environment: environment.environment,
    containerImage: environment.containerImage,
    releaseStatus,
  });
});
