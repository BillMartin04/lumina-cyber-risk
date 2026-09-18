import { useOversight } from '../controllers/useOversight';
import type { RegulatoryFramework, DomainOversightRow } from '../controllers/useOversight';
import type { KRIWithDomain, RiskActionItem } from '../models';

function scoreColor(score: number) {
  if (score >= 70) return 'var(--high)';
  if (score >= 50) return 'var(--medium)';
  return 'var(--low)';
}

function frameworkStatusColor(status: RegulatoryFramework['status']) {
  if (status === 'breach')   return 'var(--critical)';
  if (status === 'at-risk')  return 'var(--high)';
  return 'var(--low)';
}

function frameworkStatusBg(status: RegulatoryFramework['status']) {
  if (status === 'breach')   return 'var(--critical-10)';
  if (status === 'at-risk')  return 'var(--high-10)';
  return 'var(--low-10)';
}

function sevColor(s: string) {
  if (s === 'critical') return 'var(--critical)';
  if (s === 'high')     return 'var(--high)';
  if (s === 'medium')   return 'var(--medium)';
  return 'var(--low)';
}

// ── Oversight Banner ────────────────────────────────────────────────────────
function OversightBanner({ score, stats, kriBreaches, frameworkBreaches }: {
  score: number;
  stats: ReturnType<typeof useOversight>['stats'];
  kriBreaches: number;
  frameworkBreaches: number;
}) {
  const circumference = 2 * Math.PI * 30;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '18px 24px',
      display: 'flex', alignItems: 'center', gap: 28, marginBottom: 20,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #a855f7, var(--cyan), transparent)',
      }} />

      {/* Score ring */}
      <div style={{ width: 72, height: 72, position: 'relative', flexShrink: 0 }}>
        <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: 'monospace', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase' }}>/100</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>
          2nd Line Oversight — <span style={{ color }}>Risk Posture Summary</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Aggregated across {stats.totalRisks} risks · {stats.totalControls} controls · 10 regulatory frameworks
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', color: '#a855f7',
          }}>2ND LINE VIEW</span>
          {frameworkBreaches > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 4,
              background: 'var(--critical-10)', border: '1px solid rgba(255,51,51,0.3)', color: 'var(--critical)',
            }}>⚠ {frameworkBreaches} FRAMEWORK BREACH{frameworkBreaches > 1 ? 'ES' : ''}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 8, overflow: 'hidden' }}>
        {[
          { val: stats.totalRisks,         lbl: 'Total Risks',    color: 'var(--text)' },
          { val: stats.critical,            lbl: 'Critical',       color: 'var(--critical)' },
          { val: stats.high,                lbl: 'High',           color: 'var(--high)' },
          { val: stats.openIssues,          lbl: 'Open Issues',    color: 'var(--text)' },
          { val: stats.overdueIssues,       lbl: 'Overdue',        color: 'var(--critical)' },
          { val: kriBreaches,               lbl: 'KRI Breaches',   color: 'var(--high)' },
        ].map(({ val, lbl, color: c }) => (
          <div key={lbl} style={{
            padding: '12px 16px', background: 'rgba(0,0,0,0.15)',
            display: 'flex', flexDirection: 'column', gap: 3, minWidth: 72,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: c, lineHeight: 1 }}>{val}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Domain Heat Matrix ───────────────────────────────────────────────────────
function DomainMatrix({ rows }: { rows: DomainOversightRow[] }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 9, overflow: 'hidden', marginBottom: 16,
    }}>
      <div style={{
        padding: '11px 16px', borderBottom: '1px solid var(--border)',
        fontSize: 12, fontWeight: 700, color: 'var(--text)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Domain Risk Matrix</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>Aggregated first-line data</span>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 60px 32px 32px 32px 32px 72px 60px 60px',
        padding: '6px 16px', borderBottom: '1px solid var(--border)',
        fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em', gap: 4,
      }}>
        <span>Domain</span>
        <span style={{ textAlign: 'center' }}>Score</span>
        <span style={{ textAlign: 'center', color: 'var(--critical)' }}>C</span>
        <span style={{ textAlign: 'center', color: 'var(--high)' }}>H</span>
        <span style={{ textAlign: 'center', color: 'var(--medium)' }}>M</span>
        <span style={{ textAlign: 'center', color: 'var(--low)' }}>L</span>
        <span style={{ textAlign: 'center' }}>Controls</span>
        <span style={{ textAlign: 'center' }}>KRI ⚡</span>
        <span style={{ textAlign: 'center' }}>Issues</span>
      </div>

      {rows.map((row, i) => {
        const color = scoreColor(row.score);
        const controlColor = row.controlPct >= 80 ? 'var(--low)' : row.controlPct >= 60 ? 'var(--medium)' : 'var(--high)';
        return (
          <div key={row.domain.id} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 60px 32px 32px 32px 32px 72px 60px 60px',
            padding: '9px 16px', gap: 4, alignItems: 'center',
            borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none',
            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.domain.color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{row.domain.name}</span>
            </div>
            <span style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: 'monospace', color }}>{row.score}</span>
            <span style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--critical)' }}>{row.critical || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--high)' }}>{row.high || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--medium)' }}>{row.medium || '—'}</span>
            <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--low)' }}>{row.low || '—'}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                <span>{row.controlPct}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${row.controlPct}%`, background: controlColor, borderRadius: 2 }} />
              </div>
            </div>
            <span style={{
              textAlign: 'center', fontSize: 12, fontWeight: 700,
              color: row.kriBreaches > 0 ? 'var(--critical)' : 'var(--text-muted)',
            }}>{row.kriBreaches > 0 ? row.kriBreaches : '—'}</span>
            <span style={{
              textAlign: 'center', fontSize: 12,
              color: row.openIssues > 0 ? 'var(--high)' : 'var(--text-muted)',
            }}>{row.openIssues > 0 ? row.openIssues : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Control Assurance Panel ──────────────────────────────────────────────────
function ControlAssurance({ breakdown }: { breakdown: ReturnType<typeof useOversight>['controlBreakdown'] }) {
  const { total, implemented, partial, notImplemented } = breakdown;
  const implementedPct  = total > 0 ? Math.round((implemented  / total) * 100) : 0;
  const partialPct      = total > 0 ? Math.round((partial      / total) * 100) : 0;
  const notImplPct      = total > 0 ? Math.round((notImplemented / total) * 100) : 0;

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 9, overflow: 'hidden',
    }}>
      <div style={{
        padding: '11px 16px', borderBottom: '1px solid var(--border)',
        fontSize: 12, fontWeight: 700, color: 'var(--text)',
      }}>Control Assurance</div>

      <div style={{ padding: '14px 16px' }}>
        {/* Stacked bar */}
        <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', marginBottom: 12 }}>
          <div style={{ width: `${implementedPct}%`, background: 'var(--low)' }} />
          <div style={{ width: `${partialPct}%`,     background: 'var(--medium)' }} />
          <div style={{ width: `${notImplPct}%`,     background: 'var(--critical)' }} />
        </div>

        {[
          { label: 'Implemented',     count: implemented,    pct: implementedPct,  color: 'var(--low)' },
          { label: 'Partial',         count: partial,        pct: partialPct,      color: 'var(--medium)' },
          { label: 'Not Implemented', count: notImplemented, pct: notImplPct,      color: 'var(--critical)' },
        ].map(({ label, count, pct, color }) => (
          <div key={label} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{label}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, fontFamily: 'monospace' }}>
              <span style={{ fontSize: 11, color }}>{pct}%</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count}</span>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Total Controls</div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text)' }}>{total}</div>
        </div>
      </div>
    </div>
  );
}

// ── Regulatory Framework Grid ────────────────────────────────────────────────
function FrameworkGrid({ frameworks }: { frameworks: RegulatoryFramework[] }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
        Regulatory Framework Coverage ({frameworks.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {frameworks.map(f => {
          const color = frameworkStatusColor(f.status);
          const bg    = frameworkStatusBg(f.status);
          return (
            <div key={f.id} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.3 }}>{f.fullName}</div>
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, flexShrink: 0,
                  background: bg, color, border: `1px solid ${color}33`,
                  textTransform: 'uppercase',
                }}>{f.status.replace('-', ' ')}</span>
              </div>

              {/* Coverage bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>Coverage</span><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-2)' }}>{f.coverage}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.coverage}%`, background: 'var(--cyan)', borderRadius: 2 }} />
                </div>
              </div>

              {/* Compliance bar */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>
                  <span>Compliant</span><span style={{ fontFamily: 'monospace', fontWeight: 700, color }}>{f.compliant}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${f.compliant}%`, background: color, borderRadius: 2 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)' }}>
                <span style={{ color: f.gaps > 0 ? 'var(--high)' : 'var(--text-muted)' }}>{f.gaps} gaps</span>
                <span>Review {f.nextReview}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── KRI Breach Panel ─────────────────────────────────────────────────────────
function KRIBreachPanel({ kris }: { kris: KRIWithDomain[] }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 9, overflow: 'hidden',
    }}>
      <div style={{
        padding: '11px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12, fontWeight: 700, color: 'var(--text)',
      }}>
        KRI Breaches
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
          background: 'var(--critical-10)', color: 'var(--critical)', border: '1px solid rgba(255,51,51,0.3)',
        }}>{kris.length}</span>
      </div>
      {kris.length === 0 && (
        <div style={{ padding: 16, fontSize: 11, color: 'var(--text-muted)' }}>No KRI breaches.</div>
      )}
      {kris.map(k => {
        const pct = Math.min((k.value / k.threshold) * 100, 100);
        return (
          <div key={k.id} style={{ padding: '9px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{k.name}</span>
              <div style={{ display: 'flex', gap: 5, fontFamily: 'monospace', fontSize: 11 }}>
                <span style={{ color: 'var(--critical)', fontWeight: 700 }}>{k.value}{k.unit}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ {k.threshold}{k.unit}</span>
              </div>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: 'var(--critical)', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{k.domainName}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Escalated Issues Panel ────────────────────────────────────────────────────
function EscalatedIssues({ issues }: { issues: RiskActionItem[] }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: 9, overflow: 'hidden',
    }}>
      <div style={{
        padding: '11px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 12, fontWeight: 700, color: 'var(--text)',
      }}>
        Issues Requiring 2nd Line Attention
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
          background: 'var(--high-10)', color: 'var(--high)', border: '1px solid rgba(255,119,48,0.3)',
        }}>{issues.length}</span>
      </div>
      {issues.length === 0 && (
        <div style={{ padding: 16, fontSize: 11, color: 'var(--text-muted)' }}>No escalated issues.</div>
      )}
      {issues.map(issue => (
        <div key={issue.id} style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-2)', flex: 1 }}>{issue.title}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, flexShrink: 0,
              color: sevColor(issue.severity),
              background: `color-mix(in srgb, ${sevColor(issue.severity)} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${sevColor(issue.severity)} 30%, transparent)`,
              textTransform: 'uppercase',
            }}>{issue.severity}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--text-muted)' }}>
            <span>{issue.domainName}</span>
            <span>·</span>
            <span>{issue.riskName}</span>
            {(issue.daysOverdue ?? 0) > 0 && (
              <span style={{ color: 'var(--critical)', fontWeight: 700 }}>⚠ {issue.daysOverdue}d overdue</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────────────────
export default function OversightDashboardView() {
  const { stats, domainRows, topKRIs, escalatedIssues, frameworks, controlBreakdown } = useOversight();
  const frameworkBreaches = frameworks.filter(f => f.status === 'breach').length;

  return (
    <div style={{ padding: '22px 24px', minHeight: '100%' }}>
      <OversightBanner
        score={stats.overallScore}
        stats={stats}
        kriBreaches={topKRIs.length}
        frameworkBreaches={frameworkBreaches}
      />

      {/* Domain matrix + right column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, marginBottom: 16 }}>
        <DomainMatrix rows={domainRows} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ControlAssurance breakdown={controlBreakdown} />
          <KRIBreachPanel kris={topKRIs} />
        </div>
      </div>

      {/* Regulatory frameworks */}
      <FrameworkGrid frameworks={frameworks} />

      {/* Escalated issues */}
      <EscalatedIssues issues={escalatedIssues} />
    </div>
  );
}
