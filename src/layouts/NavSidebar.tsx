import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Database, Monitor, Code, Network,
  Building, Cloud, Users, Cpu, Settings, BarChart3, Brain, ShieldCheck, Activity, FileCheck, UserCheck, GitBranch, ClipboardList, Globe, Calculator, ListChecks, Coins, FlaskConical, Siren, FileDown, Server,
  type LucideIcon,
} from 'lucide-react';
import { DomainService } from '../services/DomainService';

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  Shield, Database, Monitor, Code, Network, Building, Cloud, Users, Cpu,
};

type Line = '1st' | '2nd';

function LineToggle({ line, onChange }: { line: Line; onChange: (l: Line) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 0, background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 7, padding: 2, marginBottom: 10,
    }}>
      {(['1st', '2nd'] as Line[]).map(l => (
        <button
          key={l}
          onClick={() => onChange(l)}
          style={{
            flex: 1, padding: '5px 0', border: 'none', borderRadius: 5, cursor: 'pointer',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.03em',
            background: line === l ? (l === '1st' ? 'var(--cyan)' : '#A78BFA') : 'transparent',
            color: line === l ? '#000' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}
        >
          {l} Line
        </button>
      ))}
    </div>
  );
}

export default function NavSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const domains = DomainService.getAll();

  const [line, setLine] = useState<Line>(() => {
    try { return (localStorage.getItem('lumina-line') as Line) ?? '1st'; } catch { return '1st'; }
  });

  function handleLineChange(l: Line) {
    setLine(l);
    try { localStorage.setItem('lumina-line', l); } catch { /* noop */ }
  }

  function navBtn(
    path: string, label: string, icon: React.ReactNode, activeColor = 'var(--cyan)',
  ) {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return (
      <button
        key={path}
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={() => navigate(path)}
      >
        <span style={{ color: isActive ? activeColor : undefined }}>{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  return (
    <nav className="nav-sidebar">
      {/* ── Line-of-Defence toggle ── */}
      <LineToggle line={line} onChange={handleLineChange} />

      {/* ══════════════════════════════════════
          1st LINE OF DEFENCE
          ══════════════════════════════════════ */}
      {line === '1st' && (
        <>
          <div className="nav-section-label">Navigation</div>

          {navBtn('/', 'Dashboard', <LayoutDashboard size={15} />)}

          <div className="nav-section-label" style={{ marginTop: 12 }}>Risk Domains</div>

          {domains.map(domain => {
            const Icon = DOMAIN_ICONS[domain.iconName] ?? Shield;
            const isActive = pathname.startsWith(`/domain/${domain.id}`);
            return (
              <button
                key={domain.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(`/domain/${domain.id}`)}
              >
                <div className="nav-domain-dot" style={{ background: domain.color }} />
                <Icon size={13} color={isActive ? domain.color : undefined} />
                <span>{domain.name}</span>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <div className="nav-section-label">Governance</div>

          {navBtn('/governance',        'Governance',        <ShieldCheck size={14} />,   'var(--low)')}
          {navBtn('/resilience',        'Resilience',        <Activity size={14} />,      'var(--cyan)')}
          {navBtn('/ai-governance',     'AI Governance',     <Brain size={14} />,         'var(--purple)')}
          {navBtn('/evidence',          'Evidence',          <FileCheck size={14} />,     'var(--low)')}
          {navBtn('/identities',        'Identities',        <UserCheck size={14} />,     'var(--cyan)')}
          {navBtn('/workflows',         'Workflows',         <GitBranch size={14} />,     'var(--purple)')}
          {navBtn('/ai-registry',       'AI Registry',       <ClipboardList size={14} />, 'var(--cyan)')}
          {navBtn('/data-sovereignty',  'Data Sovereignty',  <Globe size={14} />,         'var(--cyan)')}
          {navBtn('/scoring',           'Scoring',           <Calculator size={14} />,    'var(--cyan)')}
          {navBtn('/approval-queue',    'Approval Queue',    <ListChecks size={14} />,    'var(--cyan)')}
          {navBtn('/ai-finops',         'AI FinOps',         <Coins size={14} />,         'var(--cyan)')}
          {navBtn('/architecture',      'Architecture',      <Network size={14} />,       'var(--cyan)')}
          {navBtn('/cmdb',              'Asset & Config',    <Server size={14} />,        '#A78BFA')}
          {navBtn('/action-items',      'Action Items',      <ClipboardList size={14} />, 'var(--cyan)')}
          {navBtn('/control-testing',   'Control Testing',   <FlaskConical size={14} />,  'var(--cyan)')}
          {navBtn('/incident-triggers', 'Incident Triggers', <Siren size={14} />,         '#FF5252')}
          {navBtn('/export',            'Export to Sheets',  <FileDown size={14} />,      'var(--cyan)')}

          <div className="nav-section-label">Other</div>
          <button className="nav-item disabled" disabled><BarChart3 size={15} /><span>Reports</span><span className="nav-badge">Soon</span></button>
          <button className="nav-item disabled" disabled><Settings size={15} /><span>Settings</span><span className="nav-badge">Soon</span></button>
        </>
      )}

      {/* ══════════════════════════════════════
          2nd LINE OF DEFENCE
          ══════════════════════════════════════ */}
      {line === '2nd' && (
        <>
          <div className="nav-section-label">2nd Line Overview</div>

          {navBtn('/cmdb', 'Asset & Config (CMDB)', <Server size={14} />, '#A78BFA')}

          <div className="nav-section-label" style={{ marginTop: 10 }}>Coming Soon</div>
          <button className="nav-item disabled" disabled><ShieldCheck size={14} /><span>Oversight Dashboard</span><span className="nav-badge">Soon</span></button>
          <button className="nav-item disabled" disabled><Globe size={14} /><span>Compliance Register</span><span className="nav-badge">Soon</span></button>
          <button className="nav-item disabled" disabled><BarChart3 size={14} /><span>Horizon Scanning</span><span className="nav-badge">Soon</span></button>
        </>
      )}
    </nav>
  );
}
