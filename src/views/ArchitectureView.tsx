import { useEffect, useState } from 'react';
import { Bot, Database, FlaskConical, Shield, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';
import type {
  ArchitectureData, AIAgent, RAGDataSource, ModelProvenance, ContainmentBoundary,
} from '../models';
import { ArchitectureService } from '../services/ArchitectureService';

// ─── Config ────────────────────────────────────────────────────────────────

const RISK_COLOR: Record<string, string> = {
  low: '#00E676', medium: '#FFD600', high: '#FF8C00', critical: '#FF5252',
};

const CRITICALITY_COLOR: Record<string, string> = {
  'mission-critical':  '#FF5252',
  'business-critical': '#FF8C00',
  'important':         '#FFD600',
  'standard':          '#4FC3F7',
};

const CRITICALITY_LABEL: Record<string, string> = {
  'mission-critical':  'Mission Critical',
  'business-critical': 'Business Critical',
  'important':         'Important',
  'standard':          'Standard',
};

const STATUS_COLOR: Record<string, string> = {
  active: '#00E676', sandboxed: '#FFD600', retired: '#666', 'under-review': '#FF8C00',
};

const PROVENANCE_COLOR: Record<string, string> = {
  verified: '#00E676', 'under-review': '#FFD600', unverified: '#FF8C00', flagged: '#FF5252',
};

const DRIFT_COLOR: Record<string, string> = {
  stable: '#00E676', drifting: '#FFD600', 'significant-drift': '#FF5252', unknown: '#888',
};

const CIRCUIT_COLOR: Record<string, string> = {
  closed: '#00E676', 'half-open': '#FFD600', open: '#FF5252',
};

const EU_COLOR: Record<string, string> = {
  minimal: '#00E676', limited: '#FFD600', high: '#FF8C00', unacceptable: '#FF5252',
};

const INJECTION_COLOR: Record<string, string> = {
  mitigated: '#00E676', low: '#4FC3F7', medium: '#FFD600', high: '#FF5252',
};

// ─── Shared components ─────────────────────────────────────────────────────

function Badge({ label, color, size = 11 }: { label: string; color: string; size?: number }) {
  return (
    <span style={{
      background: `${color}15`, color, border: `1px solid ${color}35`,
      borderRadius: 4, padding: '2px 8px', fontSize: size, fontWeight: 700,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

function StatChip({
  label, value, color,
}: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      flex: '1 1 120px', minWidth: 110,
      background: 'var(--surface)', border: `1px solid ${color}30`,
      borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '12px 16px',
    }}>
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

// ─── Tab 1: Agent Inventory ────────────────────────────────────────────────

function AgentCard({ agent }: { agent: AIAgent }) {
  const [open, setOpen] = useState(false);

  const toolRiskColors = agent.tools.map(t => RISK_COLOR[t.riskLevel]);
  const maxToolRisk = toolRiskColors.includes('#FF5252') ? '#FF5252'
    : toolRiskColors.includes('#FF8C00') ? '#FF8C00'
    : toolRiskColors.includes('#FFD600') ? '#FFD600' : '#00E676';

  return (
    <div style={{
      background: 'var(--surface)', border: `1px solid ${STATUS_COLOR[agent.status]}30`,
      borderLeft: `3px solid ${STATUS_COLOR[agent.status]}`, borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 18px', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Bot size={16} color={STATUS_COLOR[agent.status]} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{agent.name}</span>
              <Badge label={agent.status.replace('-', ' ')} color={STATUS_COLOR[agent.status]} />
              <Badge label={agent.riskTier} color={RISK_COLOR[agent.riskTier]} />
              <Badge label={CRITICALITY_LABEL[agent.criticalityLevel]} color={CRITICALITY_COLOR[agent.criticalityLevel]} />
              <Badge label={agent.framework} color="#4FC3F7" />
              <Badge label={`Oversight: ${agent.humanOversight}`} color="#CE93D8" />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{agent.description}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{agent.runsLast30Days} runs/30d</div>
            {open ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
          </div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Tools */}
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tools ({agent.tools.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {agent.tools.map(t => (
                <span key={t.name} style={{
                  background: `${RISK_COLOR[t.riskLevel]}12`,
                  border: `1px solid ${RISK_COLOR[t.riskLevel]}35`,
                  borderRadius: 4, padding: '3px 8px', fontSize: 11,
                  color: RISK_COLOR[t.riskLevel],
                }}>
                  {t.name} <span style={{ opacity: 0.6, fontSize: 9 }}>({t.category})</span>
                </span>
              ))}
            </div>
          </div>

          {/* Token budget */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Token budget usage</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                {agent.avgTokensPerRun.toLocaleString()} avg / {agent.maxTokenBudget.toLocaleString()} max
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((agent.avgTokensPerRun / agent.maxTokenBudget) * 100, 100)}%`,
                background: (agent.avgTokensPerRun / agent.maxTokenBudget) > 0.8 ? '#FF8C00' : 'var(--cyan)',
                borderRadius: 2,
              }} />
            </div>
          </div>

          {/* Permissions + Data Sources */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Permissions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {agent.permissions.map(p => (
                  <span key={p} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Data Sources / Output</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {agent.dataSources.map(s => <span key={s} style={{ fontSize: 10, color: '#4FC3F7', fontFamily: 'monospace' }}>{s}</span>)}
                {agent.outputChannels.map(c => <span key={c} style={{ fontSize: 10, color: '#CE93D8', fontFamily: 'monospace' }}>{c}</span>)}
              </div>
            </div>
          </div>

          {/* Business Impact */}
          <div style={{
            background: `${CRITICALITY_COLOR[agent.criticalityLevel]}08`,
            border: `1px solid ${CRITICALITY_COLOR[agent.criticalityLevel]}30`,
            borderRadius: 6, padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            <strong style={{ color: CRITICALITY_COLOR[agent.criticalityLevel] }}>
              Business Impact ({CRITICALITY_LABEL[agent.criticalityLevel]}):
            </strong>{' '}{agent.businessImpact}
          </div>

          {/* Containment */}
          <div style={{
            background: `${maxToolRisk}08`, border: `1px solid ${maxToolRisk}25`,
            borderRadius: 6, padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            <strong style={{ color: maxToolRisk }}>Containment Policy:</strong> {agent.containmentPolicy}
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Owner: <strong style={{ color: 'var(--text)' }}>{agent.owner}</strong></span>
            <span>Deployed: <strong style={{ color: 'var(--text)' }}>{agent.deployedDate}</strong></span>
            <span>Last Audit: <strong style={{ color: 'var(--text)' }}>{agent.lastAudit}</strong></span>
            <span>Isolation: <strong style={{ color: RISK_COLOR[agent.isolationLevel === 'full' ? 'low' : agent.isolationLevel === 'partial' ? 'medium' : 'critical'] }}>{agent.isolationLevel}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentInventoryTab({ agents }: { agents: AIAgent[] }) {
  const counts = {
    active:          agents.filter(a => a.status === 'active').length,
    sandboxed:       agents.filter(a => a.status === 'sandboxed').length,
    underReview:     agents.filter(a => a.status === 'under-review').length,
    critical:        agents.filter(a => a.riskTier === 'critical').length,
    missionCritical: agents.filter(a => a.criticalityLevel === 'mission-critical').length,
    bizCritical:     agents.filter(a => a.criticalityLevel === 'business-critical').length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatChip label="Total Agents"       value={agents.length}          color="var(--cyan)" />
        <StatChip label="Active"             value={counts.active}          color="#00E676" />
        <StatChip label="Sandboxed"          value={counts.sandboxed}       color="#FFD600" />
        <StatChip label="Under Review"       value={counts.underReview}     color="#FF8C00" />
        <StatChip label="Critical Tier"      value={counts.critical}        color="#FF5252" />
        <StatChip label="Mission Critical"   value={counts.missionCritical} color="#FF5252" />
        <StatChip label="Business Critical"  value={counts.bizCritical}     color="#FF8C00" />
      </div>
      {agents.map(a => <AgentCard key={a.id} agent={a} />)}
    </div>
  );
}

// ─── Tab 2: RAG Security Console ──────────────────────────────────────────

function RAGSourceCard({ source, agents }: { source: RAGDataSource; agents: AIAgent[] }) {
  const [open, setOpen] = useState(false);
  const alerting = source.poisoningDetected || source.anomalousQueries30d > 5;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${alerting ? '#FF5252' : RISK_COLOR[source.riskLevel]}30`,
      borderLeft: `3px solid ${alerting ? '#FF5252' : RISK_COLOR[source.riskLevel]}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Database size={14} color={RISK_COLOR[source.riskLevel]} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{source.name}</span>
              <Badge label={source.type.replace('-', ' ')} color="#4FC3F7" />
              <Badge label={source.classification} color={RISK_COLOR[source.riskLevel]} />
              <Badge label={`Injection: ${source.injectionRisk}`} color={INJECTION_COLOR[source.injectionRisk]} />
              {source.poisoningDetected && <Badge label="⚠ Poisoning Detected" color="#FF5252" />}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {source.documentsIndexed > 0 ? `${source.documentsIndexed.toLocaleString()} docs indexed` : 'Live API — no index'}
              {' · '}{source.anomalousQueries30d} anomalous queries (30d)
              {' · '}{source.linkedAgents.length} agent{source.linkedAgents.length !== 1 ? 's' : ''}
            </div>
          </div>
          {open ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Access Control:</strong> {source.accessControl}
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Linked Agents</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {source.linkedAgents.map(aid => {
                const agent = agents.find(a => a.id === aid);
                return (
                  <span key={aid} style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)',
                  }}>{agent?.name ?? aid}</span>
                );
              })}
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Last Updated: <strong style={{ color: 'var(--text)' }}>{source.lastUpdated}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function RAGConsoleTab({ data }: { data: ArchitectureData }) {
  const { ragSources, ragStats, agents } = data;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatChip label="Data Sources"      value={ragStats.totalSources}     color="var(--cyan)" />
        <StatChip label="Critical Risk"     value={ragStats.criticalRisk}     color="#FF5252" />
        <StatChip label="Poisoning Alerts"  value={ragStats.poisoningAlerts}  color="#FF5252" />
        <StatChip label="Anomalous Queries" value={ragStats.anomalousQueries} color="#FF8C00" />
        <StatChip label="Total Docs"        value={ragStats.totalDocuments.toLocaleString()} color="#4FC3F7" />
      </div>
      {ragSources.sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return order[a.riskLevel] - order[b.riskLevel];
      }).map(s => <RAGSourceCard key={s.id} source={s} agents={agents} />)}
    </div>
  );
}

// ─── Tab 3: Model Provenance Vault ─────────────────────────────────────────

function ModelCard({ model, agents }: { model: ModelProvenance; agents: AIAgent[] }) {
  const [open, setOpen] = useState(false);
  const flagged = model.provenanceStatus === 'flagged' || model.driftStatus === 'significant-drift';

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${flagged ? '#FF5252' : PROVENANCE_COLOR[model.provenanceStatus]}25`,
      borderLeft: `3px solid ${flagged ? '#FF5252' : PROVENANCE_COLOR[model.provenanceStatus]}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <FlaskConical size={14} color={PROVENANCE_COLOR[model.provenanceStatus]} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{model.modelName}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{model.vendor}</span>
              <Badge label={model.provenanceStatus.replace('-', ' ')} color={PROVENANCE_COLOR[model.provenanceStatus]} />
              <Badge label={`Drift: ${model.driftStatus.replace(/-/g, ' ')}`} color={DRIFT_COLOR[model.driftStatus]} />
              <Badge label={`EU AI Act: ${model.euAIActRisk}`} color={EU_COLOR[model.euAIActRisk]} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{model.origin.replace('-', ' ')}</span>
              <span>Score: <strong style={{ color: model.evaluationScore >= 80 ? '#00E676' : model.evaluationScore >= 60 ? '#FFD600' : '#FF5252' }}>{model.evaluationScore}/100</strong></span>
              <span>Supply chain: <strong style={{ color: RISK_COLOR[model.supplyChainRisk] }}>{model.supplyChainRisk}</strong></span>
            </div>
          </div>
          {open ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text)' }}>Training Data:</strong> {model.trainingDataSummary}
          </div>

          {model.knownBiases.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Known Biases</div>
              {model.knownBiases.map(b => (
                <div key={b} style={{ display: 'flex', gap: 6, marginBottom: 3 }}>
                  <AlertTriangle size={11} color="#FF8C00" style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span>Version: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{model.version}</strong></span>
            <span>Evaluated: <strong style={{ color: 'var(--text)' }}>{model.lastEvaluated}</strong></span>
          </div>

          {model.certifications.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {model.certifications.map(c => (
                <span key={c} style={{
                  background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)',
                  color: '#00E676', borderRadius: 4, padding: '2px 8px', fontSize: 10,
                }}>{c}</span>
              ))}
            </div>
          )}

          {model.usedByAgents.length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Used By</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {model.usedByAgents.map(aid => {
                  const agent = agents.find(a => a.id === aid);
                  return <span key={aid} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)' }}>{agent?.name ?? aid}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModelProvenanceTab({ data }: { data: ArchitectureData }) {
  const { models, agents } = data;
  const flagged = models.filter(m => m.provenanceStatus === 'flagged').length;
  const drifting = models.filter(m => ['drifting', 'significant-drift'].includes(m.driftStatus)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatChip label="Models Tracked" value={models.length}                                             color="var(--cyan)" />
        <StatChip label="Verified"        value={models.filter(m => m.provenanceStatus === 'verified').length} color="#00E676" />
        <StatChip label="Flagged"         value={flagged}                                                  color="#FF5252" />
        <StatChip label="Drifting"        value={drifting}                                                 color="#FF8C00" />
        <StatChip label="Avg Eval Score"  value={Math.round(models.reduce((s, m) => s + m.evaluationScore, 0) / models.length)} color="#CE93D8" />
      </div>
      {models.sort((a, b) => {
        const order: Record<string, number> = { flagged: 0, 'under-review': 1, unverified: 2, verified: 3 };
        return (order[a.provenanceStatus] ?? 4) - (order[b.provenanceStatus] ?? 4);
      }).map(m => <ModelCard key={m.id} model={m} agents={agents} />)}
    </div>
  );
}

// ─── Tab 4: Containment Center ─────────────────────────────────────────────

function BoundaryCard({ boundary, agents }: { boundary: ContainmentBoundary; agents: AIAgent[] }) {
  const [open, setOpen] = useState(false);

  const cbIcon = boundary.circuitBreaker === 'closed' ? CheckCircle2
    : boundary.circuitBreaker === 'half-open' ? Clock : XCircle;
  const CbIcon = cbIcon;

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${CIRCUIT_COLOR[boundary.circuitBreaker]}30`,
      borderLeft: `3px solid ${CIRCUIT_COLOR[boundary.circuitBreaker]}`,
      borderRadius: 10, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', cursor: 'pointer' }} onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Shield size={14} color={CIRCUIT_COLOR[boundary.circuitBreaker]} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{boundary.name}</span>
              <Badge label={boundary.type} color="#4FC3F7" />
              <Badge label={boundary.status} color={boundary.status === 'active' ? '#00E676' : '#FF5252'} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CbIcon size={11} color={CIRCUIT_COLOR[boundary.circuitBreaker]} />
                <span style={{ fontSize: 10, color: CIRCUIT_COLOR[boundary.circuitBreaker], fontWeight: 700 }}>
                  {boundary.circuitBreaker.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              {boundary.violations30d > 0 && (
                <Badge label={`${boundary.violations30d} violation${boundary.violations30d > 1 ? 's' : ''}`} color="#FF8C00" />
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{boundary.description}</div>
          </div>
          {open ? <ChevronDown size={13} color="var(--text-muted)" /> : <ChevronRight size={13} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.2)',
            borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#FF8C00',
          }}>
            <strong>Blast Radius:</strong> {boundary.blastRadius}
          </div>

          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Applied to {boundary.agentsAppliedTo.length} agent{boundary.agentsAppliedTo.length !== 1 ? 's' : ''}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {boundary.agentsAppliedTo.map(aid => {
                const agent = agents.find(a => a.id === aid);
                return <span key={aid} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: 'var(--text-muted)' }}>{agent?.name ?? aid}</span>;
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Last Tested: <strong style={{ color: 'var(--text)' }}>{boundary.lastTested}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function ContainmentTab({ data }: { data: ArchitectureData }) {
  const { containmentBoundaries, containmentStats, agents } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatChip label="Boundaries"       value={containmentStats.totalBoundaries}         color="var(--cyan)" />
        <StatChip label="Active"           value={containmentStats.activeBoundaries}         color="#00E676" />
        <StatChip label="Bypassed"         value={containmentStats.bypassedBoundaries}       color="#FF5252" />
        <StatChip label="Violations (30d)" value={containmentStats.totalViolations}          color="#FF8C00" />
        <StatChip label="Critical Agents Contained" value={containmentStats.criticalAgentsContained} color="#FF5252" />
      </div>

      {/* Circuit breaker legend */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
        padding: '10px 14px', display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 11,
      }}>
        {[
          { state: 'closed',    icon: CheckCircle2, label: 'Closed — boundary active and enforced' },
          { state: 'half-open', icon: Clock,        label: 'Half-open — intermittent bypass detected' },
          { state: 'open',      icon: XCircle,      label: 'Open — boundary failed or bypassed' },
        ].map(({ state, icon: Icon, label }) => (
          <div key={state} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={13} color={CIRCUIT_COLOR[state]} />
            <span style={{ color: 'var(--text-muted)' }}><strong style={{ color: CIRCUIT_COLOR[state] }}>{state.replace('-', ' ')}</strong> — {label.split(' — ')[1]}</span>
          </div>
        ))}
      </div>

      {containmentBoundaries.map(b => <BoundaryCard key={b.id} boundary={b} agents={agents} />)}
    </div>
  );
}

// ─── Main View ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'agents',      label: 'Agent Inventory',       icon: Bot },
  { id: 'rag',         label: 'RAG Security',           icon: Database },
  { id: 'provenance',  label: 'Model Provenance Vault', icon: FlaskConical },
  { id: 'containment', label: 'Containment Center',     icon: Shield },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ArchitectureView() {
  const [data,    setData]    = useState<ArchitectureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [tab,     setTab]     = useState<TabId>('agents');

  useEffect(() => {
    ArchitectureService.getData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading architecture data…</div>
    </div>
  );

  if (error || !data) return (
    <div style={{ padding: 32, color: '#FF5252', fontSize: 13 }}>Error: {error || 'Failed to load data'}</div>
  );

  const alerts =
    data.agents.filter(a => a.status === 'sandboxed' || a.status === 'under-review').length +
    data.ragSources.filter(s => s.poisoningDetected).length +
    data.models.filter(m => m.provenanceStatus === 'flagged').length +
    data.containmentBoundaries.filter(b => b.circuitBreaker !== 'closed').length;

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1100 }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Zap size={20} color="var(--cyan)" strokeWidth={1.8} />
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Architecture</h1>
          {alerts > 0 && (
            <span style={{ background: 'rgba(255,82,82,0.15)', color: '#FF5252', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 10, padding: '1px 10px', fontSize: 11, fontWeight: 700 }}>
              {alerts} alert{alerts > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 30 }}>
          Level 5 AI architecture visibility — agent inventory, RAG security, model provenance and containment controls
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 18px', cursor: 'pointer',
                border: 'none', borderBottom: active ? '2px solid var(--cyan)' : '2px solid transparent',
                background: 'transparent', marginBottom: -1,
                color: active ? 'var(--cyan)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: active ? 700 : 500,
                transition: 'color 0.15s',
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'agents'      && <AgentInventoryTab  agents={data.agents} />}
      {tab === 'rag'         && <RAGConsoleTab       data={data} />}
      {tab === 'provenance'  && <ModelProvenanceTab  data={data} />}
      {tab === 'containment' && <ContainmentTab      data={data} />}

    </div>
  );
}
