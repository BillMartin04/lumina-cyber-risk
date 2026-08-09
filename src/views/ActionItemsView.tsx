import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList, ChevronDown, ChevronRight, AlertTriangle,
  Clock, UserCheck, PlayCircle, FileCheck, ShieldCheck, CheckCircle2,
  Calendar, Tag, User, FileText, RefreshCw,
} from 'lucide-react';
import type { ActionItem, ActionItemStatus, ActionItemStats, ActionItemPriority } from '../models';
import { ActionItemService } from '../services/ActionItemService';

// ─── Config ────────────────────────────────────────────────────────────────

const STATUS_META: Record<ActionItemStatus, { label: string; color: string; icon: React.ElementType }> = {
  'open':              { label: 'Open',              color: '#FF5252', icon: AlertTriangle },
  'assigned':          { label: 'Assigned',          color: '#FFD600', icon: UserCheck },
  'in-progress':       { label: 'In Progress',       color: '#FF8C00', icon: PlayCircle },
  'evidence-provided': { label: 'Evidence Provided', color: '#4FC3F7', icon: FileCheck },
  'verified':          { label: 'Verified',          color: '#CE93D8', icon: ShieldCheck },
  'closed':            { label: 'Closed',            color: '#00E676', icon: CheckCircle2 },
};

const PRIORITY_META: Record<ActionItemPriority, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#FF5252' },
  high:     { label: 'High',     color: '#FF8C00' },
  medium:   { label: 'Medium',   color: '#FFD600' },
  low:      { label: 'Low',      color: '#4FC3F7' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function isOverdue(item: ActionItem) {
  return !!item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'closed';
}

// ─── Modal ─────────────────────────────────────────────────────────────────

type TransitionAction =
  | { type: 'assign' }
  | { type: 'start-progress' }
  | { type: 'provide-evidence' }
  | { type: 'verify' }
  | { type: 'close' };

interface ModalState {
  itemId:  string;
  action:  TransitionAction;
}

interface TransitionModalProps {
  modal:    ModalState;
  onSubmit: (fields: { actor: string; note?: string; assignee?: string; evidenceId?: string }) => void;
  onCancel: () => void;
  loading:  boolean;
  error:    string | null;
}

function TransitionModal({ modal, onSubmit, onCancel, loading, error }: TransitionModalProps) {
  const [actor,      setActor]      = useState('Sarah Chen (CISO)');
  const [note,       setNote]       = useState('');
  const [assignee,   setAssignee]   = useState('');
  const [evidenceId, setEvidenceId] = useState('');

  const label: Record<TransitionAction['type'], string> = {
    'assign':           'Assign Item',
    'start-progress':   'Start Progress',
    'provide-evidence': 'Provide Evidence',
    'verify':           'Verify Evidence',
    'close':            'Close Item',
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ actor, note: note || undefined, assignee: assignee || undefined, evidenceId: evidenceId || undefined });
  }

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3 style={styles.modalTitle}>{label[modal.action.type]}</h3>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Actor *</label>
            <input
              style={styles.input}
              value={actor}
              onChange={e => setActor(e.target.value)}
              placeholder="Name (Role)"
              required
            />
          </div>

          {modal.action.type === 'assign' && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Assignee *</label>
              <input
                style={styles.input}
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                placeholder="Name (Role)"
                required
              />
            </div>
          )}

          {modal.action.type === 'provide-evidence' && (
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Evidence ID *</label>
              <input
                style={styles.input}
                value={evidenceId}
                onChange={e => setEvidenceId(e.target.value)}
                placeholder="e.g. EVD-2026-042"
                required
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.fieldLabel}>Note</label>
            <textarea
              style={{ ...styles.input, height: 72, resize: 'vertical' }}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note for audit trail..."
            />
          </div>

          {error && <p style={styles.errorText}>{error}</p>}

          <div style={styles.modalActions}>
            <button type="button" style={styles.cancelBtn} onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.confirmBtn} disabled={loading}>
              {loading ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Audit Log ─────────────────────────────────────────────────────────────

function AuditLog({ item }: { item: ActionItem }) {
  return (
    <div style={styles.auditLog}>
      <p style={styles.auditTitle}>Audit Trail</p>
      <div style={styles.auditEntries}>
        {item.auditLog.map((entry, idx) => {
          const meta = STATUS_META[entry.toStatus];
          const Icon = meta.icon;
          return (
            <div key={entry.id} style={styles.auditEntry}>
              <div style={{ ...styles.auditDot, background: meta.color }}>
                <Icon size={10} color="#0a0f1e" />
              </div>
              {idx < item.auditLog.length - 1 && <div style={styles.auditLine} />}
              <div style={styles.auditContent}>
                <div style={styles.auditHeader}>
                  <span style={{ ...styles.auditStatus, color: meta.color }}>{meta.label}</span>
                  <span style={styles.auditActor}>{entry.actor}</span>
                  <span style={styles.auditTime}>{fmtDateTime(entry.timestamp)}</span>
                </div>
                {entry.note && <p style={styles.auditNote}>{entry.note}</p>}
                {entry.evidenceId && (
                  <span style={styles.evidenceBadge}>Evidence: {entry.evidenceId}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Action Item Card ──────────────────────────────────────────────────────

interface ActionCardProps {
  item:         ActionItem;
  onTransition: (itemId: string, action: TransitionAction) => void;
}

function ActionCard({ item, onTransition }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta   = STATUS_META[item.status];
  const priorityMeta = PRIORITY_META[item.priority];
  const StatusIcon   = statusMeta.icon;
  const overdue      = isOverdue(item);

  const nextAction: { label: string; action: TransitionAction } | null = (() => {
    switch (item.status) {
      case 'open':              return { label: 'Assign',           action: { type: 'assign' } };
      case 'assigned':          return { label: 'Start Progress',   action: { type: 'start-progress' } };
      case 'in-progress':       return { label: 'Provide Evidence', action: { type: 'provide-evidence' } };
      case 'evidence-provided': return { label: 'Verify',          action: { type: 'verify' } };
      case 'verified':          return { label: 'Close',           action: { type: 'close' } };
      default:                  return null;
    }
  })();

  return (
    <div style={{
      ...styles.card,
      borderLeft: `3px solid ${priorityMeta.color}`,
      opacity: item.status === 'closed' ? 0.7 : 1,
    }}>
      {/* Card Header */}
      <button style={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div style={styles.cardLeft}>
          {expanded
            ? <ChevronDown size={14} color="var(--text-muted)" />
            : <ChevronRight size={14} color="var(--text-muted)" />}
          <div>
            <div style={styles.cardTitle}>{item.title}</div>
            <div style={styles.cardMeta}>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.domain}</span>
              {overdue && (
                <span style={styles.overdueBadge}>OVERDUE</span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.cardRight}>
          <span style={{ ...styles.priorityBadge, color: priorityMeta.color, borderColor: priorityMeta.color }}>
            {priorityMeta.label}
          </span>
          <span style={{ ...styles.statusBadge, color: statusMeta.color, borderColor: statusMeta.color }}>
            <StatusIcon size={11} />
            {statusMeta.label}
          </span>
        </div>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={styles.cardBody}>
          <p style={styles.description}>{item.description}</p>

          <div style={styles.metaGrid}>
            {item.assignee && (
              <div style={styles.metaItem}>
                <User size={12} color="var(--text-muted)" />
                <span style={styles.metaLabel}>Assignee</span>
                <span style={styles.metaValue}>{item.assignee}</span>
              </div>
            )}
            {item.dueDate && (
              <div style={styles.metaItem}>
                <Calendar size={12} color={overdue ? '#FF5252' : 'var(--text-muted)'} />
                <span style={styles.metaLabel}>Due</span>
                <span style={{ ...styles.metaValue, color: overdue ? '#FF5252' : undefined }}>
                  {fmtDate(item.dueDate)}
                </span>
              </div>
            )}
            {item.evidenceId && (
              <div style={styles.metaItem}>
                <FileText size={12} color="var(--text-muted)" />
                <span style={styles.metaLabel}>Evidence</span>
                <span style={{ ...styles.metaValue, color: '#4FC3F7' }}>{item.evidenceId}</span>
              </div>
            )}
            <div style={styles.metaItem}>
              <Tag size={12} color="var(--text-muted)" />
              <span style={styles.metaLabel}>Created</span>
              <span style={styles.metaValue}>{fmtDate(item.createdAt)}</span>
            </div>
          </div>

          <AuditLog item={item} />

          {nextAction && (
            <div style={styles.actionRow}>
              <button
                style={styles.transitionBtn}
                onClick={() => onTransition(item.id, nextAction.action)}
              >
                {nextAction.label} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────

function StatChip({
  label, count, color, active, onClick,
}: { label: string; count: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.statChip,
        borderColor: active ? color : 'var(--border)',
        color: active ? color : 'var(--text-muted)',
        background: active ? `${color}18` : 'transparent',
      }}
    >
      <span style={{ ...styles.statCount, color: active ? color : 'var(--text)' }}>{count}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | ActionItemStatus;

export default function ActionItemsView() {
  const [items,        setItems]        = useState<ActionItem[]>([]);
  const [stats,        setStats]        = useState<ActionItemStats | null>(null);
  const [filter,       setFilter]       = useState<StatusFilter>('all');
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [modal,        setModal]        = useState<ModalState | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError,   setModalError]   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ActionItemService.getAll();
      setItems(data.items);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load action items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filter === 'all'
    ? items
    : items.filter(i => i.status === filter);

  function handleTransition(itemId: string, action: TransitionAction) {
    setModalError(null);
    setModal({ itemId, action });
  }

  async function handleModalSubmit(fields: {
    actor: string; note?: string; assignee?: string; evidenceId?: string;
  }) {
    if (!modal) return;
    setModalLoading(true);
    setModalError(null);
    try {
      let updated: ActionItem;
      const { itemId, action } = modal;
      switch (action.type) {
        case 'assign':
          updated = await ActionItemService.assign(itemId, fields.assignee!, fields.actor, fields.note);
          break;
        case 'start-progress':
          updated = await ActionItemService.startProgress(itemId, fields.actor, fields.note);
          break;
        case 'provide-evidence':
          updated = await ActionItemService.provideEvidence(itemId, fields.actor, fields.evidenceId!, fields.note);
          break;
        case 'verify':
          updated = await ActionItemService.verify(itemId, fields.actor, fields.note);
          break;
        case 'close':
          updated = await ActionItemService.close(itemId, fields.actor, fields.note);
          break;
      }
      setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      // Refresh stats
      const data = await ActionItemService.getAll();
      setStats(data.stats);
      setModal(null);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : 'Transition failed');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <ClipboardList size={18} color="var(--cyan)" />
          <div>
            <h1 style={styles.title}>Action Items</h1>
            <p style={styles.subtitle}>Closed Loop Remediation — state-machine driven workflow</p>
          </div>
        </div>
        <button style={styles.refreshBtn} onClick={loadData} disabled={loading}>
          <RefreshCw size={13} style={{ transform: loading ? 'rotate(360deg)' : undefined }} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={styles.statsBar}>
          <StatChip label="All"              count={stats.total}            color="var(--cyan)"  active={filter === 'all'}              onClick={() => setFilter('all')} />
          <StatChip label="Open"             count={stats.open}             color="#FF5252"      active={filter === 'open'}             onClick={() => setFilter('open')} />
          <StatChip label="Assigned"         count={stats.assigned}         color="#FFD600"      active={filter === 'assigned'}         onClick={() => setFilter('assigned')} />
          <StatChip label="In Progress"      count={stats.inProgress}       color="#FF8C00"      active={filter === 'in-progress'}      onClick={() => setFilter('in-progress')} />
          <StatChip label="Evidence"         count={stats.evidenceProvided} color="#4FC3F7"      active={filter === 'evidence-provided'} onClick={() => setFilter('evidence-provided')} />
          <StatChip label="Verified"         count={stats.verified}         color="#CE93D8"      active={filter === 'verified'}         onClick={() => setFilter('verified')} />
          <StatChip label="Closed"           count={stats.closed}           color="#00E676"      active={filter === 'closed'}           onClick={() => setFilter('closed')} />
          {stats.overdue > 0 && (
            <span style={styles.overdueAlert}>
              <AlertTriangle size={12} /> {stats.overdue} overdue
            </span>
          )}
        </div>
      )}

      {/* State machine legend */}
      <div style={styles.legend}>
        {(Object.entries(STATUS_META) as [ActionItemStatus, typeof STATUS_META[ActionItemStatus]][]).map(([status, meta], idx, arr) => {
          const Icon = meta.icon;
          return (
            <span key={status} style={styles.legendItem}>
              <Icon size={12} color={meta.color} />
              <span style={{ color: meta.color, fontSize: 11 }}>{meta.label}</span>
              {idx < arr.length - 1 && <span style={styles.legendArrow}>→</span>}
            </span>
          );
        })}
      </div>

      {/* Content */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {loading && !items.length && (
        <div style={styles.loadingBox}>
          <RefreshCw size={20} color="var(--cyan)" />
          <span>Loading action items…</span>
        </div>
      )}

      {!loading && !error && (
        <div style={styles.list}>
          {filtered.length === 0 ? (
            <div style={styles.emptyState}>No action items match the selected filter.</div>
          ) : (
            filtered.map(item => (
              <ActionCard key={item.id} item={item} onTransition={handleTransition} />
            ))
          )}
        </div>
      )}

      {/* Transition modal */}
      {modal && (
        <TransitionModal
          modal={modal}
          onSubmit={handleModalSubmit}
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
  page: {
    padding: '24px',
    maxWidth: 900,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 16,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text)',
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--text-muted)',
    margin: '2px 0 0',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-muted)',
    fontSize: 12,
    cursor: 'pointer',
  },
  statsBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    border: '1px solid',
    borderRadius: 20,
    fontSize: 11,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  statCount: {
    fontWeight: 700,
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
  },
  overdueAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#FF5252',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 10px',
    background: '#FF525218',
    borderRadius: 20,
    border: '1px solid #FF5252',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
    padding: '8px 12px',
    background: 'var(--surface)',
    borderRadius: 8,
    border: '1px solid var(--border)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendArrow: {
    color: 'var(--text-muted)',
    fontSize: 11,
    marginLeft: 4,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    background: 'var(--surface)',
    borderRadius: 8,
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  cardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    gap: 12,
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    textAlign: 'left',
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text)',
    lineHeight: 1.4,
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 4,
    border: '1px solid',
    whiteSpace: 'nowrap',
  },
  overdueBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#FF5252',
    background: '#FF525218',
    padding: '1px 6px',
    borderRadius: 4,
  },
  cardBody: {
    padding: '0 14px 14px',
    borderTop: '1px solid var(--border)',
  },
  description: {
    fontSize: 12,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: '12px 0',
  },
  metaGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  metaLabel: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  metaValue: {
    fontSize: 11,
    color: 'var(--text)',
    fontWeight: 500,
  },
  auditLog: {
    marginBottom: 14,
  },
  auditTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 10,
  },
  auditEntries: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  auditEntry: {
    display: 'flex',
    gap: 10,
    position: 'relative',
    paddingBottom: 12,
  },
  auditDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    zIndex: 1,
  },
  auditLine: {
    position: 'absolute',
    left: 9,
    top: 22,
    width: 2,
    bottom: 0,
    background: 'var(--border)',
  },
  auditContent: {
    flex: 1,
    paddingBottom: 2,
  },
  auditHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  auditStatus: {
    fontSize: 11,
    fontWeight: 600,
  },
  auditActor: {
    fontSize: 11,
    color: 'var(--text)',
  },
  auditTime: {
    fontSize: 10,
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  auditNote: {
    fontSize: 11,
    color: 'var(--text-muted)',
    marginTop: 3,
    lineHeight: 1.5,
  },
  evidenceBadge: {
    display: 'inline-block',
    marginTop: 4,
    fontSize: 10,
    fontWeight: 600,
    color: '#4FC3F7',
    background: '#4FC3F718',
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #4FC3F7',
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  transitionBtn: {
    padding: '7px 16px',
    background: 'var(--cyan)',
    border: 'none',
    borderRadius: 6,
    color: '#0a0f1e',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBox: {
    padding: '12px 16px',
    background: '#FF525218',
    border: '1px solid #FF5252',
    borderRadius: 8,
    color: '#FF5252',
    fontSize: 13,
    marginBottom: 16,
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  emptyState: {
    padding: 40,
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 24,
    width: 420,
    maxWidth: '90vw',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 18,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text)',
    fontSize: 13,
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginBottom: 12,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    color: 'var(--text-muted)',
    fontSize: 13,
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '7px 16px',
    background: 'var(--cyan)',
    border: 'none',
    borderRadius: 6,
    color: '#0a0f1e',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
