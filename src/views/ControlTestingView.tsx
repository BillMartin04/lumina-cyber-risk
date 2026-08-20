import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical, ChevronDown, ChevronRight, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw, Calendar, User,
  FileText, Cpu, ClipboardCheck,
} from 'lucide-react';
import type { ControlTest, ControlTestResult, ControlTestType, ControlTestStats } from '../models';
import { ControlTestService } from '../services/ControlTestService';

// ─── Config ────────────────────────────────────────────────────────────────

const RESULT_META: Record<ControlTestResult, { label: string; color: string; icon: React.ElementType }> = {
  pass:    { label: 'Pass',    color: '#00E676', icon: CheckCircle2 },
  partial: { label: 'Partial', color: '#FFD600', icon: AlertTriangle },
  fail:    { label: 'Fail',    color: '#FF5252', icon: XCircle },
};

const TYPE_META: Record<ControlTestType, { label: string; color: string }> = {
  'automated':       { label: 'Automated',       color: '#4FC3F7' },
  'manual':          { label: 'Manual',           color: '#CE93D8' },
  'penetration-test':{ label: 'Pen Test',         color: '#FF8C00' },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function isOverdue(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function scoreColor(score: number) {
  if (score >= 90) return '#00E676';
  if (score >= 70) return '#FFD600';
  if (score >= 50) return '#FF8C00';
  return '#FF5252';
}

// ─── Score Bar ─────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = scoreColor(score);
  return (
    <div style={styles.scoreBarWrapper}>
      <div style={styles.scoreBarTrack}>
        <div style={{ ...styles.scoreBarFill, width: `${score}%`, background: color }} />
      </div>
      <span style={{ ...styles.scoreLabel, color }}>{score}</span>
    </div>
  );
}

// ─── Stat Chip ─────────────────────────────────────────────────────────────

function StatChip({
  label, count, color, active, onClick,
}: { label: string; count: number | string; color: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.statChip,
        borderColor: active ? color : 'var(--border)',
        color: active ? color : 'var(--text-muted)',
        background: active ? `${color}18` : 'transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ ...styles.statCount, color: active ? color : 'var(--text)' }}>{count}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Test Card ─────────────────────────────────────────────────────────────

function TestCard({ test }: { test: ControlTest }) {
  const [expanded, setExpanded] = useState(false);
  const resultMeta = RESULT_META[test.result];
  const typeMeta   = TYPE_META[test.testType];
  const ResultIcon = resultMeta.icon;
  const overdue    = isOverdue(test.nextTestDue);

  return (
    <div style={{
      ...styles.card,
      borderLeft: `3px solid ${resultMeta.color}`,
    }}>
      {/* Header */}
      <button style={styles.cardHeader} onClick={() => setExpanded(e => !e)}>
        <div style={styles.cardLeft}>
          {expanded
            ? <ChevronDown size={14} color="var(--text-muted)" />
            : <ChevronRight size={14} color="var(--text-muted)" />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.cardTitle}>{test.controlName}</div>
            <div style={styles.cardMeta}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{test.controlId}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{test.domain}</span>
            </div>
          </div>
        </div>
        <div style={styles.cardRight}>
          <ScoreBar score={test.score} />
          <span style={{ ...styles.badge, color: typeMeta.color, borderColor: `${typeMeta.color}60` }}>
            {typeMeta.label}
          </span>
          <span style={{ ...styles.badge, color: resultMeta.color, borderColor: `${resultMeta.color}60` }}>
            <ResultIcon size={10} />
            {resultMeta.label}
          </span>
          {overdue && (
            <span style={styles.overdueBadge}>OVERDUE</span>
          )}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={styles.cardBody}>
          {/* Meta row */}
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <User size={12} color="var(--text-muted)" />
              <span style={styles.metaLabel}>Tester</span>
              <span style={styles.metaValue}>{test.tester}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={12} color="var(--text-muted)" />
              <span style={styles.metaLabel}>Tested</span>
              <span style={styles.metaValue}>{fmtDate(test.testedAt)}</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={12} color={overdue ? '#FF5252' : 'var(--text-muted)'} />
              <span style={styles.metaLabel}>Next Test</span>
              <span style={{ ...styles.metaValue, color: overdue ? '#FF5252' : undefined }}>
                {fmtDate(test.nextTestDue)}
              </span>
            </div>
            <div style={styles.metaItem}>
              <FileText size={12} color="var(--text-muted)" />
              <span style={styles.metaLabel}>Evidence</span>
              <span style={{ ...styles.metaValue, color: '#4FC3F7' }}>{test.evidenceRef}</span>
            </div>
          </div>

          {/* Notes */}
          <p style={styles.notes}>{test.notes}</p>

          {/* Findings */}
          {test.findings.length > 0 && (
            <div style={styles.findingsBox}>
              <div style={styles.findingsTitle}>
                <AlertTriangle size={12} color="#FF8C00" />
                Findings ({test.findings.length})
              </div>
              <ul style={styles.findingsList}>
                {test.findings.map((f, i) => (
                  <li key={i} style={styles.findingItem}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

type ResultFilter = 'all' | ControlTestResult;

export default function ControlTestingView() {
  const [tests,   setTests]   = useState<ControlTest[]>([]);
  const [stats,   setStats]   = useState<ControlTestStats | null>(null);
  const [filter,  setFilter]  = useState<ResultFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ControlTestService.getAll();
      setTests(data.tests);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load control tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = filter === 'all'
    ? tests
    : tests.filter(t => t.result === filter);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FlaskConical size={18} color="var(--cyan)" />
          <div>
            <h1 style={styles.title}>Control Performance Testing</h1>
            <p style={styles.subtitle}>Test execution log and findings across all control domains</p>
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
          <StatChip label="All"     count={stats.total}   color="var(--cyan)"  active={filter === 'all'}     onClick={() => setFilter('all')} />
          <StatChip label="Pass"    count={stats.pass}    color="#00E676"      active={filter === 'pass'}    onClick={() => setFilter('pass')} />
          <StatChip label="Partial" count={stats.partial} color="#FFD600"      active={filter === 'partial'} onClick={() => setFilter('partial')} />
          <StatChip label="Fail"    count={stats.fail}    color="#FF5252"      active={filter === 'fail'}    onClick={() => setFilter('fail')} />
          <div style={styles.divider} />
          <StatChip label="Avg Score"    count={`${stats.avgScore}%`} color={scoreColor(stats.avgScore)} />
          {stats.overdueTests > 0 && (
            <span style={styles.overdueAlert}>
              <AlertTriangle size={12} /> {stats.overdueTests} overdue
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        {(Object.entries(TYPE_META) as [ControlTestType, typeof TYPE_META[ControlTestType]][]).map(([type, meta]) => (
          <span key={type} style={styles.legendItem}>
            <Cpu size={11} color={meta.color} />
            <span style={{ color: meta.color, fontSize: 11 }}>{meta.label}</span>
          </span>
        ))}
        <span style={styles.legendDivider}>·</span>
        <ClipboardCheck size={11} color="var(--text-muted)" />
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Score = 0–100 control effectiveness</span>
      </div>

      {/* Error */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Loading */}
      {loading && !tests.length && (
        <div style={styles.loadingBox}>
          <RefreshCw size={20} color="var(--cyan)" />
          <span>Loading control tests…</span>
        </div>
      )}

      {/* List */}
      {!loading && !error && (
        <div style={styles.list}>
          {filtered.length === 0
            ? <div style={styles.emptyState}>No tests match the selected filter.</div>
            : filtered.map(t => <TestCard key={t.id} test={t} />)
          }
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page:       { padding: '24px', maxWidth: 900, margin: '0 auto' },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 },
  headerLeft: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  title:      { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  subtitle:   { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', background: 'transparent',
    border: '1px solid var(--border)', borderRadius: 6,
    color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
  },
  statsBar: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' },
  statChip: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 10px', border: '1px solid',
    borderRadius: 20, fontSize: 11, transition: 'all 0.15s',
  },
  statCount:    { fontWeight: 700, fontSize: 13, fontVariantNumeric: 'tabular-nums' },
  divider:      { width: 1, height: 24, background: 'var(--border)', flexShrink: 0 },
  overdueAlert: {
    display: 'flex', alignItems: 'center', gap: 4,
    color: '#FF5252', fontSize: 11, fontWeight: 600,
    padding: '5px 10px', background: '#FF525218',
    borderRadius: 20, border: '1px solid #FF5252',
  },
  legend: {
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
    marginBottom: 20, padding: '8px 12px',
    background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)',
  },
  legendItem:    { display: 'flex', alignItems: 'center', gap: 4 },
  legendDivider: { color: 'var(--border)', fontSize: 14 },
  list:          { display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    background: 'var(--surface)', borderRadius: 8,
    border: '1px solid var(--border)', overflow: 'hidden',
  },
  cardHeader: {
    width: '100%', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '12px 14px',
    background: 'transparent', border: 'none', cursor: 'pointer', gap: 12,
  },
  cardLeft:  { display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1, minWidth: 0, textAlign: 'left' },
  cardTitle: { fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 },
  cardMeta:  { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 },
  cardRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  badge: {
    display: 'flex', alignItems: 'center', gap: 3,
    fontSize: 10, fontWeight: 600, padding: '2px 7px',
    borderRadius: 4, border: '1px solid', whiteSpace: 'nowrap' as const,
  },
  overdueBadge: {
    fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
    color: '#FF5252', background: '#FF525218',
    padding: '1px 6px', borderRadius: 4,
  },
  scoreBarWrapper: { display: 'flex', alignItems: 'center', gap: 6, width: 120 },
  scoreBarTrack:   { flex: 1, height: 4, borderRadius: 2, background: 'var(--border)' },
  scoreBarFill:    { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  scoreLabel:      { fontSize: 11, fontWeight: 700, minWidth: 24, textAlign: 'right' as const, fontVariantNumeric: 'tabular-nums' },
  cardBody:     { padding: '0 14px 14px', borderTop: '1px solid var(--border)' },
  metaRow:      { display: 'flex', flexWrap: 'wrap', gap: 14, margin: '12px 0' },
  metaItem:     { display: 'flex', alignItems: 'center', gap: 5 },
  metaLabel:    { fontSize: 11, color: 'var(--text-muted)' },
  metaValue:    { fontSize: 11, color: 'var(--text)', fontWeight: 500 },
  notes: {
    fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6,
    margin: '0 0 12px',
  },
  findingsBox: {
    background: '#FF525210', border: '1px solid #FF525230',
    borderRadius: 6, padding: '10px 12px',
  },
  findingsTitle: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 600, color: '#FF8C00',
    marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  },
  findingsList: { margin: 0, paddingLeft: 16 },
  findingItem:  { fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, lineHeight: 1.5 },
  errorBox: {
    padding: '12px 16px', background: '#FF525218',
    border: '1px solid #FF5252', borderRadius: 8,
    color: '#FF5252', fontSize: 13, marginBottom: 16,
  },
  loadingBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 40, color: 'var(--text-muted)', fontSize: 13,
  },
  emptyState: { padding: 40, textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: 13 },
};
