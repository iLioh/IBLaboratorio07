export type PageKey = 'dashboard' | 'transactions' | 'risk' | 'services' | 'releases' | 'audit';
export type TransactionStatus = 'Approved' | 'Pending' | 'Review' | 'Rejected';
export type TransactionChannel = 'Mobile' | 'Web' | 'ATM' | 'Branch';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Transaction {
  transactionId: string;
  timestamp: string;
  type: 'Transferencia' | 'Pago' | 'Retiro' | 'Depósito';
  amount: number;
  currency: 'PEN';
  channel: TransactionChannel;
  status: TransactionStatus;
  riskLevel: RiskLevel;
}

export interface VersionMetadata {
  appVersion: string;
  gitSha: string;
  buildTime: string;
  pipelineVersion: string;
  environment: string;
}

export interface RiskAlert {
  id: string;
  timestamp: string;
  amount: number;
  currency: 'PEN';
  channel: TransactionChannel;
  riskLevel: 'Medium' | 'High';
  rule: string;
}

export interface Metrics {
  processedToday: number;
  operations: number;
  approvalRate: number;
  riskAlerts: number;
  volume: Array<{ time: string; operations: number; amount: number }>;
  channels: Array<{ name: string; value: number }>;
  riskDistribution: { high: number; medium: number; low: number };
  riskAlertDetails: RiskAlert[];
}

export interface ReleaseMetadata extends VersionMetadata {
  containerImage: string;
  releaseStatus: string;
}

export interface ServiceProbe {
  status: 'healthy' | 'ready' | 'offline' | 'checking';
  latencyMs?: number;
}
