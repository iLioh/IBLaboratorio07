import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/api';
import { Dashboard } from './Dashboard';
import { Releases } from './Releases';
import { Services } from './Services';

vi.mock('../services/api', () => ({
  api: {
    getMetrics: vi.fn(),
    getTransactions: vi.fn(),
    getReleases: vi.fn(),
    getVersion: vi.fn(),
    health: vi.fn(),
    readiness: vi.fn(),
  },
}));

const version = {
  appVersion: 'v1.0.0',
  gitSha: 'local-dev',
  buildTime: 'local-build',
  pipelineVersion: 'v1.0.0',
  environment: 'local',
};
const metrics = {
  processedToday: 1842360.5,
  operations: 2481,
  approvalRate: 98.7,
  riskAlerts: 11,
  volume: [{ time: '08:00', operations: 142, amount: 96200 }],
  channels: [{ name: 'Mobile', value: 100 }],
  riskDistribution: { high: 3, medium: 8, low: 42 },
  riskAlertDetails: [],
};

describe('critical pages', () => {
  beforeEach(() => vi.clearAllMocks());
  it('renders the Dashboard with API metrics', async () => {
    vi.mocked(api.getMetrics).mockResolvedValue(metrics);
    vi.mocked(api.getTransactions).mockResolvedValue([]);
    render(<Dashboard />);
    expect(await screen.findByText('Buenas tardes, equipo de operaciones')).toBeInTheDocument();
    expect(screen.getByText('98.7%')).toBeInTheDocument();
  });
  it('renders version metadata in Release Center', async () => {
    vi.mocked(api.getReleases).mockResolvedValue({
      ...version,
      containerImage: 'not-built',
      releaseStatus: 'Local development',
    });
    render(<Releases />);
    await waitFor(() => expect(screen.getAllByText('v1.0.0').length).toBeGreaterThan(0));
    expect(screen.getByText('local-dev')).toBeInTheDocument();
    expect(screen.getAllByText('not-built').length).toBeGreaterThan(0);
  });
  it('renders real service states', async () => {
    vi.mocked(api.health).mockResolvedValue({ status: 'healthy', latencyMs: 8 });
    vi.mocked(api.readiness).mockResolvedValue({ status: 'ready', latencyMs: 9 });
    vi.mocked(api.getVersion).mockResolvedValue(version);
    render(<Services />);
    expect(await screen.findByText('Runtime services')).toBeInTheDocument();
    expect(screen.getAllByText('Healthy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
  });
});
