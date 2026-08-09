import { v4 as uuid } from 'uuid';
import type { ActionItem } from '../models';

function entry(
  actor: string,
  fromStatus: ActionItem['status'] | null,
  toStatus: ActionItem['status'],
  note?: string,
  evidenceId?: string,
) {
  return { id: uuid(), timestamp: new Date().toISOString(), actor, fromStatus, toStatus, note, evidenceId };
}

export const actionItemsData: ActionItem[] = [
  // ── OPEN ──────────────────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Remediate unpatched CVEs in Application Security domain',
    description: 'Three critical CVEs identified in Q2 pen test remain unpatched across 4 production services. Immediate remediation required to reduce residual risk.',
    domain: 'Application Security',
    priority: 'critical',
    status: 'open',
    dueDate: '2026-08-10',
    createdAt: '2026-07-20T09:00:00Z',
    updatedAt: '2026-07-20T09:00:00Z',
    auditLog: [entry('System', null, 'open', 'Action item created from risk register')],
  },
  {
    id: uuid(),
    title: 'Close MFA coverage gap for privileged accounts',
    description: '14 privileged service accounts lack MFA enforcement. IAM policy requires MFA on all accounts with production write access.',
    domain: 'Identity & Access Management',
    priority: 'high',
    status: 'open',
    dueDate: '2026-08-15',
    createdAt: '2026-07-21T11:30:00Z',
    updatedAt: '2026-07-21T11:30:00Z',
    auditLog: [entry('System', null, 'open', 'Action item created from identity risk review')],
  },

  // ── ASSIGNED ──────────────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Implement data residency controls for AI tools processing PII',
    description: 'Four AI tools in the registry have unconfirmed data residency status under GDPR Article 46. Controls must be documented or tools suspended.',
    domain: 'Data Security & Privacy',
    priority: 'high',
    status: 'assigned',
    assignee: 'Priya Nair (Data Privacy Lead)',
    dueDate: '2026-08-20',
    createdAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-07-22T14:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created from data sovereignty review'),
      entry('James Okafor (Risk Manager)', 'open', 'assigned', 'Assigned to Data Privacy Lead for remediation', undefined),
    ],
  },

  // ── IN PROGRESS ───────────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Review and revoke stale third-party vendor API access',
    description: '8 vendor integrations have not been re-certified in 12 months. Access tokens must be reviewed and revoked where no active business justification exists.',
    domain: 'Third-Party & Vendor Risk',
    priority: 'high',
    status: 'in-progress',
    assignee: 'Wei Zhang (IAM Lead)',
    dueDate: '2026-08-05',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-24T09:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created from vendor risk review'),
      entry('Sarah Chen (CISO)', 'open', 'assigned', 'Assigned to IAM Lead'),
      entry('Wei Zhang (IAM Lead)', 'assigned', 'in-progress', 'Started vendor access token review — 3 of 8 vendors reviewed so far'),
    ],
  },
  {
    id: uuid(),
    title: 'Deploy endpoint detection and response (EDR) to remaining 12% of endpoints',
    description: 'EDR coverage is at 88%. Remaining endpoints are legacy systems in the EU DC. Coverage must reach 95% minimum per policy.',
    domain: 'Endpoint Security',
    priority: 'medium',
    status: 'in-progress',
    assignee: 'Marcus Lee (SecOps)',
    dueDate: '2026-08-30',
    createdAt: '2026-07-08T12:00:00Z',
    updatedAt: '2026-07-23T16:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created from endpoint risk review'),
      entry('Sarah Chen (CISO)', 'open', 'assigned', 'Assigned to SecOps'),
      entry('Marcus Lee (SecOps)', 'assigned', 'in-progress', 'Legacy endpoint agent deployment in progress — 6 of 14 legacy hosts updated'),
    ],
  },

  // ── EVIDENCE PROVIDED ─────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Update network segmentation controls for cloud workloads',
    description: 'Cloud network security groups were found overly permissive in the Q2 architecture review. Segmentation must be tightened to principle of least privilege.',
    domain: 'Network & Infrastructure',
    priority: 'high',
    status: 'evidence-provided',
    assignee: 'Aisha Patel (Cloud Security)',
    evidenceId: 'EVD-2026-041',
    dueDate: '2026-07-31',
    createdAt: '2026-07-01T08:00:00Z',
    updatedAt: '2026-07-25T17:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created from cloud architecture review'),
      entry('Sarah Chen (CISO)', 'open', 'assigned', 'Assigned to Cloud Security'),
      entry('Aisha Patel (Cloud Security)', 'assigned', 'in-progress', 'Segmentation rule updates in progress across 3 VPCs'),
      entry('Aisha Patel (Cloud Security)', 'in-progress', 'evidence-provided', 'Network segmentation rules updated. Penetration test report EVD-2026-041 uploaded confirming no lateral movement paths remain.', 'EVD-2026-041'),
    ],
  },

  // ── VERIFIED ──────────────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Enforce DMARC policy on all outbound email domains',
    description: 'DMARC policy was set to monitor-only. Policy must be upgraded to reject to prevent domain spoofing attacks targeting customers.',
    domain: 'Cloud Security',
    priority: 'medium',
    status: 'verified',
    assignee: 'Tom Reeves (IT Security)',
    evidenceId: 'EVD-2026-038',
    dueDate: '2026-07-28',
    createdAt: '2026-06-20T09:00:00Z',
    updatedAt: '2026-07-26T10:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created from cloud security review'),
      entry('James Okafor (Risk Manager)', 'open', 'assigned', 'Assigned to IT Security'),
      entry('Tom Reeves (IT Security)', 'assigned', 'in-progress', 'DMARC configuration changes in progress'),
      entry('Tom Reeves (IT Security)', 'in-progress', 'evidence-provided', 'DMARC policy set to reject across all 4 domains. Email delivery test report EVD-2026-038 attached.', 'EVD-2026-038'),
      entry('Sarah Chen (CISO)', 'evidence-provided', 'verified', 'Evidence reviewed and verified. DMARC reject policy confirmed active via independent DNS lookup.'),
    ],
  },

  // ── CLOSED ────────────────────────────────────────────────────────────────
  {
    id: uuid(),
    title: 'Implement security awareness training for AI tool acceptable use',
    description: 'Following rollout of the AI Registry, all staff must complete mandatory training on acceptable use of AI tools and shadow AI risks.',
    domain: 'AI & Emerging Technology',
    priority: 'medium',
    status: 'closed',
    assignee: 'Rachel Wong (HR & Compliance)',
    evidenceId: 'EVD-2026-029',
    dueDate: '2026-07-15',
    resolvedAt: '2026-07-14T16:00:00Z',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-07-14T16:00:00Z',
    auditLog: [
      entry('System', null, 'open', 'Action item created following AI Registry launch'),
      entry('Sarah Chen (CISO)', 'open', 'assigned', 'Assigned to HR & Compliance'),
      entry('Rachel Wong (HR & Compliance)', 'assigned', 'in-progress', 'Training module developed and scheduled for all staff'),
      entry('Rachel Wong (HR & Compliance)', 'in-progress', 'evidence-provided', '94% staff completion rate achieved. LMS completion report EVD-2026-029 attached.', 'EVD-2026-029'),
      entry('James Okafor (Risk Manager)', 'evidence-provided', 'verified', 'Completion rate verified against HR records. Meets 90% policy threshold.'),
      entry('Sarah Chen (CISO)', 'verified', 'closed', 'Action item closed. Residual risk accepted. Annual recertification scheduled for June 2027.'),
    ],
  },
];
