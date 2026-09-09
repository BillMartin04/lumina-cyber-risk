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

export type Line = '1st' | '2nd' | '3rd' | '4th';

const LINE_TABS: { key: Line; label: string; color: string }[] = [
  { key: '1st', label: '1st', color: 'var(--cyan)' },
  { key: '2nd', label: '2nd', color: '#A78BFA' },
  { key: '3rd', label: '3rd', color: '#FF8C00' },
  { key: '4th', label: '4th', color: '#00E676' },
];

function LineTabBar({ line, onChange }: { line: Line; onChange: (l: Line) => void }) {
  return (
    <div style={{
      display: 'flex', gap: 2, background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 8,
      padding: 3, marginBottom: 12,
    }}>
      {LINE_TABS.map(t => {
        const active = line === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            title={`${t.key} Line of Defense`}
            style={{
              flex: 1, padding: '5px 0', border: 'none', borderRadius: 5,
              cursor: 'pointer', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.04em', lineHeight: 1,
              background: active ? t.color : 'transparent',
              color: active ? '#000' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        );
      })}
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

  function soonBtn(label: string, icon: React.ReactNode) {
    return (
      <button key={label} className="nav-item disabled" disabled>
        {icon}<span>{label}</span><span className="nav-badge">Soon</span>
      </button>
    );
  }

  return (
    <nav className="nav-sidebar">
      {/* ── Line of Defense tabs ── */}
      <LineTabBar line={line} onChange={handleLineChange} />

      {/* ══════════════════════════════════════
          1st LINE — Operational Risk Management
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
          {navBtn('/governance',        'Governance',        <ShieldCheck size={14} />,    'var(--low)')}
          {navBtn('/resilience',        'Resilience',        <Activity size={14} />,       'var(--cyan)')}
          {navBtn('/ai-governance',     'AI Governance',     <Brain size={14} />,          'var(--purple)')}
          {navBtn('/evidence',          'Evidence',          <FileCheck size={14} />,      'var(--low)')}
          {navBtn('/identities',        'Identities',        <UserCheck size={14} />,      'var(--cyan)')}
          {navBtn('/workflows',         'Workflows',         <GitBranch size={14} />,      'var(--purple)')}
          {navBtn('/ai-registry',       'AI Registry',       <ClipboardList size={14} />,  'var(--cyan)')}
          {navBtn('/data-sovereignty',  'Data Sovereignty',  <Globe size={14} />,          'var(--cyan)')}
          {navBtn('/scoring',           'Scoring',           <Calculator size={14} />,     'var(--cyan)')}
          {navBtn('/approval-queue',    'Approval Queue',    <ListChecks size={14} />,     'var(--cyan)')}
          {navBtn('/ai-finops',         'AI FinOps',         <Coins size={14} />,          'var(--cyan)')}
          {navBtn('/architecture',      'Architecture',      <Network size={14} />,        'var(--cyan)')}
          {navBtn('/cmdb',              'Asset & Config',    <Server size={14} />,         '#A78BFA')}
          {navBtn('/action-items',      'Action Items',      <ClipboardList size={14} />,  'var(--cyan)')}
          {navBtn('/control-testing',   'Control Testing',   <FlaskConical size={14} />,   'var(--cyan)')}
          {navBtn('/incident-triggers', 'Incident Triggers', <Siren size={14} />,          '#FF5252')}
          {navBtn('/export',            'Export to Sheets',  <FileDown size={14} />,       'var(--cyan)')}

          <div className="nav-section-label">Other</div>
          {soonBtn('Reports',  <BarChart3 size={15} />)}
          {soonBtn('Settings', <Settings size={15} />)}
        </>
      )}

      {/* ══════════════════════════════════════
          2nd LINE — Risk Oversight & Compliance
          ══════════════════════════════════════ */}
      {line === '2nd' && (
        <>
          <div className="nav-section-label">Asset Foundation</div>
          {navBtn('/cmdb', 'Asset & Config (CMDB)', <Server size={14} />, '#A78BFA')}

          <div className="nav-section-label" style={{ marginTop: 10 }}>Oversight</div>
          {soonBtn('Oversight Dashboard',  <BarChart3 size={14} />)}
          {soonBtn('Compliance Register',  <Globe size={14} />)}
          {soonBtn('Horizon Scanning',     <ShieldCheck size={14} />)}
          {soonBtn('Risk Aggregation',     <Calculator size={14} />)}
          {soonBtn('Control Assurance',    <FlaskConical size={14} />)}
        </>
      )}

      {/* ══════════════════════════════════════
          3rd LINE — Internal Audit
          ══════════════════════════════════════ */}
      {line === '3rd' && (
        <>
          <div className="nav-section-label">Internal Audit</div>
          {soonBtn('Audit Universe',       <ClipboardList size={14} />)}
          {soonBtn('Audit Planning',       <ListChecks size={14} />)}
          {soonBtn('Findings Register',    <FileCheck size={14} />)}
          {soonBtn('Issue Tracking',       <Activity size={14} />)}
          {soonBtn('Audit Reports',        <BarChart3 size={14} />)}
        </>
      )}

      {/* ══════════════════════════════════════
          4th LINE — External Audit & Regulator
          ══════════════════════════════════════ */}
      {line === '4th' && (
        <>
          <div className="nav-section-label">External Assurance</div>
          {soonBtn('Regulatory Submissions', <Globe size={14} />)}
          {soonBtn('External Audit Log',     <FileCheck size={14} />)}
          {soonBtn('Regulator Portal',       <ShieldCheck size={14} />)}
          {soonBtn('Board Reporting',        <BarChart3 size={14} />)}
        </>
      )}
    </nav>
  );
}
