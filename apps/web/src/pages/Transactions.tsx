import { Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { TransactionTable } from '../components/TransactionTable';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';
import type { RiskLevel, TransactionChannel, TransactionStatus } from '../types';

export function Transactions() {
  const { data, loading, error } = useApi(api.getTransactions);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<TransactionStatus | 'All'>('All');
  const [channel, setChannel] = useState<TransactionChannel | 'All'>('All');
  const [risk, setRisk] = useState<RiskLevel | 'All'>('All');

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (item) =>
          (item.transactionId.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())) &&
          (status === 'All' || item.status === status) &&
          (channel === 'All' || item.channel === channel) &&
          (risk === 'All' || item.riskLevel === risk),
      ),
    [data, query, status, channel, risk],
  );

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Synthetic operations</p>
          <h2>Transaction monitor</h2>
          <p>
            Consulta operativa de transacciones generadas exclusivamente para esta demostración
            académica.
          </p>
        </div>
        <div className="count-chip">
          <strong>{data?.length ?? 0}</strong>
          <span>records</span>
        </div>
      </section>
      <article className="panel">
        <div className="filterbar">
          <label className="filter-search">
            <Search size={17} />
            <span className="sr-only">Buscar transacción</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por ID u operación"
            />
          </label>
          <div className="filters-label">
            <Filter size={16} />
            Filtros
          </div>
          <label>
            <span className="sr-only">Estado</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as TransactionStatus | 'All')}
            >
              <option value="All">Todos los estados</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Review</option>
              <option>Rejected</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Canal</span>
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value as TransactionChannel | 'All')}
            >
              <option value="All">Todos los canales</option>
              <option>Mobile</option>
              <option>Web</option>
              <option>ATM</option>
              <option>Branch</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Riesgo</span>
            <select
              value={risk}
              onChange={(event) => setRisk(event.target.value as RiskLevel | 'All')}
            >
              <option value="All">Todo riesgo</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
        </div>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <TransactionTable transactions={filtered} />
        )}
      </article>
    </div>
  );
}
