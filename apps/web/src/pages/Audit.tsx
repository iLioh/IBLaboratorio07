import { Activity, CheckCircle2, Database, HeartPulse, PlayCircle } from 'lucide-react';

const events = [
  {
    time: '18:42',
    title: 'Application started',
    detail: 'TechBank Operations Center initialized in local mode.',
    icon: PlayCircle,
  },
  {
    time: '18:42',
    title: 'Health endpoint available',
    detail: 'Liveness probe responded with HTTP 200.',
    icon: HeartPulse,
  },
  {
    time: '18:41',
    title: 'Synthetic transaction dataset loaded',
    detail: '12 demonstration records available without PII.',
    icon: Database,
  },
  {
    time: '18:41',
    title: 'Local environment initialized',
    detail: 'Safe defaults applied for version and build metadata.',
    icon: CheckCircle2,
  },
];

export function Audit() {
  return (
    <div className="page-stack">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Academic / Demo activity log</p>
          <h2>Laboratory events</h2>
          <p>
            Registro sintético para visualizar actividad del proyecto. No constituye auditoría
            regulatoria.
          </p>
        </div>
        <div className="audit-symbol">
          <Activity size={24} />
        </div>
      </section>
      <article className="panel audit-panel">
        <div className="timeline">
          {events.map(({ time, title, detail, icon: Icon }, index) => (
            <div className="timeline-item" key={title}>
              <div className="timeline-time">
                {time}
                <span>LOCAL</span>
              </div>
              <div className="timeline-marker">
                <div>
                  <Icon size={17} />
                </div>
                {index < events.length - 1 && <i />}
              </div>
              <div className="timeline-content">
                <strong>{title}</strong>
                <p>{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
