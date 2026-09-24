import type {
  Metrics,
  ReleaseMetadata,
  ServiceProbe,
  Transaction,
  VersionMetadata,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const TIMEOUT_MS = 5000;

async function request<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`API error ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('La API excedió el tiempo de espera');
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function probe(path: string, expected: string): Promise<ServiceProbe> {
  const startedAt = performance.now();
  try {
    const data = await request<{ status: string }>(path);
    return {
      status: data.status === expected ? (expected === 'ready' ? 'ready' : 'healthy') : 'offline',
      latencyMs: Math.round(performance.now() - startedAt),
    };
  } catch {
    return { status: 'offline' };
  }
}

export const api = {
  getVersion: () => request<VersionMetadata>('/api/version'),
  getTransactions: () => request<Transaction[]>('/api/transactions'),
  getMetrics: () => request<Metrics>('/api/metrics'),
  getReleases: () => request<ReleaseMetadata>('/api/releases'),
  health: () => probe('/health', 'ok'),
  readiness: () => probe('/ready', 'ready'),
};
