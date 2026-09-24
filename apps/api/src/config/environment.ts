import 'dotenv/config';

const fallbackBuildTime = new Date().toISOString();

export const environment = {
  appVersion: process.env.APP_VERSION ?? 'v1.0.0',
  gitSha: process.env.GIT_SHA ?? 'local-dev',
  buildTime: process.env.BUILD_TIME ?? fallbackBuildTime,
  pipelineVersion: process.env.PIPELINE_VERSION ?? 'v1.0.0',
  environment: process.env.APP_ENV ?? 'local',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
} as const;
