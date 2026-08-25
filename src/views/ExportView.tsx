import { useState, useEffect } from 'react';
import {
  Download, FileSpreadsheet, RefreshCw, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { DomainService } from '../services/DomainService';
import { ActionItemService } from '../services/ActionItemService';
import { ControlTestService } from '../services/ControlTestService';
import { IncidentTriggerService } from '../services/IncidentTriggerService';
import type { ActionItem, ControlTest, IncidentTrigger } from '../models';
import { toCSV, downloadCSV } from '../utils/exportUtils';

// ─── Row builders ──────────────────────────────────────────────────────────

function buildRiskRows() {
  return DomainService.getAll().flatMap(domain =>
    domain.risks.map(r => ({
      Domain:          domain.name,
      'Risk ID':       r.id,
      'Risk Name':     r.name,
      Description:     r.description,
      'Business Impact': r.businessImpact,
      Likelihood:      r.likelihood,
      Impact:          r.impact,
      'Inherent Risk': r.inherentRisk,
      'Inherent Score': r.inherentScore,
      'Residual Risk': r.residualRisk,
      'Residual Score': r.residualScore,
      Owner:           r.owner,
      'Business Unit': r.businessUnit,
      Lifecycle:       r.lifecycle,
      Trend:           r.trend,
      'Last Assessed': r.lastAssessed,
      'Next Review':   r.nextReview,
      'Regulatory Refs': r.regulatoryRefs,
    }))
  );
}

function buildKRIRows() {
  return DomainService.getAll().flatMap(domain =>
    domain.kris.map(k => ({
      Domain:    domain.name,
      'KRI ID':  k.id,
      'KRI Name': k.name,
      Value:     k.value,
      Threshold: k.threshold,
      Unit:      k.unit,
      Status:    k.status,
      Trend:     k.trend,
    }))
  );
}

function buildActionItemRows(items: ActionItem[]) {
  return items.map(a => ({
    ID:          a.id,
    Title:       a.title,
    Domain:      a.domain,
    Status:      a.status,
    Priority:    a.priority,
    Assignee:    a.assignee ?? '',
    Description: a.description,
    'Due Date':  a.dueDate ?? '',
    'Created At': a.createdAt,
    'Updated At': a.updatedAt,
  }));
}

function buildControlTestRows(tests: ControlTest[]) {
  return tests.map(t => ({
    ID:            t.id,
    'Control ID':  t.controlId,
    'Control Name': t.controlName,
    Domain:        t.domain,
    Type:          t.testType,
    Result:        t.result,
    Score:         t.score,
    Tester:        t.tester,
    'Tested At':   t.testedAt,
    'Next Test Due': t.nextTestDue,
    Findings:      t.findings.length,
    Notes:         t.notes,
    'Evidence Ref': t.evidenceRef,
  }));
}

function buildTriggerRows(triggers: IncidentTrigger[]) {
  return triggers.map(t => ({
    ID:              t.id,
    'KRI Name':      t.kriName,
    Domain:          t.domainName,
    Severity:        t.severity,
    Status:          t.status,
    'Current Value': t.currentValue,
    Threshold:       t.threshold,
    Unit:            t.unit,
    'Breached At':   t.breachedAt,
    'Linked Playbook': t.linkedPlaybookName,
    'Playbook ID':   t.linkedPlaybookId,
    'Acknowledged By': t.acknowledgedBy ?? '',
    'Acknowledged At': t.acknowledgedAt ?? '',
    'Resolved By':   t.resolvedBy ?? '',
    'Resolved At':   t.resolvedAt ?? '',
    'Trigger Note':  t.triggerNote,
  }));
}

// ─── Dataset config ────────────────────────────────────────────────────────

interface Dataset {
  id:       string;
  label:    string;
  desc:     string;
  columns:  string[];
  filename: string;
}

const DATASETS: Dataset[] = [
  {
    id: 'risks',
    label: 'Risk Register',
    desc: 'All risks across every domain with scores, owners, lifecycle state, and regulatory references.',
    columns: ['Domain', 'Risk ID', 'Risk Name', 'Residual Risk', 'Residual Score', 'Owner', 'Lifecycle', 'Next Review'],
    filename: 'lumina-risk-register.csv',
  },
  {
    id: 'kris',
    label: 'KRI Status',
    desc: 'All Key Risk Indicators with current values, thresholds, breach status and trend.',
    columns: ['Domain', 'KRI Name', 'Value', 'Threshold', 'Unit', 'Status', 'Trend'],
    filename: 'lumina-kri-status.csv',
  },
  {
    id: 'action-items',
    label: 'Action Items',
    desc: 'All GRC action items with status, priority, assignee, due dates, and audit log trail.',
    columns: ['Title', 'Domain', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created At'],
    filename: 'lumina-action-items.csv',
  },
  {
    id: 'control-tests',
    label: 'Control Tests',
    desc: 'Control test results with scores, result, tester, findings count, and next test schedule.',
    columns: ['Control Name', 'Domain', 'Type', 'Result', 'Score', 'Findings', 'Tester', 'Next Test Due'],
    filename: 'lumina-control-tests.csv',
  },
  {
    id: 'incident-triggers',
    label: 'Incident Triggers',
    desc: 'KRI breach-triggered incidents with severity, linked resilience playbook, and resolution state.',
    columns: ['KRI Name', 'Domain', 'Severity', 'Status', 'Current Value', 'Threshold', 'Linked Playbook', 'Breached At'],
    filename: 'lumina-incident-triggers.csv',
  },
];

// ─── Export card ───────────────────────────────────────────────────────────

interface ExportCardProps {
  dataset:    Dataset;
  rowCount:   number | null;
  loading:    boolean;
  onDownload: () => void;
  justDone:   boolean;
}

function ExportCard({ dataset, rowCount, loading, onDownload, justDone }: ExportCardProps) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <FileSpreadsheet size={18} color="var(--cyan)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.cardLabel}>{dataset.label}</div>
          <div style={styles.cardDesc}>{dataset.desc}</div>
        </div>
        <button
          style={{ ...styles.dlBtn, ...(justDone ? styles.dlBtnDone : {}) }}
          onClick={onDownload}
          disabled={loading || rowCount === null}
          title="Download CSV"
        >
          {justDone
            ? <><CheckCircle2 size={13} /> Exported</>
            : <><Download size={13} /> Download CSV</>}
        </button>
      </div>

      <div style={styles.cardMeta}>
        <div style={styles.columns}>
          {dataset.columns.map(col => (
            <span key={col} style={styles.colChip}>{col}</span>
          ))}
          <span style={{ ...styles.colChip, color: 'var(--text-muted)', borderStyle: 'dashed' }}>+ more</span>
        </div>
        <div style={styles.rowCount}>
          {loading
            ? <span style={{ color: 'var(--text-muted)' }}><RefreshCw size={10} /> loading…</span>
            : rowCount !== null
              ? <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>{rowCount} rows</span>
              : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

export default function ExportView() {
  const [actionItems,    setActionItems]    = useState<ActionItem[] | null>(null);
  const [controlTests,   setControlTests]   = useState<ControlTest[] | null>(null);
  const [incidentTriggers, setIncidentTriggers] = useState<IncidentTrigger[] | null>(null);
  const [asyncLoading,   setAsyncLoading]   = useState(true);
  const [asyncError,     setAsyncError]     = useState<string | null>(null);
  const [doneSets,       setDoneSets]       = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    Promise.all([
      ActionItemService.getAll(),
      ControlTestService.getAll(),
      IncidentTriggerService.getAll(),
    ])
      .then(([ai, ct, it]) => {
        setActionItems(ai.items);
        setControlTests(ct.tests);
        setIncidentTriggers(it.triggers);
      })
      .catch(e => setAsyncError(e instanceof Error ? e.message : 'Failed to load data'))
      .finally(() => setAsyncLoading(false));
  }, []);

  const syncReady   = true;
  const riskRows    = buildRiskRows();
  const kriRows     = buildKRIRows();

  function rowCount(id: string): number | null {
    switch (id) {
      case 'risks':             return riskRows.length;
      case 'kris':              return kriRows.length;
      case 'action-items':      return actionItems?.length ?? null;
      case 'control-tests':     return controlTests?.length ?? null;
      case 'incident-triggers': return incidentTriggers?.length ?? null;
      default:                  return null;
    }
  }

  function markDone(id: string) {
    setDoneSets(prev => new Set([...prev, id]));
    setTimeout(() => setDoneSets(prev => { const s = new Set(prev); s.delete(id); return s; }), 2500);
  }

  function handleDownload(id: string) {
    const ds = DATASETS.find(d => d.id === id)!;
    let rows: Record<string, unknown>[] = [];
    switch (id) {
      case 'risks':             rows = buildRiskRows();                                 break;
      case 'kris':              rows = buildKRIRows();                                  break;
      case 'action-items':      rows = buildActionItemRows(actionItems ?? []);          break;
      case 'control-tests':     rows = buildControlTestRows(controlTests ?? []);        break;
      case 'incident-triggers': rows = buildTriggerRows(incidentTriggers ?? []);        break;
    }
    downloadCSV(toCSV(rows), ds.filename);
    markDone(id);
  }

  async function handleDownloadAll() {
    setDownloadingAll(true);
    const pairs: [string, Record<string, unknown>[]][] = [
      ['risks',             buildRiskRows()],
      ['kris',              buildKRIRows()],
      ['action-items',      buildActionItemRows(actionItems ?? [])],
      ['control-tests',     buildControlTestRows(controlTests ?? [])],
      ['incident-triggers', buildTriggerRows(incidentTriggers ?? [])],
    ];
    for (const [id, rows] of pairs) {
      const ds = DATASETS.find(d => d.id === id)!;
      downloadCSV(toCSV(rows), ds.filename);
      await new Promise(r => setTimeout(r, 300));
      markDone(id);
    }
    setDownloadingAll(false);
  }

  const allReady = syncReady && !asyncLoading;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FileSpreadsheet size={18} color="var(--cyan)" />
          <div>
            <h1 style={styles.title}>Export to Sheets</h1>
            <p style={styles.subtitle}>Download any dataset as CSV — opens natively in Google Sheets, Excel, and Numbers</p>
          </div>
        </div>
        <button
          style={{ ...styles.dlAllBtn, opacity: allReady ? 1 : 0.5 }}
          disabled={!allReady || downloadingAll}
          onClick={handleDownloadAll}
        >
          {downloadingAll
            ? <><RefreshCw size={13} /> Exporting…</>
            : <><Download size={13} /> Download All (5 CSVs)</>}
        </button>
      </div>

      {asyncError && (
        <div style={styles.errorBox}>
          <AlertTriangle size={14} />
          {asyncError} — sync datasets (risks, KRIs) are still available.
        </div>
      )}

      <div style={styles.grid}>
        {DATASETS.map(ds => (
          <ExportCard
            key={ds.id}
            dataset={ds}
            rowCount={rowCount(ds.id)}
            loading={['action-items', 'control-tests', 'incident-triggers'].includes(ds.id) && asyncLoading}
            onDownload={() => handleDownload(ds.id)}
            justDone={doneSets.has(ds.id)}
          />
        ))}
      </div>

      <p style={styles.hint}>
        Files are generated in your browser — no data leaves Lumina. BOM-prefixed UTF-8 for full Google Sheets compatibility.
      </p>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page:       { padding: '24px', maxWidth: 860, margin: '0 auto' },
  header:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 },
  headerLeft: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  title:      { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  subtitle:   { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },
  dlAllBtn:   { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--cyan)', border: 'none', borderRadius: 7, color: '#000', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' as const, transition: 'opacity 0.15s' },
  errorBox:   { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#FF525218', border: '1px solid #FF5252', borderRadius: 8, color: '#FF5252', fontSize: 12, marginBottom: 16 },
  grid:       { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  card:       { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' },
  cardTop:    { display: 'flex', alignItems: 'flex-start', gap: 12 },
  cardLabel:  { fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 },
  cardDesc:   { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 },
  cardMeta:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  columns:    { display: 'flex', flexWrap: 'wrap' as const, gap: 5 },
  colChip:    { fontSize: 10, padding: '2px 7px', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', fontFamily: 'monospace' },
  rowCount:   { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, whiteSpace: 'nowrap' as const },
  dlBtn:      { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.35)', borderRadius: 6, color: 'var(--cyan)', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0, transition: 'all 0.15s' },
  dlBtnDone:  { background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.35)', color: '#00E676' },
  hint:       { marginTop: 20, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' as const },
};
