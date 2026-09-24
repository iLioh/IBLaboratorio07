import {
  Activity,
  Bell,
  ChevronLeft,
  Gauge,
  Menu,
  ReceiptText,
  Rocket,
  Search,
  Server,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { StatusBadge } from './StatusBadge';

const items = [
  { path: '/', label: 'Dashboard', icon: Gauge },
  { path: '/transactions', label: 'Transactions', icon: ReceiptText },
  { path: '/risk', label: 'Risk', icon: ShieldAlert },
  { path: '/services', label: 'Services', icon: Server },
  { path: '/releases', label: 'Releases', icon: Rocket },
  { path: '/audit', label: 'Audit', icon: Activity },
];

const titles: Record<string, { title: string; eyebrow: string }> = {
  '/': { title: 'Operations Overview', eyebrow: 'Command center' },
  '/transactions': { title: 'Transactions', eyebrow: 'Operational ledger' },
  '/risk': { title: 'Risk Intelligence', eyebrow: 'Synthetic monitoring' },
  '/services': { title: 'Service Health', eyebrow: 'Local runtime' },
  '/releases': { title: 'Release Center', eyebrow: 'Build traceability' },
  '/audit': { title: 'Activity Log', eyebrow: 'Academic / Demo' },
};

export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const heading = titles[location.pathname] ?? titles['/'];
  const { data: version } = useApi(api.getVersion);
  const { data: health } = useApi(api.health);
  const isHealthy = health?.status === 'healthy';

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`} aria-label="Navegación principal">
        <div className="brand">
          <div className="brand-mark">TB</div>
          <div>
            <strong>TECHBANK</strong>
            <span>Operations Center</span>
          </div>
        </div>
        <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Cerrar menú">
          <X size={20} />
        </button>
        <nav>
          <span className="nav-label">Workspace</span>
          {items.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <div className="pulse-dot" />
          <div>
            <strong>Local workspace</strong>
            <span>Synthetic data only</span>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Cerrar navegación"
        />
      )}

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button className="menu-button" onClick={() => setOpen(true)} aria-label="Abrir menú">
              <Menu size={22} />
            </button>
            <div>
              <span>{heading?.eyebrow}</span>
              <h1>{heading?.title}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <span>Search operations</span>
              <kbd>⌘ K</kbd>
            </div>
            <button className="icon-button" aria-label="Notificaciones">
              <Bell size={19} />
              <span />
            </button>
            <StatusBadge tone={isHealthy ? 'success' : 'danger'}>
              {isHealthy ? 'Systems healthy' : 'API offline'}
            </StatusBadge>
            <div className="user">
              <div className="avatar">AO</div>
              <div>
                <strong>Andrea Ops</strong>
                <span>Internal demo</span>
              </div>
              <ChevronLeft size={15} className="user-chevron" />
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="statusbar">
          <span>
            <b>Environment</b> {(version?.environment ?? 'local').toUpperCase()}
          </span>
          <span>
            <b>App</b> {version?.appVersion ?? 'v1.0.0'}
          </span>
          <span>
            <b>Commit</b> {version?.gitSha ?? 'local-dev'}
          </span>
          <span>
            <b>Pipeline</b> {version?.pipelineVersion ?? 'v1.0.0'}
          </span>
        </footer>
      </div>
    </div>
  );
}
