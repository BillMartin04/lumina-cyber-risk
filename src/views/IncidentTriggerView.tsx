import { useState, useEffect, useCallback } from 'react';
import {
  Siren, AlertTriangle, CheckCircle2, Clock, ChevronDown,
  ChevronRight, RefreshCw, TrendingUp, BookOpen, User, Calendar,
} from 'lucide-react';
import type { IncidentTrigger, IncidentTriggerStatus, IncidentTriggerSeverity, IncidentTriggerStats } from '../models';
import { IncidentTriggerService } from '../services/IncidentTriggerService';

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_META: Record<IncidentTriggerStatus, { label: string; color: string; icon: React.ElementType }> = {
  active:       { label: 'Active',       color: '#FF5252', icon: Siren },
  acknowledged: { label: 'Acknowledged', color: '#FFD600', icon: Clock },
  resolved:     { label: 'Resolved',     color: '#00E676', icon: CheckCircle2 },
};

const SEVERITY_COLOR: Record<IncidentTriggerSeverity, string> = {
  critical: '#FF5252',
  high:     '#FF8C00',
  medium:   '#FFD600',
  low:      '#4FC3F7',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Action Modal ──────────────────────────────────────────────────────────

interface ActionModalProps {
  trigger:   IncidentTrigger;
  mode:      'acknowledge' | 'resolve';
  onConfirm: (actor: string) => void;
  onCancel:  () => void;
  loading:   boolean;
  error:     string | null;
}

function ActionModal({ trigger, mode, onConfirm, onCancel, loading, error }: ActionModalProps) {
  const [actor, setActor] = useState('Sarah Chen (CISO)');
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>
          {mode === 'acknowledge' ? 'Acknowledge Trigger' : 'Resolve Trigger'}
        </h3>
        <p style={styles.modalDesc}>{trigger.kriName} — {trigger.domainName}</p>
        <label style={styles.fieldLabel}>Actor *</label>
        <input
          style={styles.input}
          value={actor}
          onChange={e => setActor(e.target.value)}
          placeholder="Name (Role)"
          required
        />
        {error && <p style={styles.errorText}>{error}</p>}
        <div style={styles.modalActions}>
          <button style={styles.cancelBtn} onClick={onCancel} disabled={loading}>Cancel</button>
          <button
            style={{ ...styles.confirmBtn, background: mode === 'acknowledge' ? '#FFD600' : '#00E676', color: '#0a0f1e' }}
            onClick={() => onConfirm(actor)}
            disabled={loading || !actor.trim()}
          >
            {loading ? 'Saving…' : mode === 'acknowledge' ? 'Acknowledge' : 'Resolve'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Trigger Card ──────────────────────────────────────────────────────────

interface TriggerCardProps {
  trigger:     IncidentTrigger;
  onAction:    (trigger: IncidentTrigger, mode: 'acknowledge' | 'resolve') => void;
}

function TriggerCard({ trigger, onAction }: TriggerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = STATUS_META[trigger.status];
  const StatusIcon = statusMeta.icon;
  const sevColor   = SEVERITY_COLOR[trigger.severity];
  const breach     = trigger.currentValue - trigger.threshold;

  return (
    <div style={{ ...styles.card, borderLeft: `3px solid ${sevColor}` }}>
      {/* Header */}
      <button style={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div style={styles.cardLeft}>
          {expanded
            ? <ChevronDown size={14} color="var(--text-muted)" />
            : <ChevronRight size={14} color="var(--text-muted)" />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.cardTitle}>{trigger.kriName}</div>
            <div style={styles.cardMeta}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{trigger.domainName}</span>
              <span style={{ fontSize: 11, color: sevColor, fontWeight: 600 }}>
                {trigger.currentValue} {trigger.unit} (threshold: {trigger.threshold})
              </span>
            </div>
          </div>
        </div>
        <div style={styles.cardRight}>
          <span style={{ ...styles.badge, color: sevColor, borderColor: `${sevColor}60` }}>
            {trigger.severity.toUpperCase()}
          </span>
          <span style={{ ...styles.badge, color: statusMeta.color, borderColor: `${statusMeta.color}60` }}>
            <StatusIcon size={10} />
            {statusMeta.label}
          </span>
          <span style={{ ...styles.badge, color: '#4FC3F7', borderColor: '#4FC3F760' }}>
            <BookOpen size={10} />
            {trigger.linkedPlaybookName}
          </span>
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={styles.cardBody}>
          {/* KRI breach bar */}
          <div style={styles.breachSection}>
            <div style={styles.breachLabel}>
              <TrendingUp size={12} color={sevColor} />
              <span style={{ color: sevColor, fontWeight: 600 }}>KRI Breach</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                +{breach} {trigger.unit} over threshold
              </span>
            </div>
            <div style={styles.breachTrack}>
              <div style={{ ...styles.breachThreshold, left: `${Math.min((trigger.threshold / trigger.currentValue) * 100, 95)}%` }} />
              <div style={{ ...styles.breachFill, width: '100%', background: `${sevColor}30` }} />
              <div style={{ ...styles.breachFill, width: `${(trigger.threshold / trigger.currentValue) * 100}%`, background: '#00E676' }} />
            </div>
            <div style={styles.breachValues}>
              <span style={{ color: '#00E676', fontSize: 10 }}>Threshold: {trigger.threshold}</span>
              <span style={{ color: sevColor, fontSize: 10, fontWeight: 700 }}>Current: {trigger.currentValue}</span>
            </div>
          </div>

          {/* Trigger note */}
          <p style={styles.note}>{trigger.triggerNote}</p>

          {/* Linked playbook */}
          <div style={styles.playbookBox}>
            <BookOpen size={13} color="#4FC3F7" />
            <div>
              <div style={{ fontSize: 10, color: '#4FC3F7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Linked Resilience Playbook
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{trigger.linkedPlaybookName}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ID: {trigger.linkedPlaybookId} — navigate to Resilience module to view full playbook</div>
            </div>
          </div>

          {/* Timeline */}
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <AlertTriangle size={11} color={sevColor} />
              <span style={styles.metaLabel}>Triggered</span>
              <span style={styles.metaValue}>{fmtDateTime(trigger.breachedAt)}</span>
            </div>
            {trigger.acknowledgedBy && (
              <div style={styles.metaItem}>
                <User size={11} color="#FFD600" />
                <span style={styles.metaLabel}>Acknowledged by</span>
                <span style={styles.metaValue}>{trigger.acknowledgedBy} · {fmtDateTime(trigger.acknowledgedAt!)}</span>
              </div>
            )}
            {trigger.resolvedBy && (
              <div style={styles.metaItem}>
                <CheckCircle2 size={11} color="#00E676" />
                <span style={styles.metaLabel}>Resolved by</span>
                <span style={styles.metaValue}>{trigger.resolvedBy} · {fmtDateTime(trigger.resolvedAt!)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={styles.actionRow}>
            {trigger.status === 'active' && (
              <button style={styles.ackBtn} onClick={() => onAction(trigger, 'acknowledge')}>
                Acknowledge
              </button>
            )}
            {trigger.status !== 'resolved' && (
              <button style={styles.resolveBtn} onClick={() => onAction(trigger, 'resolve')}>
                Mark Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────

function StatChip({ label, count, color, active, onClick }: {
  label: string; count: number; color: string; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      ...styles.statChip,
      borderColor: active ? color : 'var(--border)',
      color: active ? color : 'var(--text-muted)',
      background: active ? `${color}18` : 'transparent',
    }}>
      <span style={{ ...styles.statCount, color: active ? color : 'var(--text)' }}>{count}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | IncidentTriggerStatus;

export default function IncidentTriggerView() {
  const [triggers, setTriggers] = useState<IncidentTrigger[]>([]);
  const [stats,    setStats]    = useState<IncidentTriggerStats | null>(null);
  const [filter,   setFilter]   = useState<StatusFilter>('all');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [modal,    setModal]    = useState<{ trigger: IncidentTrigger; mode: 'acknowledge' | 'resolve' } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError,   setModalError]   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await IncidentTriggerService.getAll();
      setTriggers(data.triggers);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load incident triggers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filter === 'all' ? triggers : triggers.filter(t => t.status === filter);

  async function handleModalConfirm(actor: string) {
    if (!modal) return;
    setModalLoading(true);
    setModalError(null);
    try {
      const updated = modal.mode === 'acknowledge'
        ? await IncidentTriggerService.acknowledge(modal.trigger.id, actor)
        : await IncidentTriggerService.resolve(modal.trigger.id, actor);
      setTriggers(prev => prev.map(t => t.id === updated.id ? updated : t));
      const data = await IncidentTriggerService.getAll();
      setStats(data.stats);
      setModal(null);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Siren size={18} color="var(--cyan)" />
          <div>
            <h1 style={styles.title}>Incident Triggers</h1>
            <p style={styles.subtitle}>KRI threshold breaches linked to resilience playbooks</p>
          </div>
        </div>
        <button style={styles.refreshBtn} onClick={loadData} disabled={loading}>
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsBar}>
          <StatChip label="All"          count={stats.total}        color="var(--cyan)"  active={filter === 'all'}          onClick={() => setFilter('all')} />
          <StatChip label="Active"       count={stats.active}       color="#FF5252"      active={filter === 'active'}       onClick={() => setFilter('active')} />
          <StatChip label="Acknowledged" count={stats.acknowledged} color="#FFD600"      active={filter === 'acknowledged'} onClick={() => setFilter('acknowledged')} />
          <StatChip label="Resolved"     count={stats.resolved}     color="#00E676"      active={filter === 'resolved'}     onClick={() => setFilter('resolved')} />
          {stats.critical > 0 && (
            <span style={styles.criticalAlert}>
              <AlertTriangle size={12} /> {stats.critical} critical
            </span>
          )}
        </div>
      )}

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading && !triggers.length && (
        <div style={styles.loadingBox}>
          <RefreshCw size={20} color="var(--cyan)" />
          <span>Loading triggers…</span>
        </div>
      )}

      {!loading && !error && (
        <div style={styles.list}>
          {filtered.length === 0
            ? <div style={styles.emptyState}>No triggers match the selected filter.</div>
            : filtered
                .sort((a, b) => {
                  const order: Record<IncidentTriggerStatus, number> = { active: 0, acknowledged: 1, resolved: 2 };
                  return order[a.status] - order[b.status] || new Date(b.breachedAt).getTime() - new Date(a.breachedAt).getTime();
                })
                .map(t => (
                  <TriggerCard key={t.id} trigger={t} onAction={(tr, mode) => { setModalError(null); setModal({ trigger: tr, mode }); }} />
                ))
          }
        </div>
      )}

      {modal && (
        <ActionModal
          trigger={modal.trigger}
          mode={modal.mode}
          onConfirm={handleModalConfirm}
          onCancel={() => { setModal(null); setModalError(null); }}
          loading={modalLoading}
          error={modalError}
        />
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page:        { padding: '24px', maxWidth: 900, margin: '0 auto' },
  header:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 },
  headerLeft:  { display: 'flex', alignItems: 'flex-start', gap: 10 },
  title:       { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  subtitle:    { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  refreshBtn:  { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' },
  statsBar:    { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'center' },
  statChip:    { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid', borderRadius: 20, fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' },
  statCount:   { fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums' },
  criticalAlert: { display: 'flex', alignItems: 'center', gap: 4, color: '#FF5252', fontSize: 11, fontWeight: 600, padding: '5px 10px', background: '#FF525218', borderRadius: 20, border: '1px solid #FF5252' },
  list:        { display: 'flex', flexDirection: 'column', gap: 8 },
  card:        { background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' },
  cardHeader:  { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'transparent', border: 'none', cursor: 'pointer', gap: 12 },
  cardLeft:    { display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0, textAlign: 'left' as const },
  cardTitle:   { fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 },
  cardMeta:    { display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 },
  cardRight:   { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' as const },
  badge:       { display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, border: '1px solid', whiteSpace: 'nowrap' as const },
  cardBody:    { padding: '0 14px 14px', borderTop: '1px solid var(--border)' },
  breachSection: { margin: '14px 0 12px' },
  breachLabel: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 12 },
  breachTrack: { position: 'relative' as const, height: 8, borderRadius: 4, overflow: 'hidden', background: 'var(--border)' },
  breachFill:  { position: 'absolute' as const, left: 0, top: 0, height: '100%', borderRadius: 4 },
  breachThreshold: { position: 'absolute' as const, top: -2, width: 2, height: 12, background: '#fff', zIndex: 1 },
  breachValues:{ display: 'flex', justifyContent: 'space-between', marginTop: 4 },
  note:        { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px' },
  playbookBox: { display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#4FC3F710', border: '1px solid #4FC3F730', borderRadius: 6, marginBottom: 12 },
  metaRow:     { display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 14 },
  metaItem:    { display: 'flex', alignItems: 'center', gap: 6 },
  metaLabel:   { fontSize: 11, color: 'var(--text-muted)', minWidth: 80 },
  metaValue:   { fontSize: 11, color: 'var(--text)', fontWeight: 500 },
  actionRow:   { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  ackBtn:      { padding: '7px 16px', background: 'rgba(255,214,0,0.12)', border: '1px solid rgba(255,214,0,0.4)', borderRadius: 6, color: '#FFD600', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  resolveBtn:  { padding: '7px 16px', background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 6, color: '#00E676', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  errorBox:    { padding: '12px 16px', background: '#FF525218', border: '1px solid #FF5252', borderRadius: 8, color: '#FF5252', fontSize: 13, marginBottom: 16 },
  loadingBox:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40, color: 'var(--text-muted)', fontSize: 13 },
  emptyState:  { padding: 40, textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: 13 },
  overlay:     { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, width: 420, maxWidth: '90vw' },
  modalTitle:  { fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 },
  modalDesc:   { fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 },
  fieldLabel:  { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 },
  input:       { width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, boxSizing: 'border-box' as const },
  errorText:   { fontSize: 12, color: '#FF5252', margin: '8px 0' },
  modalActions:{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  cancelBtn:   { padding: '7px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' },
  confirmBtn:  { padding: '7px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};
