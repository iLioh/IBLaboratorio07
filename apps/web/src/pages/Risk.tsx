import { AlertTriangle, CheckCircle2, ShieldCheck, ShieldX } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const formatAmount = (value: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);

export function Risk() {
  const { data, loading, error } = useApi(api.getMetrics);
  if (loading) return <LoadingState rows={5} />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;
  const riskCards = [
    {
      label: 'High risk',
      value: data.riskDistribution.high,
      subtitle: 'Immediate review',
      icon: ShieldX,
      tone: 'danger',
    },
    {
      label: 'Medium risk',
      value: data.riskDistribution.medium,
      subtitle: 'Under monitoring',
      icon: AlertTriangle,
      tone: 'warning',
    },
    {
      label: 'Low risk',
      value: data.riskDistribution.low,
      subtitle: 'Within policy',
      icon: ShieldCheck,
      tone: 'success',
    },
  ] as const;

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Risk intelligence</p>
          <h2>Alert overview</h2>
          <p>Señales preventivas generadas con reglas ficticias sobre operaciones sintéticas.</p>
        </div>
        <StatusBadge tone="info">Academic simulation</StatusBadge>
      </section>
      <section className="risk-grid">
        {riskCards.map(({ label, value, subtitle, icon: Icon, tone }) => (
          <article className={`risk-card risk-card--${tone}`} key={label}>
            <div className="risk-card-icon">
              <Icon size={22} />
            </div>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{subtitle}</small>
            </div>
            <div className="risk-bar">
              <i style={{ width: `${Math.min(value * 8, 100)}%` }} />
            </div>
          </article>
        ))}
      </section>
      <article className="panel">
        <div className="panel-header">
          <div>
            <span className="panel-kicker">Rules engine</span>
            <h3>Alertas recientes</h3>
          </div>
          <span className="text-muted">Últimas 24 horas</span>
        </div>
        <div className="alert-list">
          {data.riskAlertDetails.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <div className={`alert-icon alert-icon--${alert.riskLevel.toLowerCase()}`}>
                {alert.riskLevel === 'High' ? <ShieldX size={19} /> : <AlertTriangle size={19} />}
              </div>
              <div className="alert-main">
                <div>
                  <strong>{alert.rule}</strong>
                  <StatusBadge tone={alert.riskLevel === 'High' ? 'danger' : 'warning'}>
                    {alert.riskLevel}
                  </StatusBadge>
                </div>
                <span>
                  {alert.id} · {alert.channel} ·{' '}
                  {new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(
                    new Date(alert.timestamp),
                  )}
                </span>
              </div>
              <div className="alert-amount">
                <strong>{formatAmount(alert.amount)}</strong>
                <span>monto asociado</span>
              </div>
            </article>
          ))}
        </div>
        <div className="academic-note">
          <CheckCircle2 size={18} />
          <span>
            Estas alertas no representan decisiones de fraude ni controles regulatorios reales.
          </span>
        </div>
      </article>
    </div>
  );
}
