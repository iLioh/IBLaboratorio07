import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveAppVersion(): string {
  if (process.env.APP_VERSION) {
    return process.env.APP_VERSION;
  }
  try {
    const rootVersionPath = path.resolve(__dirname, '../../../../VERSION');
    const cwdVersionPath = path.resolve(process.cwd(), 'VERSION');
    const versionPath = fs.existsSync(rootVersionPath) ? rootVersionPath : cwdVersionPath;
    if (fs.existsSync(versionPath)) {
      const raw = fs.readFileSync(versionPath, 'utf-8').trim();
      return raw.startsWith('v') ? raw : `v${raw}`;
    }
  } catch {
    // Fallback if VERSION file cannot be read
  }
  return 'v1.0.0';
}

const fallbackBuildTime = new Date().toISOString();

export const environment = {
  appVersion: resolveAppVersion(),
  gitSha: process.env.GIT_SHA ?? 'local-dev',
  buildTime: process.env.BUILD_TIME ?? fallbackBuildTime,
  pipelineVersion: process.env.PIPELINE_VERSION ?? 'v1.0.0',
  environment: process.env.APP_ENV ?? 'local',
  containerImage: process.env.CONTAINER_IMAGE ?? 'not-built',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
} as const;
