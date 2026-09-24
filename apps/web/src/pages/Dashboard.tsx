import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  CircleGauge,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { TransactionTable } from '../components/TransactionTable';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const colors = ['#1664d8', '#47a3ff', '#8abdf5', '#b8cadf'];
const formatCompact = (value: number) =>
  new Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 2 }).format(value);

export function Dashboard() {
  const metrics = useApi(api.getMetrics);
  const transactions = useApi(api.getTransactions);

  if (metrics.loading || transactions.loading) return <LoadingState rows={7} />;
  if (metrics.error || transactions.error)
    return <ErrorState message={metrics.error ?? transactions.error ?? 'Error desconocido'} />;
  if (!metrics.data || !transactions.data) return null;

  const cards = [
    {
      label: 'Procesado hoy',
      value: `S/ ${formatCompact(metrics.data.processedToday)}`,
      trend: '+12.4%',
      icon: CircleDollarSign,
      tone: 'blue',
    },
    {
      label: 'Operaciones',
      value: metrics.data.operations.toLocaleString('es-PE'),
      trend: '+8.2%',
      icon: TrendingUp,
      tone: 'cyan',
    },
    {
      label: 'Tasa de aprobación',
      value: `${metrics.data.approvalRate}%`,
      trend: '+0.4%',
      icon: CircleGauge,
      tone: 'green',
    },
    {
      label: 'Alertas de riesgo',
      value: String(metrics.data.riskAlerts),
      trend: '-2 hoy',
      icon: ShieldAlert,
      tone: 'amber',
      down: true,
    },
  ];

  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">Miércoles, 23 de septiembre</p>
          <h2>Buenas tardes, equipo de operaciones</h2>
          <p>Visión consolidada de la actividad sintética del entorno local.</p>
        </div>
        <div className="live-indicator">
          <span />
          <div>
            <strong>Live overview</strong>
            <small>Actualizado hace unos segundos</small>
          </div>
        </div>
      </section>

      <section className="kpi-grid" aria-label="Indicadores principales">
        {cards.map(({ label, value, trend, icon: Icon, tone, down }) => (
          <article className="kpi-card" key={label}>
            <div className={`kpi-icon kpi-icon--${tone}`}>
              <Icon size={21} />
            </div>
            <div className="kpi-copy">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
            <div className={`kpi-trend ${down ? 'kpi-trend--neutral' : ''}`}>
              {down ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {trend}
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Throughput</span>
              <h3>Volumen de operaciones</h3>
            </div>
            <div className="legend-dot">
              <i /> Operaciones
            </div>
          </div>
          <div className="chart-summary">
            <strong>2,481</strong>
            <span>operaciones procesadas</span>
          </div>
          <div className="chart-area" aria-label="Gráfica de volumen por hora">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={metrics.data.volume}
                margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1768db" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1768db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e9eef5" vertical={false} />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#718096', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#718096', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    border: '1px solid #dce5f0',
                    borderRadius: 10,
                    boxShadow: '0 8px 24px rgba(17, 38, 68, .1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="operations"
                  stroke="#1768db"
                  strokeWidth={2.5}
                  fill="url(#volumeFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel channels-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Channel mix</span>
              <h3>Distribución por canal</h3>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.data.channels}
                    dataKey="value"
                    innerRadius={54}
                    outerRadius={76}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {metrics.data.channels.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>100%</strong>
                <span>tráfico</span>
              </div>
            </div>
            <div className="channel-list">
              {metrics.data.channels.map((channel, index) => (
                <div key={channel.name}>
                  <i style={{ background: colors[index] }} />
                  <span>{channel.name}</span>
                  <strong>{channel.value}%</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <article className="panel recent-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Latest activity</span>
              <h3>Transacciones recientes</h3>
            </div>
            <a href="/transactions">Ver todas</a>
          </div>
          <TransactionTable transactions={transactions.data.slice(0, 5)} compact />
        </article>
        <article className="panel service-panel">
          <div className="panel-header">
            <div>
              <span className="panel-kicker">Runtime</span>
              <h3>Estado de servicios</h3>
            </div>
            <StatusBadge tone="success">Operational</StatusBadge>
          </div>
          <div className="service-mini-list">
            <div>
              <span>
                <i className="status-dot status-dot--success" />
                Frontend
              </span>
              <strong>Healthy</strong>
            </div>
            <div>
              <span>
                <i className="status-dot status-dot--success" />
                API
              </span>
              <strong>Healthy</strong>
            </div>
            <div>
              <span>
                <i className="status-dot status-dot--success" />
                Readiness
              </span>
              <strong>Ready</strong>
            </div>
            <div>
              <span>
                <i className="status-dot status-dot--info" />
                Environment
              </span>
              <strong>local</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
