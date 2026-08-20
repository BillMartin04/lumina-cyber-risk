// ─── Primitive types ───────────────────────────────────────────────────────
export type RiskLevel       = 'critical' | 'high' | 'medium' | 'low';

// ─── AI Registry types ─────────────────────────────────────────────────────
export type AIToolStatus       = 'approved' | 'pending' | 'prohibited' | 'under-review' | 'retired';
export type AIToolCategory     = 'generative-ai' | 'code-assistant' | 'data-analysis' | 'automation' | 'search-ai' | 'image-generation' | 'writing-assistant';
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface AIRegistryApprovalEvent {
  date:   string;
  action: string;
  actor:  string;
  note:   string;
}

export interface AIRegistryTool {
  id:                  string;
  name:                string;
  vendor:              string;
  category:            AIToolCategory;
  status:              AIToolStatus;
  riskRating:          RiskLevel;
  dataClassification:  DataClassification[];
  prohibitedDataTypes: string[];
  businessOwner:       string;
  department:          string;
  useCase:             string;
  description:         string;
  approvedDate?:       string;
  reviewDate:          string;
  nextReviewDate:      string;
  controls:            string[];
  monthlyUsers:        number;
  monthlyCost:         number;
  licenseType:         string;
  dataResidency:       string;
  prohibitionReason?:  string;
  approvalHistory:     AIRegistryApprovalEvent[];
}

export interface AIRegistryStats {
  total:      number;
  approved:   number;
  pending:    number;
  prohibited: number;
  underReview: number;
  totalMonthlyCost: number;
  totalMonthlyUsers: number;
}
// ─── Data Sovereignty types ────────────────────────────────────────────────
export type SovereigntyRisk  = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type ComplianceStatus = 'compliant' | 'non-compliant' | 'adequate' | 'unknown';
export type DataRegion       = 'us' | 'eu' | 'uk' | 'apac' | 'cn' | 'unknown';

export interface DataSovereigntyCompliance {
  gdpr:   ComplianceStatus;
  ccpa:   ComplianceStatus;
  apra:   ComplianceStatus;
  ukGdpr: ComplianceStatus;
}

export interface DataSovereigntyEntry {
  id:                   string;
  toolId:               string;
  toolName:             string;
  vendor:               string;
  status:               AIToolStatus;
  dataResidency:        string;
  region:               DataRegion;
  processingRegions:    string[];
  crossBorderTransfer:  boolean;
  transferMechanisms:   string[];
  compliance:           DataSovereigntyCompliance;
  dataTypesProcessed:   string[];
  retentionPeriod:      string;
  encryptionInTransit:  boolean;
  encryptionAtRest:     boolean;
  thirdPartySharing:    boolean;
  sovereigntyRisk:      SovereigntyRisk;
  certifications:       string[];
  notes:                string;
}

export interface DataSovereigntyStats {
  total:              number;
  criticalRisk:       number;
  highRisk:           number;
  crossBorderCount:   number;
  gdprCompliant:      number;
  unknownResidency:   number;
}

export type ControlStatus   = 'implemented' | 'partial' | 'not-implemented' | 'not-applicable';
export type ControlType     = 'preventive' | 'detective' | 'corrective' | 'compensating';
export type TrendDirection  = 'improving' | 'stable' | 'degrading';
export type RiskLifecycle   = 'draft' | 'assess' | 'respond' | 'review' | 'monitor' | 'retired';
export type MaturityLevel   = 'ad-hoc' | 'systemized' | 'optimized' | 'connected' | 'integrated';
export type IssueStatus     = 'open' | 'in-progress' | 'pending-review' | 'closed';
export type KRIStatus       = 'within' | 'at-risk' | 'breach';
export type AutomationLevel = 'manual' | 'semi-automated' | 'automated';
export type AttestFrequency = 'annual' | 'semi-annual' | 'quarterly' | 'monthly';

// ─── Core entities ─────────────────────────────────────────────────────────
export interface Control {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  status: ControlStatus;
  effectiveness: number;         // 0–100
  owner: string;
  lastAttested: string;          // ISO date
  nextAttestation: string;       // ISO date
  frequency: AttestFrequency;
  automationLevel: AutomationLevel;
  framework?: string;
}

export interface Issue {
  id: string;
  title: string;
  severity: RiskLevel;
  status: IssueStatus;
  owner: string;
  dueDate: string;               // ISO date
  daysOverdue?: number;
  rootCause?: string;
}

export interface Risk {
  id: string;
  name: string;
  description: string;
  businessImpact: string;
  likelihood: RiskLevel;
  impact: RiskLevel;
  inherentRisk: RiskLevel;
  inherentScore: number;         // 0–100
  residualRisk: RiskLevel;
  residualScore: number;         // 0–100
  owner: string;
  businessUnit: string;
  lifecycle: RiskLifecycle;
  controls: Control[];
  issues: Issue[];
  lastAssessed: string;          // ISO date
  nextReview: string;            // ISO date
  trend: TrendDirection;
  regulatoryRefs: string[];
}

export interface KRI {
  id: string;
  name: string;
  value: number;
  threshold: number;
  unit: string;
  trend: TrendDirection;
  status: KRIStatus;
}

export interface Domain {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  color: string;
  description: string;
  risks: Risk[];
  riskScore: number;             // 0–100
  trend: TrendDirection;
  lastAssessed: string;          // ISO date
  owner: string;
  ownerRole: string;
  kris: KRI[];
  maturityLevel: MaturityLevel;
}

// ─── Evidence Traceability types ───────────────────────────────────────────
export type EvidenceType =
  | 'test-result'
  | 'attestation'
  | 'assessment-report'
  | 'exception-approval'
  | 'remediation-proof'
  | 'audit-finding';

export type EvidenceStatus  = 'current' | 'superseded' | 'expired' | 'pending-review';
export type AuditRating     = 'satisfactory' | 'needs-improvement' | 'unsatisfactory';

export interface EvidenceArtifact {
  id:              string;
  title:           string;
  type:            EvidenceType;
  status:          EvidenceStatus;
  domainIds:       string[];        // which domains this covers
  riskIds:         string[];        // specific risk IDs this supports
  controlIds:      string[];        // specific control IDs
  author:          string;
  reviewer:        string;
  createdDate:     string;          // ISO date
  reviewedDate:    string;          // ISO date
  expiryDate?:     string;
  summary:         string;
  outcome:         string;          // what the artifact shows / concludes
  auditRating?:    AuditRating;
  regulatoryRef:   string[];
  linkedDecision?: string;          // decision ID if applicable
}

export interface AuditTrailEntry {
  id:          string;
  timestamp:   string;             // ISO datetime
  actor:       string;
  action:      string;
  entity:      string;             // what was changed (e.g. 'Risk: Excessive Privileged Access')
  entityType:  'risk' | 'control' | 'issue' | 'exception' | 'policy' | 'kri' | 'evidence';
  domainId?:   string;
  riskId?:     string;
  detail:      string;
  outcome:     'approved' | 'updated' | 'escalated' | 'closed' | 'created' | 'rejected';
}

export interface AttestationRecord {
  id:          string;
  domain:      string;
  domainId:    string;
  attester:    string;
  role:        string;
  period:      string;             // e.g. 'Q2 2026'
  attestedDate: string;
  nextDue:     string;
  status:      'complete' | 'overdue' | 'pending';
  riskCount:   number;
  controlCount: number;
  exceptionsNoted: number;
}

export interface EvidenceStats {
  totalArtifacts:     number;
  currentArtifacts:   number;
  expiredArtifacts:   number;
  pendingReview:      number;
  attestationsComplete: number;
  attestationsOverdue:  number;
  auditFindings:      number;
  unsatisfactoryRatings: number;
}

// ─── Resilience & Business Impact types ────────────────────────────────────
export type ServiceTier         = 'tier-1' | 'tier-2' | 'tier-3';
export type PlaybookStatus      = 'tested' | 'draft' | 'outdated' | 'not-started';
export type ExerciseType        = 'tabletop' | 'simulation' | 'live-fire' | 'walkthrough';
export type IncidentCategory    = 'ransomware' | 'data-breach' | 'ddos' | 'insider-threat' | 'supply-chain' | 'cloud-outage';

export interface MetricPoint {
  quarter:  string;    // e.g. 'Q3 2025'
  mttd:     number;    // hours
  mttc:     number;    // hours
  mttr:     number;    // hours
}

export interface IncidentCategoryMetric {
  category:     IncidentCategory;
  label:        string;
  mttd:         number;
  mttc:         number;
  mttr:         number;
  incidentCount: number;
  trend:        TrendDirection;
}

export interface BusinessService {
  id:                  string;
  name:                string;
  description:         string;
  tier:                ServiceTier;
  rto:                 number;    // hours — Recovery Time Objective
  rpo:                 number;    // hours — Recovery Point Objective
  cyberDependencies:   string[];  // domain IDs
  dataClasses:         string[];
  regulatoryObligation: string[];
  customerImpact:      string;
  annualRevenueAtRisk: number;    // $M
  lastTestedRto:       string;    // ISO date
  rtoMet:              boolean;
}

export interface DetectionCoverage {
  domainId:    string;
  domainName:  string;
  domainColor: string;
  coverage:    number;    // 0-100 %
  alertsLast30Days: number;
  falsePositiveRate: number;  // %
  detectionGaps:    string[];
}

export interface Playbook {
  id:           string;
  name:         string;
  scenario:     IncidentCategory;
  version:      string;
  status:       PlaybookStatus;
  readiness:    number;    // 0-100
  owner:        string;
  lastTested:   string;
  nextTest:     string;
  steps:        number;
  automatedSteps: number;
}

export interface ScenarioExercise {
  id:           string;
  name:         string;
  type:         ExerciseType;
  scenario:     string;
  date:         string;
  participants: number;
  duration:     string;
  findingsCount: number;
  criticalFindings: number;
  closedFindings:   number;
  score:        number;   // 0-100
  nextExercise: string;
}

export interface ResilienceStats {
  avgMTTD:          number;   // hours
  avgMTTC:          number;   // hours
  avgMTTR:          number;   // hours
  mttdTarget:       number;
  mttcTarget:       number;
  mttrTarget:       number;
  detectionRate:    number;   // %
  detectionTarget:  number;
  playbooksTested:  number;
  playbooksTotal:   number;
  criticalServices: number;
  servicesRTOMet:   number;
  lastExerciseDays: number;
}

// ─── Governance Layer types ────────────────────────────────────────────────
export type ExceptionStatus      = 'active' | 'expired' | 'pending-renewal' | 'revoked';
export type EscalationTier       = 'risk-owner' | 'ciso' | 'cro' | 'board';
export type DecisionOutcome      = 'approved' | 'rejected' | 'deferred' | 'noted';
export type CommitteeFrequency   = 'monthly' | 'quarterly' | 'bi-annual' | 'annual' | 'ad-hoc';
export type PolicyStatus         = 'current' | 'under-review' | 'overdue' | 'draft';

export interface AppetiteThreshold {
  level:       RiskLevel;
  label:       string;
  maxAllowed:  number;           // maximum tolerated risk count at this level
  current:     number;
  breached:    boolean;
}

export interface RiskAppetite {
  statement:       string;
  overallTolerance: RiskLevel;
  thresholds:      AppetiteThreshold[];
  approvedBy:      string;
  approvedDate:    string;
  nextReview:      string;
  boardEndorsed:   boolean;
}

export interface RiskException {
  id:              string;
  title:           string;
  domainId:        string;
  domainName:      string;
  controlId:       string;
  controlName:     string;
  justification:   string;
  compensatingControl: string;
  residualRisk:    RiskLevel;
  approver:        string;
  approvedDate:    string;
  expiryDate:      string;
  status:          ExceptionStatus;
  reviewDate:      string;
}

export interface EscalationRule {
  tier:        EscalationTier;
  label:       string;
  triggers:    string[];
  notifyRoles: string[];
  sla:         string;           // e.g. "4 hours"
  channel:     string;
}

export interface GovernanceCommittee {
  id:          string;
  name:        string;
  shortName:   string;
  chair:       string;
  members:     string[];
  frequency:   CommitteeFrequency;
  remit:       string;
  lastMeeting: string;
  nextMeeting: string;
  openActions: number;
}

export interface GovernanceDecision {
  id:          string;
  date:        string;
  committee:   string;
  title:       string;
  outcome:     DecisionOutcome;
  rationale:   string;
  owner:       string;
  dueDate?:    string;
  closed:      boolean;
}

export interface PolicyRecord {
  id:            string;
  name:          string;
  version:       string;
  owner:         string;
  domains:       string[];
  status:        PolicyStatus;
  lastReviewed:  string;
  nextReview:    string;
  regulatoryRef: string[];
}

export interface GovernanceStats {
  activeExceptions:      number;
  expiringIn30Days:      number;
  openDecisions:         number;
  overdueActions:        number;
  policiesOverdue:       number;
  appetiteBreached:      boolean;
  breachedLevels:        RiskLevel[];
  committees:            number;
}

// ─── AI Governance types ───────────────────────────────────────────────────
export type AIRiskTier         = 'critical' | 'high' | 'medium' | 'low';
export type AIDeploymentStatus = 'production' | 'pilot' | 'review' | 'retired' | 'blocked';
export type AIApprovalStatus   = 'approved' | 'approved-conditions' | 'pending' | 'rejected' | 'under-review';
export type AIModelType        = 'classification' | 'regression' | 'nlp' | 'llm' | 'generative' | 'graph-neural-network' | 'ensemble' | 'computer-vision';
export type NISTAIRMFFunction  = 'govern' | 'map' | 'measure' | 'manage';
export type OWASPLLMCategory   =
  | 'LLM01' | 'LLM02' | 'LLM03' | 'LLM04' | 'LLM05'
  | 'LLM06' | 'LLM07' | 'LLM08' | 'LLM09' | 'LLM10';
export type HumanOversightLevel = 'full' | 'partial' | 'minimal' | 'none';
export type TestResultStatus    = 'pass' | 'fail' | 'partial' | 'not-tested';

export interface AITestResult {
  testName:  string;
  result:    TestResultStatus;
  lastRun:   string;           // ISO date
  score?:    number;           // 0–100 where applicable
  notes?:    string;
}

export interface AIModel {
  id:                  string;
  name:                string;
  shortName:           string;
  description:         string;
  modelType:           AIModelType;
  vendor:              string;
  vendorProduct?:      string;
  businessOwner:       string;
  technicalOwner:      string;
  businessUnit:        string;
  useCase:             string;
  deploymentLocation:  'on-premise' | 'cloud' | 'hybrid' | 'saas';
  deploymentStatus:    AIDeploymentStatus;
  approvalStatus:      AIApprovalStatus;
  approvedDate?:       string;
  nextReview:          string;
  riskTier:            AIRiskTier;
  riskScore:           number;               // 0–100
  dataCategories:      string[];
  customerFacing:      boolean;
  regulatoryRefs:      string[];
  owaspThreats:        OWASPLLMCategory[];
  testResults:         AITestResult[];
  openIssues:          number;
  humanOversight:      HumanOversightLevel;
  nistRMFCoverage:     Record<NISTAIRMFFunction, number>;  // 0–100 maturity per function
}

export interface OWASPThreat {
  id:              OWASPLLMCategory;
  name:            string;
  description:     string;
  affectedModels:  number;
  mitigatedModels: number;
  severity:        RiskLevel;
  controlExamples: string[];
}

export interface NISTAIRMFDomain {
  function:    NISTAIRMFFunction;
  label:       string;
  description: string;
  maturity:    number;           // 0–100
  categories:  string[];
  gaps:        string[];
}

export interface ShadowAIIncident {
  tool:      string;
  incidents: number;
  trend:     TrendDirection;
  risk:      AIRiskTier;
}

export interface AIGovernanceStats {
  totalModels:             number;
  productionModels:        number;
  criticalRiskModels:      number;
  highRiskModels:          number;
  pendingApproval:         number;
  totalOpenIssues:         number;
  shadowAIIncidents:       number;
  avgNISTCoverage:         number;
  owaspThreatsIdentified:  number;
  owaspThreatsMitigated:   number;
}

// ─── AI FinOps types ────────────────────────────────────────────────────────
export type AISpendStatus = 'sanctioned' | 'shadow';

export interface AIFinOpsMonthlyTrend {
  month:           string;   // 'Jan 2026'
  sanctionedSpend: number;   // AUD $
  shadowSpend:     number;
  totalTokens:     number;   // millions
  decisions:       number;   // risk decisions supported
}

export interface AIToolSpend {
  toolId:        string;
  toolName:      string;
  vendor:        string;
  category:      string;
  status:        AISpendStatus;
  department:    string;
  monthlySpend:  number;
  tokenUsage:    number;     // tokens/month (millions)
  users:         number;
  dataRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  discoveredVia?: string;    // shadow AI only
}

export interface DepartmentSpend {
  department:      string;
  sanctionedSpend: number;
  shadowSpend:     number;
  totalSpend:      number;
  topTool:         string;
  riskFlag:        boolean;  // true when shadow > 20% of dept spend
}

export interface AIFinOpsStats {
  totalMonthlySpend:    number;
  sanctionedSpend:      number;
  shadowSpend:          number;
  shadowPercentage:     number;
  totalTokensThisMonth: number;  // millions
  costPerRiskDecision:  number;
  toolCount:            number;
  shadowToolCount:      number;
  departmentCount:      number;
  budgetUtilisation:    number;  // pct of monthly budget used
}

export interface AIFinOpsData {
  stats:               AIFinOpsStats;
  monthlyTrend:        AIFinOpsMonthlyTrend[];
  toolSpend:           AIToolSpend[];
  departmentBreakdown: DepartmentSpend[];
  reportingPeriod:     string;
  monthlyBudget:       number;
}

// ─── Scoring Methodology types ─────────────────────────────────────────────
export interface DomainWeight {
  domainId:       string;
  domainName:     string;
  weight:         number;   // percentage 0–100
  currentScore:   number;   // 0–100
  weightedScore:  number;   // weight/100 × currentScore
  color:          string;
  rationale:      string;
}

export interface ScoreBand {
  label:       'Critical' | 'High' | 'Medium' | 'Low';
  min:         number;
  max:         number;
  color:       string;
  description: string;
  action:      string;
}

export interface LikelihoodImpactCell {
  likelihood: number;  // 1–5
  impact:     number;  // 1–5
  rawScore:   number;  // L × I
  label:      'Critical' | 'High' | 'Medium' | 'Low';
  color:      string;
}

export interface FrameworkRange {
  ourScoreMin:    number;
  ourScoreMax:    number;
  frameworkLevel: string;
  description:    string;
}

export interface FrameworkCalibration {
  framework:  string;
  version:    string;
  ranges:     FrameworkRange[];
}

export interface ControlEffectivenessExample {
  domain:              string;
  inherentScore:       number;
  controlEffectiveness: number;  // pct
  residualScore:       number;
}

export interface ScoringMethodology {
  compositeScore:               number;
  compositeFormula:             string;
  domainWeights:                DomainWeight[];
  scoreBands:                   ScoreBand[];
  likelihoodImpactMatrix:       LikelihoodImpactCell[];
  controlEffectivenessFormula:  string;
  controlExamples:              ControlEffectivenessExample[];
  frameworkCalibrations:        FrameworkCalibration[];
  lastUpdated:                  string;
}

// ─── Service view-model types ───────────────────────────────────────────────
export interface RiskCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface ControlStats {
  total: number;
  implemented: number;
  partial: number;
  notImplemented: number;
  notApplicable: number;
  avgEffectiveness: number;
}

export interface OverallStats {
  totalRisks: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  openIssues: number;
  overdueIssues: number;
  totalControls: number;
  implementedControls: number;
  partialControls: number;
  overallScore: number;
}

export interface KRIWithDomain extends KRI {
  domainName: string;
  domainColor: string;
}

export interface RiskActionItem extends Issue {
  riskName: string;
  domainId: string;
  domainName: string;
  riskId: string;
}

// ─── Identity & Access ──────────────────────────────────────────────────────
export type IdentityType   = 'human' | 'service-account' | 'machine' | 'third-party' | 'api-key';
export type IdentityRole   = 'admin' | 'ciso' | 'risk-owner' | 'analyst' | 'auditor' | 'viewer' | 'board';
export type IdentityStatus = 'active' | 'suspended' | 'pending' | 'offboarded' | 'expired';
export type AccessLevel    = 'full' | 'read-write' | 'read-only' | 'restricted' | 'none';

export interface DomainPermission {
  domainId:   string;
  domainName: string;
  access:     AccessLevel;
}

export interface Identity {
  id:                string;
  displayName:       string;
  email:             string;
  department:        string;
  type:              IdentityType;
  role:              IdentityRole;
  status:            IdentityStatus;
  accessLevel:       AccessLevel;
  domainPermissions: DomainPermission[];
  mfaEnabled:        boolean;
  privileged:        boolean;
  lastLogin:         string;   // ISO date
  createdAt:         string;   // ISO date
  reviewedAt:        string;   // ISO date
  nextReview:        string;   // ISO date
  expiresAt?:        string;   // ISO date — for service/machine/api-key
  riskScore:         number;   // 0–100 calculated from access breadth + behaviour
  tags:              string[];
}

export interface IdentityStats {
  total:      number;
  active:     number;
  suspended:  number;
  pending:    number;
  privileged: number;
  mfaEnabled: number;
  mfaCoverage: number;  // pct
  reviewOverdue: number;
  highRisk:   number;
  byType:     Record<IdentityType, number>;
  byRole:     Record<IdentityRole, number>;
}

export interface AccessReviewItem {
  identityId:  string;
  displayName: string;
  email:       string;
  domainId:    string;
  domainName:  string;
  currentAccess: AccessLevel;
  lastUsed:    string;
  recommended: AccessLevel;
  reason:      string;
}

// ─── Level 5 Architecture types ────────────────────────────────────────────
export type AgentStatus    = 'active' | 'sandboxed' | 'retired' | 'under-review';
export type AgentFramework = 'langgraph' | 'langchain' | 'custom' | 'openai-assistant' | 'autogen';
export type OversightLevel = 'full' | 'partial' | 'minimal' | 'autonomous';
export type ToolCategory   = 'read' | 'write' | 'execute' | 'communicate';

export interface AgentTool {
  name:      string;
  category:  ToolCategory;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AIAgent {
  id:               string;
  name:             string;
  description:      string;
  framework:        AgentFramework;
  status:           AgentStatus;
  riskTier:         'low' | 'medium' | 'high' | 'critical';
  humanOversight:   OversightLevel;
  tools:            AgentTool[];
  permissions:      string[];
  dataSources:      string[];
  outputChannels:   string[];
  maxTokenBudget:   number;
  avgTokensPerRun:  number;
  runsLast30Days:   number;
  owner:            string;
  deployedDate:     string;
  lastAudit:        string;
  containmentPolicy: string;
  isolationLevel:   'full' | 'partial' | 'none';
}

export type RAGSourceType  = 'vector-db' | 'document-store' | 'live-api' | 'database' | 'web-scrape';
export type InjectionRisk  = 'high' | 'medium' | 'low' | 'mitigated';

export interface RAGDataSource {
  id:                  string;
  name:                string;
  type:                RAGSourceType;
  classification:      'public' | 'internal' | 'confidential' | 'restricted';
  riskLevel:           'low' | 'medium' | 'high' | 'critical';
  injectionRisk:       InjectionRisk;
  documentsIndexed:    number;
  lastUpdated:         string;
  accessControl:       string;
  poisoningDetected:   boolean;
  anomalousQueries30d: number;
  linkedAgents:        string[];
}

export interface RAGConsoleStats {
  totalSources:      number;
  criticalRisk:      number;
  poisoningAlerts:   number;
  anomalousQueries:  number;
  totalDocuments:    number;
}

export type ModelOrigin      = 'commercial-api' | 'open-source' | 'fine-tuned' | 'proprietary';
export type ProvenanceStatus = 'verified' | 'unverified' | 'flagged' | 'under-review';
export type DriftStatus      = 'stable' | 'drifting' | 'significant-drift' | 'unknown';
export type EUAIActRisk      = 'minimal' | 'limited' | 'high' | 'unacceptable';

export interface ModelProvenance {
  id:                  string;
  modelName:           string;
  vendor:              string;
  version:             string;
  origin:              ModelOrigin;
  provenanceStatus:    ProvenanceStatus;
  trainingDataSummary: string;
  knownBiases:         string[];
  evaluationScore:     number;
  driftStatus:         DriftStatus;
  lastEvaluated:       string;
  supplyChainRisk:     'low' | 'medium' | 'high' | 'critical';
  certifications:      string[];
  usedByAgents:        string[];
  euAIActRisk:         EUAIActRisk;
}

export type ContainmentStatus    = 'active' | 'bypassed' | 'failed' | 'testing';
export type CircuitBreakerState  = 'closed' | 'open' | 'half-open';
export type ContainmentBoundaryType = 'network' | 'data' | 'compute' | 'output' | 'temporal';

export interface ContainmentBoundary {
  id:               string;
  name:             string;
  type:             ContainmentBoundaryType;
  status:           ContainmentStatus;
  agentsAppliedTo:  string[];
  description:      string;
  blastRadius:      string;
  lastTested:       string;
  circuitBreaker:   CircuitBreakerState;
  violations30d:    number;
}

export interface ContainmentStats {
  totalBoundaries:          number;
  activeBoundaries:         number;
  bypassedBoundaries:       number;
  totalViolations:          number;
  criticalAgentsContained:  number;
}

export interface ArchitectureData {
  agents:               AIAgent[];
  ragSources:           RAGDataSource[];
  ragStats:             RAGConsoleStats;
  models:               ModelProvenance[];
  containmentBoundaries: ContainmentBoundary[];
  containmentStats:     ContainmentStats;
}

// ─── Wave 4A — Action Items (Closed Loop Remediation) ──────────────────────

export type ActionItemStatus =
  | 'open'
  | 'assigned'
  | 'in-progress'
  | 'evidence-provided'
  | 'verified'
  | 'closed';

export type ActionItemPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AuditLogEntry {
  id:          string;
  timestamp:   string;
  actor:       string;
  fromStatus:  ActionItemStatus | null;
  toStatus:    ActionItemStatus;
  note?:       string;
  evidenceId?: string;
}

export interface ActionItem {
  id:              string;
  title:           string;
  description:     string;
  domain:          string;
  priority:        ActionItemPriority;
  status:          ActionItemStatus;
  assignee?:       string;
  evidenceId?:     string;
  dueDate?:        string;
  createdAt:       string;
  updatedAt:       string;
  resolvedAt?:     string;
  auditLog:        AuditLogEntry[];
}

export interface ActionItemStats {
  total:            number;
  open:             number;
  assigned:         number;
  inProgress:       number;
  evidenceProvided: number;
  verified:         number;
  closed:           number;
  overdue:          number;
}

export interface ActionItemsData {
  items: ActionItem[];
  stats: ActionItemStats;
}

// ─── Control Performance Testing ───────────────────────────────────────────
export type ControlTestResult = 'pass' | 'partial' | 'fail';
export type ControlTestType   = 'automated' | 'manual' | 'penetration-test';

export interface ControlTest {
  id:          string;
  controlId:   string;
  controlName: string;
  domain:      string;
  testType:    ControlTestType;
  result:      ControlTestResult;
  tester:      string;
  testedAt:    string;
  nextTestDue: string;
  evidenceRef: string;
  score:       number;
  notes:       string;
  findings:    string[];
}

export interface ControlTestStats {
  total:        number;
  pass:         number;
  partial:      number;
  fail:         number;
  avgScore:     number;
  overdueTests: number;
}

export interface ControlTestsData {
  tests: ControlTest[];
  stats: ControlTestStats;
}
