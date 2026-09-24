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

  it('renders the Dashboard with API metrics and service probes', async () => {
    vi.mocked(api.getMetrics).mockResolvedValue(metrics);
    vi.mocked(api.getTransactions).mockResolvedValue([]);
    vi.mocked(api.health).mockResolvedValue({ status: 'healthy' });
    vi.mocked(api.readiness).mockResolvedValue({ status: 'ready' });
    vi.mocked(api.getVersion).mockResolvedValue(version);

    render(<Dashboard />);
    expect(await screen.findByText('Buenas tardes, equipo de operaciones')).toBeInTheDocument();
    expect(screen.getByText('98.7%')).toBeInTheDocument();
    expect(screen.getByText('Operational')).toBeInTheDocument();
  });

  it('renders degraded state in Dashboard service status when health fails', async () => {
    vi.mocked(api.getMetrics).mockResolvedValue(metrics);
    vi.mocked(api.getTransactions).mockResolvedValue([]);
    vi.mocked(api.health).mockResolvedValue({ status: 'offline' });
    vi.mocked(api.readiness).mockResolvedValue({ status: 'offline' });
    vi.mocked(api.getVersion).mockResolvedValue(version);

    render(<Dashboard />);
    expect(await screen.findByText('Buenas tardes, equipo de operaciones')).toBeInTheDocument();
    expect(screen.getByText('Degraded')).toBeInTheDocument();
  });

  it('renders version metadata in Release Center for local environment', async () => {
    vi.mocked(api.getReleases).mockResolvedValue({
      ...version,
      containerImage: 'not-built',
      releaseStatus: 'Local development',
    });
    render(<Releases />);
    await waitFor(() => expect(screen.getAllByText('v1.0.0').length).toBeGreaterThan(0));
    expect(screen.getByText('Current local release')).toBeInTheDocument();
    expect(screen.getByText('local-dev')).toBeInTheDocument();
    expect(screen.getAllByText('not-built').length).toBeGreaterThan(0);
  });

  it('renders container metadata dynamically in Release Center when environment is ci/container', async () => {
    vi.mocked(api.getReleases).mockResolvedValue({
      appVersion: 'v1.0.0',
      gitSha: 'abc1234',
      buildTime: '2026-09-24T00:00:00Z',
      pipelineVersion: 'v1.0.0',
      environment: 'ci',
      containerImage: 'techbank:abc1234',
      releaseStatus: 'CI Validation',
    });
    render(<Releases />);
    await waitFor(() => expect(screen.getByText('CI validation release')).toBeInTheDocument());
    expect(screen.getByText('CI Validation')).toBeInTheDocument();
    expect(screen.getAllByText('techbank:abc1234').length).toBeGreaterThan(0);
    expect(screen.queryByText('Current local release')).not.toBeInTheDocument();
  });

  it('renders real service states and describes Vite vs Express frontend runtime', async () => {
    vi.mocked(api.health).mockResolvedValue({ status: 'healthy', latencyMs: 8 });
    vi.mocked(api.readiness).mockResolvedValue({ status: 'ready', latencyMs: 9 });
    vi.mocked(api.getVersion).mockResolvedValue({ ...version, environment: 'container' });

    render(<Services />);
    expect(await screen.findByText('Runtime services')).toBeInTheDocument();
    expect(screen.getByText('React static build served by Express')).toBeInTheDocument();
    expect(screen.getAllByText('Healthy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
  });
});
