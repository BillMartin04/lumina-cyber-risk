import { useState, useEffect } from 'react';
import {
  Server, Database, Cloud, Globe, Cpu, Network, Box, Layers,
  AlertTriangle, CheckCircle, Wrench, ChevronDown, ChevronRight,
  Shield, Link2, RefreshCw,
} from 'lucide-react';
import { CMDBService } from '../services/CMDBService';
import type { CMDBData, ConfigurationItem, CIClass, CIBusinessCriticality } from '../models';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLASS_LABEL: Record<CIClass, string> = {
  cmdb_ci_service:      'Business Service',
  cmdb_ci_business_app: 'Business App',
  cmdb_ci_server:       'Server',
  cmdb_ci_database:     'Database',
  cmdb_ci_network:      'Network',
  cmdb_ci_cloud:        'Cloud',
  cmdb_ci_api:          'API',
  cmdb_ci_endpoint:     'Endpoint',
};

const CLASS_ICON: Record<CIClass, React.ReactNode> = {
  cmdb_ci_service:      <Globe size={14} />,
  cmdb_ci_business_app: <Box size={14} />,
  cmdb_ci_server:       <Server size={14} />,
  cmdb_ci_database:     <Database size={14} />,
  cmdb_ci_network:      <Network size={14} />,
  cmdb_ci_cloud:        <Cloud size={14} />,
  cmdb_ci_api:          <Layers size={14} />,
  cmdb_ci_endpoint:     <Cpu size={14} />,
};

const CRIT_COLOR: Record<CIBusinessCriticality, string> = {
  '1-critical': '#FF5252',
  '2-high':     '#FF8C00',
  '3-medium':   '#FFD600',
  '4-low':      '#4FC3F7',
};

const CRIT_LABEL: Record<CIBusinessCriticality, string> = {
  '1-critical': 'Critical',
  '2-high':     'High',
  '3-medium':   'Medium',
  '4-low':      'Low',
};

const ENV_COLOR: Record<string, string> = {
  production:  '#00E676',
  staging:     '#FFD600',
  development: '#4FC3F7',
  test:        '#9E9E9E',
  dr:          '#FF8C00',
};

function statusIcon(s: string) {
  if (s === 'operational') return <CheckCircle size={12} color="#00E676" />;
  if (s === 'in-maintenance') return <Wrench size={12} color="#FFD600" />;
  return <AlertTriangle size={12} color="#FF5252" />;
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: CMDBData['stats'] }) {
  return (
    <div style={styles.statsRow}>
      {[
        { label: 'Total CIs',       value: stats.total,              color: 'var(--cyan)' },
        { label: 'Critical',        value: stats.critical,           color: '#FF5252' },
        { label: 'High',            value: stats.high,               color: '#FF8C00' },
        { label: 'Ops Issues',      value: stats.operationalIssues,  color: '#FFD600' },
        { label: 'Regulatory Scope', value: stats.withRegulatoryScope, color: '#A78BFA' },
      ].map(s => (
        <div key={s.label} style={styles.statCard}>
          <div style={{ ...styles.statValue, color: s.color }}>{s.value}</div>
          <div style={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── CI Card ──────────────────────────────────────────────────────────────────

interface CICardProps {
  ci:            ConfigurationItem;
  relationships: CMDBData['relationships'];
  allItems:      ConfigurationItem[];
}

function CICard({ ci, relationships, allItems }: CICardProps) {
  const [expanded, setExpanded] = useState(false);
  const rels = relationships.filter(r => r.sourceId === ci.id || r.targetId === ci.id);
  const critColor = CRIT_COLOR[ci.businessCriticality];
  const isIssue = ci.operationalStatus !== 'operational';

  return (
    <div style={{ ...styles.ciCard, borderLeftColor: critColor }}>
      {/* Header row */}
      <div style={styles.ciHeader} onClick={() => setExpanded(e => !e)}>
        <div style={styles.ciHeaderLeft}>
          <span style={{ color: critColor }}>{CLASS_ICON[ci.ciClass]}</span>
          <div>
            <div style={styles.ciName}>{ci.name}</div>
            <div style={styles.ciClass}>{CLASS_LABEL[ci.ciClass]}</div>
          </div>
        </div>

        <div style={styles.ciHeaderRight}>
          {/* Criticality badge */}
          <span style={{ ...styles.badge, background: `${critColor}22`, color: critColor, border: `1px solid ${critColor}55` }}>
            {CRIT_LABEL[ci.businessCriticality]}
          </span>

          {/* Environment badge */}
          <span style={{ ...styles.badge, background: `${ENV_COLOR[ci.environment] ?? '#9E9E9E'}18`, color: ENV_COLOR[ci.environment] ?? '#9E9E9E', border: `1px solid ${ENV_COLOR[ci.environment] ?? '#9E9E9E'}44` }}>
            {ci.environment}
          </span>

          {/* Operational status */}
          <span style={styles.opStatus}>
            {statusIcon(ci.operationalStatus)}
            <span style={{ color: isIssue ? '#FFD600' : 'var(--text-muted)', fontSize: 11 }}>
              {ci.operationalStatus}
            </span>
          </span>

          {/* Expand toggle */}
          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </div>
      </div>

      {/* Short description */}
      <div style={styles.ciDesc}>{ci.shortDescription}</div>

      {/* Reg scope chips */}
      {ci.regulatoryScope.length > 0 && (
        <div style={styles.chipRow}>
          <Shield size={10} color="var(--purple)" />
          {ci.regulatoryScope.map(s => (
            <span key={s} style={styles.regChip}>{s}</span>
          ))}
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={styles.expandPanel}>
          <div style={styles.detailGrid}>
            <div style={styles.detailItem}><span style={styles.detailKey}>Owner</span><span>{ci.ownedBy}</span></div>
            <div style={styles.detailItem}><span style={styles.detailKey}>Managed By</span><span>{ci.managedBy}</span></div>
            <div style={styles.detailItem}><span style={styles.detailKey}>Department</span><span>{ci.department}</span></div>
            {ci.supportGroup && <div style={styles.detailItem}><span style={styles.detailKey}>Support Group</span><span>{ci.supportGroup}</span></div>}
            {ci.location && <div style={styles.detailItem}><span style={styles.detailKey}>Location</span><span>{ci.location}</span></div>}
            {ci.fqdn && <div style={styles.detailItem}><span style={styles.detailKey}>FQDN</span><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{ci.fqdn}</span></div>}
            {ci.ipAddress && <div style={styles.detailItem}><span style={styles.detailKey}>IP Address</span><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{ci.ipAddress}</span></div>}
            <div style={styles.detailItem}><span style={styles.detailKey}>Data Class</span><span style={{ textTransform: 'capitalize' }}>{ci.dataClassification}</span></div>
            <div style={styles.detailItem}><span style={styles.detailKey}>Last Updated</span><span>{ci.lastUpdated.slice(0, 10)}</span></div>
            <div style={styles.detailItem}><span style={styles.detailKey}>Discovered</span><span>{ci.discoveredDate.slice(0, 10)}</span></div>
          </div>

          {/* Tags */}
          {ci.tags.length > 0 && (
            <div style={{ ...styles.chipRow, marginTop: 10 }}>
              {ci.tags.map(t => <span key={t} style={styles.tagChip}>{t}</span>)}
            </div>
          )}

          {/* Relationships */}
          {rels.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={styles.relHeader}><Link2 size={11} /> Relationships ({rels.length})</div>
              <div style={styles.relList}>
                {rels.map(r => {
                  const isSource = r.sourceId === ci.id;
                  const otherId  = isSource ? r.targetId : r.sourceId;
                  const other    = allItems.find(i => i.id === otherId);
                  const color    = other ? CRIT_COLOR[other.businessCriticality] : 'var(--text-muted)';
                  return (
                    <div key={r.id} style={styles.relRow}>
                      <span style={{ color: 'var(--text-muted)', fontSize: 10, minWidth: 80, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {isSource ? r.relationshipType : `← ${r.relationshipType}`}
                      </span>
                      <span style={{ color }}>{CLASS_ICON[other?.ciClass ?? 'cmdb_ci_service']}</span>
                      <span style={styles.relName}>{other?.name ?? otherId}</span>
                      {r.description && <span style={styles.relDesc}>{r.description}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Class breakdown bar ──────────────────────────────────────────────────────

function ClassBreakdown({ byClass }: { byClass: Record<string, number> }) {
  const total = Object.values(byClass).reduce((a, b) => a + b, 0);
  const entries = Object.entries(byClass).sort((a, b) => b[1] - a[1]);
  const colors = ['var(--cyan)', '#A78BFA', '#FF8C00', '#FFD600', '#00E676', '#4FC3F7', '#FF5252', '#9E9E9E'];

  return (
    <div style={styles.breakdownCard}>
      <div style={styles.breakdownTitle}>CI Types</div>
      <div style={styles.breakdownBar}>
        {entries.map(([key, count], i) => (
          <div
            key={key}
            title={`${CLASS_LABEL[key as CIClass] ?? key}: ${count}`}
            style={{ ...styles.breakdownSegment, flex: count / total, background: colors[i % colors.length] }}
          />
        ))}
      </div>
      <div style={styles.breakdownLegend}>
        {entries.map(([key, count], i) => (
          <div key={key} style={styles.legendItem}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length], display: 'inline-block', flexShrink: 0 }} />
            <span style={styles.legendLabel}>{CLASS_LABEL[key as CIClass] ?? key}</span>
            <span style={styles.legendCount}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

type FilterKey = 'all' | '1-critical' | '2-high' | '3-medium' | '4-low';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: '1-critical', label: 'Critical' },
  { key: '2-high',     label: 'High' },
  { key: '3-medium',   label: 'Medium' },
  { key: '4-low',      label: 'Low' },
];

export default function CMDBView() {
  const [data, setData]         = useState<CMDBData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState<FilterKey>('all');
  const [classFilter, setClassFilter] = useState<CIClass | 'all'>('all');
  const [opsFilter, setOpsFilter] = useState(false);

  useEffect(() => {
    CMDBService.getCMDBData()
      .then(setData)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load CMDB'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.center}>
      <RefreshCw size={18} color="var(--cyan)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ color: 'var(--text-muted)', marginLeft: 10 }}>Loading CMDB…</span>
    </div>
  );

  if (error || !data) return (
    <div style={styles.center}>
      <AlertTriangle size={18} color="#FF5252" />
      <span style={{ color: '#FF5252', marginLeft: 8 }}>{error ?? 'No data'}</span>
    </div>
  );

  const filtered = data.items.filter(ci => {
    if (filter !== 'all' && ci.businessCriticality !== filter) return false;
    if (classFilter !== 'all' && ci.ciClass !== classFilter) return false;
    if (opsFilter && ci.operationalStatus === 'operational') return false;
    return true;
  });

  const sortedItems = [...filtered].sort((a, b) => {
    const order = { '1-critical': 0, '2-high': 1, '3-medium': 2, '4-low': 3 };
    return order[a.businessCriticality] - order[b.businessCriticality];
  });

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Server size={18} color="var(--cyan)" />
          <div>
            <h1 style={styles.title}>Configuration Management Database</h1>
            <p style={styles.subtitle}>Business-critical asset inventory aligned with ServiceNow CMDB — {data.stats.total} configuration items mapped</p>
          </div>
        </div>
        <ClassBreakdown byClass={data.stats.byClass} />
      </div>

      <StatsBar stats={data.stats} />

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.key}
              style={{ ...styles.filterBtn, ...(filter === f.key ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f.key)}
            >
              {f.key !== 'all' && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CRIT_COLOR[f.key as CIBusinessCriticality], display: 'inline-block' }} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        <div style={styles.filterGroup}>
          <select
            style={styles.select}
            value={classFilter}
            onChange={e => setClassFilter(e.target.value as CIClass | 'all')}
          >
            <option value="all">All Types</option>
            {Object.entries(CLASS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button
            style={{ ...styles.filterBtn, ...(opsFilter ? { background: '#FFD60022', color: '#FFD600', border: '1px solid #FFD60055' } : {}) }}
            onClick={() => setOpsFilter(o => !o)}
          >
            <Wrench size={11} /> Issues Only
          </button>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 'auto' }}>
          {sortedItems.length} of {data.stats.total} items
        </span>
      </div>

      {/* CI list */}
      <div style={styles.ciList}>
        {sortedItems.length === 0 ? (
          <div style={styles.empty}>No configuration items match the current filters.</div>
        ) : (
          sortedItems.map(ci => (
            <CICard
              key={ci.id}
              ci={ci}
              relationships={data.relationships}
              allItems={data.items}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page:         { padding: '24px', maxWidth: 1100, margin: '0 auto' },
  center:       { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' },
  header:       { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 20 },
  headerLeft:   { display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 },
  title:        { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  subtitle:     { fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' },

  statsRow:     { display: 'flex', gap: 10, marginBottom: 18 },
  statCard:     { flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' },
  statValue:    { fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  statLabel:    { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },

  filterBar:    { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' as const },
  filterGroup:  { display: 'flex', gap: 5, alignItems: 'center' },
  filterBtn:    { display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', fontWeight: 500 },
  filterBtnActive: { background: 'rgba(0,212,255,0.12)', color: 'var(--cyan)', border: '1px solid rgba(0,212,255,0.4)' },
  select:       { padding: '5px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 11, cursor: 'pointer' },

  ciList:       { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  ciCard:       { background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid transparent', borderRadius: 8, padding: '12px 14px', cursor: 'default' },
  ciHeader:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer' },
  ciHeaderLeft: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  ciName:       { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  ciClass:      { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginTop: 1 },
  ciHeaderRight:{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 },
  ciDesc:       { fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5, marginLeft: 24 },
  opStatus:     { display: 'flex', alignItems: 'center', gap: 4 },

  badge:        { fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600, whiteSpace: 'nowrap' as const },
  chipRow:      { display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, flexWrap: 'wrap' as const, marginLeft: 24 },
  regChip:      { fontSize: 10, padding: '2px 6px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: 4, color: '#A78BFA' },
  tagChip:      { fontSize: 10, padding: '2px 6px', background: 'var(--border)', borderRadius: 4, color: 'var(--text-muted)' },

  expandPanel:  { marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12, marginLeft: 24 },
  detailGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px 16px' },
  detailItem:   { display: 'flex', flexDirection: 'column' as const, gap: 1 },
  detailKey:    { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' },

  relHeader:    { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 },
  relList:      { display: 'flex', flexDirection: 'column' as const, gap: 5 },
  relRow:       { display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, padding: '5px 8px', background: 'var(--bg)', borderRadius: 5 },
  relName:      { fontWeight: 500, color: 'var(--text)' },
  relDesc:      { color: 'var(--text-muted)', flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: 8, marginLeft: 4 },

  breakdownCard:    { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', minWidth: 200 },
  breakdownTitle:   { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 },
  breakdownBar:     { display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1, marginBottom: 10 },
  breakdownSegment: { transition: 'flex 0.3s' },
  breakdownLegend:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px' },
  legendItem:       { display: 'flex', alignItems: 'center', gap: 5, fontSize: 10 },
  legendLabel:      { color: 'var(--text-muted)', flex: 1, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  legendCount:      { fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' },

  empty:        { padding: '30px', textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: 13 },
};
