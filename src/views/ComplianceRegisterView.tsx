import { useComplianceRegister, ALL_FRAMEWORKS } from '../controllers/useComplianceRegister';
import type { ComplianceObligation, ObligationStatus } from '../controllers/useComplianceRegister';

function statusColor(s: ObligationStatus) {
  if (s === 'compliant')     return 'var(--low)';
  if (s === 'partial')       return 'var(--medium)';
  if (s === 'non-compliant') return 'var(--critical)';
  return 'var(--cyan)';
}

function statusBg(s: ObligationStatus) {
  if (s === 'compliant')     return 'var(--low-10)';
  if (s === 'partial')       return 'var(--medium-10)';
  if (s === 'non-compliant') return 'var(--critical-10)';
  return 'var(--cyan-10)';
}

function statusLabel(s: ObligationStatus) {
  if (s === 'compliant')     return 'Compliant';
  if (s === 'partial')       return 'Partial';
  if (s === 'non-compliant') return 'Non-Compliant';
  return 'Under Review';
}

function priorityColor(p: string) {
  if (p === 'critical') return 'var(--critical)';
  if (p === 'high')     return 'var(--high)';
  if (p === 'medium')   return 'var(--medium)';
  return 'var(--low)';
}

function frameworkColor(fw: string) {
  const map: Record<string, string> = {
    'SOX':      '#60a5fa',
    'GDPR':     '#a78bfa',
    'NIST-CSF': '#00d4ff',
    'ISO-27001':'#00d68f',
    'PCI-DSS':  '#ff7730',
    'GLBA':     '#ffc107',
    'AML':      '#f472b6',
    'CCPA':     '#34d399',
    'FinCEN':   '#fb923c',
    'NIST-AI-RMF': '#818cf8',
  };
  return map[fw] ?? 'var(--text-muted)';
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

function daysUntil(dueDate: string) {
  const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
  return diff;
}

// ── Stats Banner ─────────────────────────────────────────────────────────────
function RegisterBanner({ stats, framework }: {
  stats: ReturnType<typeof useComplianceRegister>['stats'];
  framework: string;
}) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference * (1 - stats.compliantPct / 100);
  const color = stats.compliantPct >= 80 ? 'var(--low)' : stats.compliantPct >= 60 ? 'var(--medium)' : 'var(--critical)';

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '16px 22px',
      display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #a855f7, #60a5fa, transparent)',
      }} />

      {/* Compliance ring */}
      <div style={{ width: 60, height: 60, position: 'relative', flexShrink: 0 }}>
        <svg width="60" height="60" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle cx="30" cy="30" r="26" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>{stats.compliantPct}%</span>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
          Compliance Obligations Register
          {framework !== 'All' && <span style={{ color: frameworkColor(framework), marginLeft: 8 }}>— {framework}</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {stats.total} obligations tracked · {framework === 'All' ? '8 frameworks' : framework}
        </div>
        {stats.upcomingSoon > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
            fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
            background: 'var(--high-10)', border: '1px solid rgba(255,119,48,0.3)', color: 'var(--high)',
          }}>⏱ {stats.upcomingSoon} obligation{stats.upcomingSoon > 1 ? 's' : ''} due within 60 days</div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden' }}>
        {[
          { val: stats.total,       lbl: 'Total',        color: 'var(--text)' },
          { val: stats.compliant,   lbl: 'Compliant',    color: 'var(--low)' },
          { val: stats.partial,     lbl: 'Partial',      color: 'var(--medium)' },
          { val: stats.nonCompliant,lbl: 'Non-Compliant',color: 'var(--critical)' },
          { val: stats.underReview, lbl: 'Under Review', color: 'var(--cyan)' },
        ].map(({ val, lbl, color: c }) => (
          <div key={lbl} style={{
            padding: '10px 14px', background: 'rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', gap: 3, minWidth: 66,
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: c, lineHeight: 1 }}>{val}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Framework Tabs ────────────────────────────────────────────────────────────
function FrameworkTabs({ active, onChange }: { active: string; onChange: (f: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
      {ALL_FRAMEWORKS.map(fw => {
        const isActive = fw === active;
        const color = fw === 'All' ? 'var(--cyan)' : frameworkColor(fw);
        return (
          <button key={fw} onClick={() => onChange(fw)} style={{
            padding: '5px 12px', borderRadius: 6, border: `1px solid ${isActive ? color : 'var(--border)'}`,
            background: isActive ? `color-mix(in srgb, ${color} 15%, transparent)` : 'transparent',
            color: isActive ? color : 'var(--text-muted)',
            fontSize: 11, fontWeight: isActive ? 700 : 500,
            cursor: 'pointer', transition: 'all 0.12s',
          }}>
            {fw}
          </button>
        );
      })}
    </div>
  );
}

// ── Filters Row ───────────────────────────────────────────────────────────────
function FiltersRow({ statusFilter, onStatus, search, onSearch }: {
  statusFilter: string;
  onStatus: (s: any) => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const statuses: { val: string; label: string }[] = [
    { val: 'all',           label: 'All Statuses' },
    { val: 'compliant',     label: 'Compliant' },
    { val: 'partial',       label: 'Partial' },
    { val: 'non-compliant', label: 'Non-Compliant' },
    { val: 'under-review',  label: 'Under Review' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder="Search obligations…"
        style={{
          flex: 1, padding: '7px 12px', borderRadius: 7,
          background: 'var(--card)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 12, outline: 'none',
        }}
      />
      <select
        value={statusFilter}
        onChange={e => onStatus(e.target.value)}
        style={{
          padding: '7px 10px', borderRadius: 7,
          background: 'var(--card)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: 12, outline: 'none', cursor: 'pointer',
        }}
      >
        {statuses.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
      </select>
    </div>
  );
}

// ── Obligation Row ────────────────────────────────────────────────────────────
function ObligationRow({ ob }: { ob: ComplianceObligation }) {
  const sc = statusColor(ob.status);
  const sbg = statusBg(ob.status);
  const fwColor = frameworkColor(ob.framework);
  const days = daysUntil(ob.dueDate);
  const overdue = days < 0;

  return (
    <div style={{
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      display: 'grid',
      gridTemplateColumns: '90px 1fr 120px 90px 100px 80px',
      gap: 12, alignItems: 'center',
    }}>
      {/* Reference */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, display: 'inline-block',
          background: `color-mix(in srgb, ${fwColor} 12%, transparent)`,
          border: `1px solid color-mix(in srgb, ${fwColor} 30%, transparent)`,
          color: fwColor, marginBottom: 3,
        }}>{ob.framework}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{ob.reference}</div>
      </div>

      {/* Title + description */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
          {ob.title}
          <span style={{
            marginLeft: 6, fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
            color: priorityColor(ob.priority),
            background: `color-mix(in srgb, ${priorityColor(ob.priority)} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${priorityColor(ob.priority)} 25%, transparent)`,
            textTransform: 'uppercase' as const,
          }}>{ob.priority}</span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>{ob.description}</div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 3 }}>
          {ob.category} · {ob.linkedControls} controls · {ob.evidenceCount} evidence items
        </div>
      </div>

      {/* Status */}
      <div>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 4,
          background: sbg, color: sc, border: `1px solid color-mix(in srgb, ${sc} 30%, transparent)`,
        }}>{statusLabel(ob.status)}</span>
      </div>

      {/* Owner */}
      <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{ob.owner}</div>

      {/* Due date */}
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: overdue ? 'var(--critical)' : days <= 30 ? 'var(--high)' : 'var(--text-2)',
        }}>
          {new Date(ob.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <div style={{ fontSize: 9, color: overdue ? 'var(--critical)' : 'var(--text-muted)' }}>
          {overdue ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
        </div>
      </div>

      {/* Last reviewed */}
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
        {new Date(ob.lastReviewed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export default function ComplianceRegisterView() {
  const { filtered, framework, setFramework, statusFilter, setStatusFilter, search, setSearch, stats } = useComplianceRegister();

  return (
    <div style={{ padding: '22px 24px', minHeight: '100%' }}>
      <RegisterBanner stats={stats} framework={framework} />
      <FrameworkTabs active={framework} onChange={setFramework} />
      <FiltersRow statusFilter={statusFilter} onStatus={setStatusFilter} search={search} onSearch={setSearch} />

      {/* Table */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 9, overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 120px 90px 100px 80px',
          padding: '8px 16px', gap: 12,
          borderBottom: '1px solid var(--border)',
          fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.04em',
          background: 'rgba(0,0,0,0.1)',
        }}>
          <span>Framework</span>
          <span>Obligation</span>
          <span>Status</span>
          <span>Owner</span>
          <span>Due Date</span>
          <span>Last Review</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            No obligations match the current filters.
          </div>
        ) : (
          filtered.map(ob => <ObligationRow key={ob.id} ob={ob} />)
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
        Showing {filtered.length} of {stats.total} obligations
      </div>
    </div>
  );
}
