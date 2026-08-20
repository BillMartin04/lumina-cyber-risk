import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Shield, Database, Monitor, Code, Network,
  Building, Cloud, Users, Cpu, Settings, BarChart3, Brain, ShieldCheck, Activity, FileCheck, UserCheck, GitBranch, ClipboardList, Globe, Calculator, ListChecks, Coins, FlaskConical,
  type LucideIcon,
} from 'lucide-react';
import { DomainService } from '../services/DomainService';

const DOMAIN_ICONS: Record<string, LucideIcon> = {
  Shield, Database, Monitor, Code, Network, Building, Cloud, Users, Cpu,
};

export default function NavSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const domains = DomainService.getAll();

  return (
    <nav className="nav-sidebar">
      <div className="nav-section-label">Navigation</div>

      <button
        className={`nav-item ${pathname === '/' ? 'active' : ''}`}
        onClick={() => navigate('/')}
      >
        <LayoutDashboard size={15} />
        <span>Dashboard</span>
      </button>

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

      <button
        className={`nav-item ${pathname === '/governance' ? 'active' : ''}`}
        onClick={() => navigate('/governance')}
      >
        <ShieldCheck size={14} color={pathname === '/governance' ? 'var(--low)' : undefined} />
        <span>Governance</span>
      </button>

      <button
        className={`nav-item ${pathname === '/resilience' ? 'active' : ''}`}
        onClick={() => navigate('/resilience')}
      >
        <Activity size={14} color={pathname === '/resilience' ? 'var(--cyan)' : undefined} />
        <span>Resilience</span>
      </button>

      <button
        className={`nav-item ${pathname === '/ai-governance' ? 'active' : ''}`}
        onClick={() => navigate('/ai-governance')}
      >
        <Brain size={14} color={pathname === '/ai-governance' ? 'var(--purple)' : undefined} />
        <span>AI Governance</span>
      </button>

      <button
        className={`nav-item ${pathname === '/evidence' ? 'active' : ''}`}
        onClick={() => navigate('/evidence')}
      >
        <FileCheck size={14} color={pathname === '/evidence' ? 'var(--low)' : undefined} />
        <span>Evidence</span>
      </button>

      <button
        className={`nav-item ${pathname === '/identities' ? 'active' : ''}`}
        onClick={() => navigate('/identities')}
      >
        <UserCheck size={14} color={pathname === '/identities' ? 'var(--cyan)' : undefined} />
        <span>Identities</span>
      </button>

      <button
        className={`nav-item ${pathname === '/workflows' ? 'active' : ''}`}
        onClick={() => navigate('/workflows')}
      >
        <GitBranch size={14} color={pathname === '/workflows' ? 'var(--purple)' : undefined} />
        <span>Workflows</span>
      </button>

      <button
        className={`nav-item ${pathname === '/ai-registry' ? 'active' : ''}`}
        onClick={() => navigate('/ai-registry')}
      >
        <ClipboardList size={14} color={pathname === '/ai-registry' ? 'var(--cyan)' : undefined} />
        <span>AI Registry</span>
      </button>

      <button
        className={`nav-item ${pathname === '/data-sovereignty' ? 'active' : ''}`}
        onClick={() => navigate('/data-sovereignty')}
      >
        <Globe size={14} color={pathname === '/data-sovereignty' ? 'var(--cyan)' : undefined} />
        <span>Data Sovereignty</span>
      </button>

      <button
        className={`nav-item ${pathname === '/scoring' ? 'active' : ''}`}
        onClick={() => navigate('/scoring')}
      >
        <Calculator size={14} color={pathname === '/scoring' ? 'var(--cyan)' : undefined} />
        <span>Scoring</span>
      </button>

      <button
        className={`nav-item ${pathname === '/approval-queue' ? 'active' : ''}`}
        onClick={() => navigate('/approval-queue')}
      >
        <ListChecks size={14} color={pathname === '/approval-queue' ? 'var(--cyan)' : undefined} />
        <span>Approval Queue</span>
      </button>

      <button
        className={`nav-item ${pathname === '/ai-finops' ? 'active' : ''}`}
        onClick={() => navigate('/ai-finops')}
      >
        <Coins size={14} color={pathname === '/ai-finops' ? 'var(--cyan)' : undefined} />
        <span>AI FinOps</span>
      </button>

      <button
        className={`nav-item ${pathname === '/architecture' ? 'active' : ''}`}
        onClick={() => navigate('/architecture')}
      >
        <Network size={14} color={pathname === '/architecture' ? 'var(--cyan)' : undefined} />
        <span>Architecture</span>
      </button>

      <button
        className={`nav-item ${pathname === '/action-items' ? 'active' : ''}`}
        onClick={() => navigate('/action-items')}
      >
        <ClipboardList size={14} color={pathname === '/action-items' ? 'var(--cyan)' : undefined} />
        <span>Action Items</span>
      </button>

      <button
        className={`nav-item ${pathname === '/control-testing' ? 'active' : ''}`}
        onClick={() => navigate('/control-testing')}
      >
        <FlaskConical size={14} color={pathname === '/control-testing' ? 'var(--cyan)' : undefined} />
        <span>Control Testing</span>
      </button>

      <div className="nav-section-label">Other</div>

      <button className="nav-item disabled" disabled>
        <BarChart3 size={15} />
        <span>Reports</span>
        <span className="nav-badge">Soon</span>
      </button>

      <button className="nav-item disabled" disabled>
        <Settings size={15} />
        <span>Settings</span>
        <span className="nav-badge">Soon</span>
      </button>
    </nav>
  );
}
