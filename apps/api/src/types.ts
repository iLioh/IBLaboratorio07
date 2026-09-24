export type TransactionType = 'Transferencia' | 'Pago' | 'Retiro' | 'Depósito';
export type TransactionChannel = 'Mobile' | 'Web' | 'ATM' | 'Branch';
export type TransactionStatus = 'Approved' | 'Pending' | 'Review' | 'Rejected';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface Transaction {
  transactionId: string;
  timestamp: string;
  type: TransactionType;
  amount: number;
  currency: 'PEN';
  channel: TransactionChannel;
  status: TransactionStatus;
  riskLevel: RiskLevel;
}

export interface RiskAlert {
  id: string;
  timestamp: string;
  amount: number;
  currency: 'PEN';
  channel: TransactionChannel;
  riskLevel: Exclude<RiskLevel, 'Low'>;
  rule: string;
}
