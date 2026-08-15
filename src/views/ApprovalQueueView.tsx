import { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, PlayCircle, Clock, Filter,
  AlertTriangle, ChevronRight, RotateCcw, Layers, Calendar, ShieldCheck,
} from 'lucide-react';
import type { AIApprovalItem } from '../models';
import { useAIAssist } from '../context/AIAssistContext';

// ─── Types ─────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | AIApprovalItem['status'];
type TierFilter   = 'all' | AIApprovalItem['tier'];

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_META: Record<AIApprovalItem['status'], { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: 'Pending',  color: '#FFD600', icon: Clock },
  approved: { label: 'Approved', color: '#00E676', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: '#FF5252', icon: XCircle },
  executed: { label: 'Executed', color: '#00D4FF', icon: PlayCircle },
};

const TIER_META: Record<AIApprovalItem['tier'], { label: string; color: string; description: string }> = {
  analyst:      { label: 'Analyst',      color: '#4FC3F7', description: 'Read-only analysis and reporting. No system state changes.' },
  executor:     { label: 'Executor',     color: '#CE93D8', description: 'Controlled state mutations with defined rollback. Reversible.' },
  orchestrator: { label: 'Orchestrator', color: '#FF8C00', description: 'Cross-system coordination and escalation. High impact — requires senior approval.' },
};

const RISK_COLOR: Record<AIApprovalItem['risk_level'], string> = {
  low:      '#00E676',
  medium:   '#FFD600',
  high:     '#FF8C00',
  critical: '#FF5252',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function elapsed(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return `${Math.floor(h / 24)}d ago`;
  if (h > 0)  return `${h}h ${m}m ago`;
  return `${m}m ago`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

function expiryState(dateStr: string): 'expired' | 'soon' | 'ok' {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'expired';
  if (diff < 14 * 24 * 3_600_000) return 'soon';
  return 'ok';
}

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const state = expiryState(dateStr);
  const color = state === 'expired' ? '#FF5252' : state === 'soon' ? '#FFD600' : '#00E676';
  const label = state === 'expired' ? 'EXPIRED' : state === 'soon' ? 'EXPIRING SOON' : 'Expires';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: `${color}15`, color, border: `1px solid ${color}40`,
      borderRadius: 4, padding: '1px 7px', fontSize: 9, fontWeight: 700,
    }}>
      <Calendar size={9} />
      {label} {fmtDate(dateStr)}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({
  label, count, color, icon: Icon, active, onClick,
}: { label: string; count: number; color: string; icon: React.ElementType; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 120px', minWidth: 120,
        background: active ? `${color}15` : 'var(--surface)',
        border: `1px solid ${active ? color : 'var(--border)'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8, padding: '14px 18px',
        cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <Icon size={13} color={color} />
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{count}</div>
    </button>
  );
}

// ─── Tier Badge ────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: AIApprovalItem['tier'] }) {
  const m = TIER_META[tier];
  return (
    <span
      title={m.description}
      style={{
        background: `${m.color}15`, color: m.color,
        border: `1px solid ${m.color}40`,
        borderRadius: 4, padding: '2px 8px',
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
        cursor: 'help',
      }}
    >
      {m.label}
    </span>
  );
}

// ─── Reject Modal ──────────────────────────────────────────────────────────

function RejectModal({
  item, onConfirm, onCancel,
}: { item: AIApprovalItem; onConfirm: (reason: string) => void; onCancel: () => void }) {
  const [reason, setReason] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 28, width: 480, maxWidth: '90vw',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <XCircle size={18} color="#FF5252" />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Reject Action</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text)' }}>{item.proposed_action}</strong> — {item.description}
        </div>
        <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
          Reason for rejection <span style={{ color: '#FF5252' }}>*</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Explain why this action is being rejected and what corrective steps are needed…"
          autoFocus
          style={{
            width: '100%', minHeight: 90, resize: 'vertical',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '10px 12px',
            color: 'var(--text)', fontSize: 12, lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'var(--bg)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >Cancel</button>
          <button
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
            style={{
              padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: reason.trim() ? '#FF5252' : '#333',
              border: 'none', color: '#fff',
              cursor: reason.trim() ? 'pointer' : 'not-allowed',
              opacity: reason.trim() ? 1 : 0.5,
            }}
          >Reject Action</button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Card ───────────────────────────────────────────────────────────

function ActionCard({
  item, onApprove, onReject, onExecute,
}: {
  item: AIApprovalItem;
  onApprove: (id: string) => void;
  onReject:  (item: AIApprovalItem) => void;
  onExecute: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const sm = STATUS_META[item.status];
  const riskColor = RISK_COLOR[item.risk_level];
  const StatusIcon = sm.icon;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${item.status === 'pending' ? `${riskColor}40` : 'var(--border)'}`,
      borderLeft: `3px solid ${item.status === 'pending' ? riskColor : sm.color}`,
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div
        style={{ padding: '16px 18px', cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Status icon */}
          <StatusIcon size={16} color={sm.color} style={{ marginTop: 2, flexShrink: 0 }} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Top row: action name + badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'monospace' }}>
                {item.proposed_action}
              </span>
              <TierBadge tier={item.tier} />
              <span style={{
                background: `${riskColor}15`, color: riskColor,
                border: `1px solid ${riskColor}40`,
                borderRadius: 4, padding: '1px 7px', fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              }}>
                {item.risk_level}
              </span>
              <span style={{
                background: `${sm.color}15`, color: sm.color,
                border: `1px solid ${sm.color}40`,
                borderRadius: 4, padding: '1px 7px', fontSize: 9, fontWeight: 700,
              }}>
                {sm.label}
              </span>
              {item.expiry_date && <ExpiryBadge dateStr={item.expiry_date} />}
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 6 }}>
              {item.description}
            </div>

            {/* Impact */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)',
              borderRadius: 4, padding: '3px 10px', fontSize: 11, color: '#FF8C00',
            }}>
              <AlertTriangle size={10} />
              <span>{item.impact}</span>
            </div>
          </div>

          {/* Time + expand */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{elapsed(item.created_at)}</div>
            <ChevronRight
              size={14} color="var(--text-muted)"
              style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', marginTop: 4 }}
            />
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 18px',
          background: 'var(--bg)',
        }}>
          {/* Context */}
          {Object.keys(item.context).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Context</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.entries(item.context).map(([k, v]) => (
                  <span key={k} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '3px 8px', fontSize: 11,
                    color: 'var(--text-muted)',
                  }}>
                    <span style={{ color: 'var(--text)', fontWeight: 600 }}>{k}:</span> {String(v)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Created</div>
              <div style={{ fontSize: 11, color: 'var(--text)' }}>{fmtTime(item.created_at)}</div>
            </div>
            {item.resolved_at && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Resolved</div>
                <div style={{ fontSize: 11, color: 'var(--text)' }}>{fmtTime(item.resolved_at)}</div>
              </div>
            )}
            {item.resolved_by && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Resolved By</div>
                <div style={{ fontSize: 11, color: 'var(--text)' }}>{item.resolved_by}</div>
              </div>
            )}
          </div>

          {/* Result / reason */}
          {item.result && (
            <div style={{
              background: `${item.status === 'rejected' ? '#FF5252' : '#00D4FF'}10`,
              border: `1px solid ${item.status === 'rejected' ? '#FF5252' : '#00D4FF'}25`,
              borderRadius: 6, padding: '10px 12px',
              fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
              marginBottom: 14,
            }}>
              <strong style={{ color: 'var(--text)' }}>
                {item.status === 'rejected' ? 'Rejection Reason' : 'Execution Result'}:
              </strong>{' '}{item.result}
            </div>
          )}

          {/* Compensating Control */}
          {item.compensating_control && (
            <div style={{
              background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)',
              borderRadius: 6, padding: '10px 12px', marginBottom: 14,
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <ShieldCheck size={13} color="#00E676" style={{ marginTop: 1, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: '#00E676', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  Compensating Control
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {item.compensating_control}
                </div>
              </div>
            </div>
          )}

          {/* Tier explanation */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14,
            fontSize: 11, color: 'var(--text-muted)',
          }}>
            <Layers size={11} color="var(--text-muted)" />
            <span><strong style={{ color: TIER_META[item.tier].color }}>{TIER_META[item.tier].label} tier:</strong> {TIER_META[item.tier].description}</span>
          </div>

          {/* Action buttons */}
          {item.status === 'pending' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => onApprove(item.id)}
                style={{
                  padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.4)',
                  color: '#00E676', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <CheckCircle2 size={13} />Approve
              </button>
              <button
                onClick={() => onReject(item)}
                style={{
                  padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: 'rgba(255,82,82,0.12)', border: '1px solid rgba(255,82,82,0.35)',
                  color: '#FF5252', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <XCircle size={13} />Reject
              </button>
            </div>
          )}

          {item.status === 'approved' && (
            <button
              onClick={() => onExecute(item.id)}
              style={{
                padding: '8px 20px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.35)',
                color: 'var(--cyan)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <PlayCircle size={13} />Execute Action
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

export default function ApprovalQueueView() {
  const { approvalQueue, approve, reject, execute, resetToPending, refreshQueue } = useAIAssist();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [tierFilter,   setTierFilter]   = useState<TierFilter>('all');
  const [rejectTarget, setRejectTarget] = useState<AIApprovalItem | null>(null);
  const [loading,      setLoading]      = useState(false);

  // Initial load
  useEffect(() => {
    setLoading(true);
    refreshQueue().finally(() => setLoading(false));
  }, [refreshQueue]);

  const counts = {
    all:      approvalQueue.length,
    pending:  approvalQueue.filter(i => i.status === 'pending').length,
    approved: approvalQueue.filter(i => i.status === 'approved').length,
    rejected: approvalQueue.filter(i => i.status === 'rejected').length,
    executed: approvalQueue.filter(i => i.status === 'executed').length,
  };

  const filtered = approvalQueue
    .filter(i => statusFilter === 'all' || i.status === statusFilter)
    .filter(i => tierFilter === 'all'   || i.tier   === tierFilter)
    .sort((a, b) => {
      // Pending first, then by created_at desc
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleApprove = async (id: string) => {
    try { await approve(id); } catch { /* handled by context */ }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try { await reject(rejectTarget.id, reason); } catch { /* handled by context */ }
    setRejectTarget(null);
  };

  const handleExecute = async (id: string) => {
    try { await execute(id); } catch { /* handled by context */ }
  };

  const handleResetAllApproved = async () => {
    const approved = approvalQueue.filter(i => i.status === 'approved');
    await Promise.all(approved.map(i => resetToPending(i.id).catch(() => null)));
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CheckCircle2 size={20} color="var(--cyan)" strokeWidth={1.8} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Approval Queue</h1>
            {counts.pending > 0 && (
              <span style={{
                background: '#FF5252', color: '#fff',
                borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 700,
              }}>{counts.pending} pending</span>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 30 }}>
            Human-in-the-loop review for all agentic actions proposed by Lumina AI
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {counts.approved > 0 && (
            <button
              onClick={handleResetAllApproved}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: 'rgba(255,214,0,0.08)', border: '1px solid rgba(255,214,0,0.3)',
                color: '#FFD600', cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} />
              Reset Approved to Pending ({counts.approved})
            </button>
          )}
          <button
            onClick={() => { setLoading(true); refreshQueue().finally(() => setLoading(false)); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stat cards (clickable filters) */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Pending"  count={counts.pending}  color="#FFD600" icon={Clock}        active={statusFilter === 'pending'}  onClick={() => setStatusFilter(s => s === 'pending'  ? 'all' : 'pending')}  />
        <StatCard label="Approved" count={counts.approved} color="#00E676" icon={CheckCircle2} active={statusFilter === 'approved'} onClick={() => setStatusFilter(s => s === 'approved' ? 'all' : 'approved')} />
        <StatCard label="Rejected" count={counts.rejected} color="#FF5252" icon={XCircle}      active={statusFilter === 'rejected'} onClick={() => setStatusFilter(s => s === 'rejected' ? 'all' : 'rejected')} />
        <StatCard label="Executed" count={counts.executed} color="#00D4FF" icon={PlayCircle}   active={statusFilter === 'executed'} onClick={() => setStatusFilter(s => s === 'executed' ? 'all' : 'executed')} />
      </div>

      {/* Tier filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12 }}>
          <Filter size={13} /> <span>Tier:</span>
        </div>
        {(['all', 'analyst', 'executor', 'orchestrator'] as const).map(t => {
          const active = tierFilter === t;
          const color  = t === 'all' ? 'var(--text-muted)' : TIER_META[t].color;
          return (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${active ? color : 'var(--border)'}`,
                background: active ? `${color}15` : 'var(--bg)',
                color: active ? color : 'var(--text-muted)',
                textTransform: t === 'all' ? 'none' : 'capitalize',
              }}
            >
              {t === 'all' ? 'All Tiers' : TIER_META[t].label}
            </button>
          );
        })}

        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          {filtered.length} of {approvalQueue.length} actions
        </div>
      </div>

      {/* Tier legend */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 20, padding: '10px 14px',
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
        flexWrap: 'wrap',
      }}>
        {(['analyst', 'executor', 'orchestrator'] as const).map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_META[t].color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              <strong style={{ color: TIER_META[t].color }}>{TIER_META[t].label}:</strong> {TIER_META[t].description}
            </span>
          </div>
        ))}
      </div>

      {/* Action list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 13 }}>
          Loading queue…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          color: 'var(--text-muted)', fontSize: 13,
        }}>
          No actions match the current filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <ActionCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={setRejectTarget}
              onExecute={handleExecute}
            />
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          item={rejectTarget}
          onConfirm={handleReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
