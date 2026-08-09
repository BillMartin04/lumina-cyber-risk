import { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';
import NavSidebar from './NavSidebar';
import { PORTAL_DATE } from '../data/cyberRiskData';
import { AIAssistProvider, useAIAssist } from '../context/AIAssistContext';
import AIAssistPanel from '../components/AIAssistPanel/AIAssistPanel';

function PageContextSync() {
  const { setPageContext } = useAIAssist();
  const { pathname } = useLocation();
  const { domainId, riskId } = useParams<{ domainId?: string; riskId?: string }>();

  useEffect(() => {
    let page = 'dashboard';
    if (pathname.startsWith('/domain') && riskId)  page = 'risk';
    else if (pathname.startsWith('/domain'))        page = 'domain';
    else if (pathname.startsWith('/ai-governance')) page = 'ai-governance';
    else if (pathname.startsWith('/governance'))    page = 'governance';
    else if (pathname.startsWith('/resilience'))    page = 'resilience';
    else if (pathname.startsWith('/evidence'))      page = 'evidence';
    else if (pathname.startsWith('/identities'))    page = 'identities';
    else if (pathname.startsWith('/workflows'))     page = 'workflows';
    else if (pathname.startsWith('/ai-registry'))       page = 'ai-registry';
    else if (pathname.startsWith('/data-sovereignty'))  page = 'data-sovereignty';
    else if (pathname.startsWith('/scoring'))           page = 'scoring';
    else if (pathname.startsWith('/approval-queue'))   page = 'approval-queue';
    else if (pathname.startsWith('/ai-finops'))        page = 'ai-finops';
    else if (pathname.startsWith('/architecture'))    page = 'architecture';
    else if (pathname.startsWith('/action-items'))    page = 'action-items';
    setPageContext({ page, domainId, riskId });
  }, [pathname, domainId, riskId, setPageContext]);

  return null;
}

function FloatingToggle() {
  const { toggle, approvalQueue } = useAIAssist();
  const pending = approvalQueue.filter(i => i.status === 'pending').length;

  return (
    <button
      onClick={toggle}
      title="AI Assist"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 199,
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--cyan), var(--purple))',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,212,255,0.4)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(0,212,255,0.6)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,212,255,0.4)';
      }}
    >
      <Sparkles size={20} color="#000" strokeWidth={2} />
      {pending > 0 && (
        <div style={{
          position: 'absolute', top: -3, right: -3,
          width: 18, height: 18, borderRadius: '50%',
          background: 'var(--critical)', color: '#fff',
          fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg)',
        }}>{pending}</div>
      )}
    </button>
  );
}

function Layout() {
  return (
    <div className="app-shell">
      <PageContextSync />

      <header className="app-header">
        <div className="app-header-brand">
          <Shield size={18} color="var(--cyan)" strokeWidth={1.8} />
          <div>
            <div className="app-header-title">Lumina</div>
            <div className="app-header-sub">CyberLens for GRC</div>
          </div>
        </div>
        <div className="app-header-meta">
          <span className="live-badge">● LIVE</span>
          <span>{PORTAL_DATE}</span>
        </div>
      </header>

      <div className="app-body">
        <NavSidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>

      <FloatingToggle />
      <AIAssistPanel />
    </div>
  );
}

export default function MasterLayout() {
  return (
    <AIAssistProvider>
      <Layout />
    </AIAssistProvider>
  );
}
