import { Activity, Globe2, Radio, Server } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

export function Services() {
  const health = useApi(api.health);
  const readiness = useApi(api.readiness);
  const version = useApi(api.getVersion);
  if (health.loading || readiness.loading || version.loading) return <LoadingState rows={5} />;
  const offline = health.data?.status !== 'healthy';
  const isLocal = !version.data?.environment || version.data.environment === 'local';

  const services = [
    {
      name: 'Frontend',
      detail: isLocal ? 'Vite development server' : 'React static build served by Express',
      state: 'Healthy',
      icon: Globe2,
      online: true,
    },
    {
      name: 'API',
      detail: `REST API${health.data?.latencyMs ? ` · ${health.data.latencyMs} ms` : ''}`,
      state: offline ? 'Offline' : 'Healthy',
      icon: Server,
      online: !offline,
    },
    {
      name: 'Readiness',
      detail: `Traffic acceptance${readiness.data?.latencyMs ? ` · ${readiness.data.latencyMs} ms` : ''}`,
      state: readiness.data?.status === 'ready' ? 'Ready' : 'Offline',
      icon: Radio,
      online: readiness.data?.status === 'ready',
    },
    {
      name: 'Environment',
      detail: 'Runtime configuration',
      state: version.data?.environment ?? 'Unknown',
      icon: Activity,
      online: Boolean(version.data),
    },
  ];

  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Live probes</p>
          <h2>Runtime services</h2>
          <p>Estado observado directamente desde los endpoints de salud y preparación.</p>
        </div>
        <StatusBadge tone={offline ? 'danger' : 'success'}>
          {offline ? 'Degraded' : 'All operational'}
        </StatusBadge>
      </section>
      {(health.error || readiness.error || version.error) && (
        <ErrorState
          message={health.error ?? readiness.error ?? version.error ?? 'Error de conexión'}
        />
      )}
      <section className="service-grid">
        {services.map(({ name, detail, state, icon: Icon, online }) => (
          <article className="service-card" key={name}>
            <div className="service-icon">
              <Icon size={22} />
            </div>
            <div>
              <h3>{name}</h3>
              <p>{detail}</p>
            </div>
            <StatusBadge tone={online ? 'success' : 'danger'}>{state}</StatusBadge>
          </article>
        ))}
      </section>
      <article className="panel environment-panel">
        <div>
          <span className="panel-kicker">Current build</span>
          <h3>
            {version.data?.environment
              ? `${version.data.environment.toUpperCase()} environment metadata`
              : 'Runtime environment metadata'}
          </h3>
        </div>
        <dl className="metadata-grid">
          <div>
            <dt>Environment</dt>
            <dd>{version.data?.environment?.toUpperCase() ?? 'UNAVAILABLE'}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{version.data?.appVersion ?? '—'}</dd>
          </div>
          <div>
            <dt>Commit</dt>
            <dd>{version.data?.gitSha ?? '—'}</dd>
          </div>
          <div>
            <dt>Pipeline</dt>
            <dd>{version.data?.pipelineVersion ?? '—'}</dd>
          </div>
        </dl>
      </article>
    </div>
  );
}
