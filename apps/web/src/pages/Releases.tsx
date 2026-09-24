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

  const envTitles: Record<string, { eyebrow: string; subtitle: string; postureTitle: string }> = {
    local: {
      eyebrow: 'Current local release',
      subtitle: 'Build metadata prepared for end-to-end traceability in later delivery phases.',
      postureTitle: 'Local foundation ready',
    },
    container: {
      eyebrow: 'Current container release',
      subtitle: 'Runtime build metadata served from production container execution environment.',
      postureTitle: 'Container runtime ready',
    },
    ci: {
      eyebrow: 'CI validation release',
      subtitle: 'Automated build and smoke test metadata verified during CI pipeline execution.',
      postureTitle: 'CI pipeline validation active',
    },
    qa: {
      eyebrow: 'QA environment release',
      subtitle: 'Release candidate build metadata deployed for quality assurance validation.',
      postureTitle: 'QA environment active',
    },
  };

  const meta = envTitles[data.environment] ?? {
    eyebrow: 'Current release',
    subtitle: `Runtime build metadata for ${data.environment.toUpperCase()} environment.`,
    postureTitle: `${data.environment.toUpperCase()} environment ready`,
  };

  return (
    <div className="page-stack">
      <section className="release-hero">
        <div>
          <div className="release-icon">
            <Layers3 size={28} />
          </div>
          <span className="eyebrow">{meta.eyebrow}</span>
          <h2>{data.appVersion}</h2>
          <p>{meta.subtitle}</p>
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
          <h3>{meta.postureTitle}</h3>
          <p>
            {data.containerImage === 'not-built' ? (
              <>
                La aplicación ya separa versión, commit, build y versión del pipeline. La imagen de
                contenedor permanece correctamente marcada como <code>not-built</code> en esta fase
                local.
              </>
            ) : (
              <>
                La aplicación se está ejecutando desde la imagen de contenedor{' '}
                <code>{data.containerImage}</code> en entorno {data.environment}.
              </>
            )}
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
