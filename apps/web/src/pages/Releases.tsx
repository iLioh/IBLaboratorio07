import { Box, CheckCircle2, Clock3, Code2, GitCommitHorizontal, Layers3 } from 'lucide-react';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { StatusBadge } from '../components/StatusBadge';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

export function Releases() {
  const { data, loading, error } = useApi(api.getReleases);
  if (loading) return <LoadingState rows={6} />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;
  const fields = [
    { label: 'Environment', value: data.environment.toUpperCase(), icon: Layers3 },
    { label: 'Application', value: data.appVersion, icon: Code2 },
    { label: 'Commit', value: data.gitSha, icon: GitCommitHorizontal },
    { label: 'Pipeline', value: data.pipelineVersion, icon: CheckCircle2 },
    { label: 'Build', value: data.buildTime, icon: Clock3 },
    { label: 'Container image', value: data.containerImage, icon: Box },
  ];
  return (
    <div className="page-stack">
      <section className="release-hero">
        <div>
          <div className="release-icon">
            <Layers3 size={28} />
          </div>
          <span className="eyebrow">Current local release</span>
          <h2>{data.appVersion}</h2>
          <p>Build metadata prepared for end-to-end traceability in later delivery phases.</p>
        </div>
        <StatusBadge tone="info">{data.releaseStatus}</StatusBadge>
      </section>
      <section className="release-grid">
        {fields.map(({ label, value, icon: Icon }) => (
          <article className="release-field" key={label}>
            <div>
              <Icon size={19} />
            </div>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <article className="panel roadmap-card">
        <div>
          <span className="panel-kicker">Release posture</span>
          <h3>Local foundation ready</h3>
          <p>
            La aplicación ya separa versión, commit, build y versión del pipeline. La imagen de
            contenedor permanece correctamente marcada como <code>not-built</code> en esta fase.
          </p>
        </div>
        <div className="readiness-list">
          <span>
            <CheckCircle2 size={17} />
            Application metadata
          </span>
          <span>
            <CheckCircle2 size={17} />
            Environment variables
          </span>
          <span>
            <CheckCircle2 size={17} />
            API contract
          </span>
        </div>
      </article>
    </div>
  );
}
