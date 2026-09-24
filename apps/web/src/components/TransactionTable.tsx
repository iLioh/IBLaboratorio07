import type { Transaction } from '../types';
import { StatusBadge } from './StatusBadge';

const statusTone = {
  Approved: 'success',
  Pending: 'warning',
  Review: 'warning',
  Rejected: 'danger',
} as const;

const riskTone = { Low: 'success', Medium: 'warning', High: 'danger' } as const;

const formatAmount = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export function TransactionTable({
  transactions,
  compact = false,
}: {
  transactions: Transaction[];
  compact?: boolean;
}) {
  if (transactions.length === 0)
    return <div className="empty-state">No hay operaciones para los filtros seleccionados.</div>;

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">ID / Hora</th>
            <th scope="col">Operación</th>
            {!compact && <th scope="col">Canal</th>}
            <th scope="col" className="align-right">
              Monto
            </th>
            <th scope="col">Estado</th>
            {!compact && <th scope="col">Riesgo</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.transactionId}>
              <td>
                <span className="cell-primary">{transaction.transactionId}</span>
                <span className="cell-secondary">{formatTime(transaction.timestamp)}</span>
              </td>
              <td>{transaction.type}</td>
              {!compact && <td>{transaction.channel}</td>}
              <td className="align-right cell-primary">{formatAmount(transaction.amount)}</td>
              <td>
                <StatusBadge tone={statusTone[transaction.status]}>
                  {transaction.status}
                </StatusBadge>
              </td>
              {!compact && (
                <td>
                  <StatusBadge tone={riskTone[transaction.riskLevel]}>
                    {transaction.riskLevel}
                  </StatusBadge>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
