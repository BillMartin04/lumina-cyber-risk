import { useMemo, useState } from 'react';

export type ObligationStatus = 'compliant' | 'partial' | 'non-compliant' | 'under-review';
export type ObligationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ComplianceObligation {
  id: string;
  framework: string;
  reference: string;
  title: string;
  description: string;
  category: string;
  status: ObligationStatus;
  owner: string;
  dueDate: string;
  lastReviewed: string;
  linkedControls: number;
  evidenceCount: number;
  priority: ObligationPriority;
}

const OBLIGATIONS: ComplianceObligation[] = [
  // SOX
  { id: 'sox-1',  framework: 'SOX',       reference: 'SOX §302',        title: 'CEO/CFO Certification of Financial Reports',       description: 'CEO and CFO must certify accuracy of quarterly and annual financial reports.',                               category: 'Financial Reporting',   status: 'compliant',      owner: 'CFO Office',          dueDate: '2026-12-31', lastReviewed: '2026-09-01', linkedControls: 8,  evidenceCount: 12, priority: 'critical' },
  { id: 'sox-2',  framework: 'SOX',       reference: 'SOX §404',        title: 'Internal Control over Financial Reporting',        description: 'Management must assess effectiveness of internal controls over financial reporting annually.',                  category: 'Internal Controls',    status: 'partial',        owner: 'Internal Audit',      dueDate: '2026-12-15', lastReviewed: '2026-08-20', linkedControls: 14, evidenceCount: 9,  priority: 'critical' },
  { id: 'sox-3',  framework: 'SOX',       reference: 'SOX §409',        title: 'Real-Time Disclosure of Material Changes',         description: 'Disclose material changes to financial condition or operations on a rapid and current basis.',                   category: 'Financial Reporting',   status: 'compliant',      owner: 'Legal & Compliance',  dueDate: '2026-12-31', lastReviewed: '2026-09-05', linkedControls: 4,  evidenceCount: 6,  priority: 'high' },
  { id: 'sox-4',  framework: 'SOX',       reference: 'SOX §802',        title: 'Document Retention and Destruction Policies',      description: 'Establish and enforce policies for retention and destruction of audit-related documents.',                       category: 'Records Management',   status: 'compliant',      owner: 'Records Management',  dueDate: '2027-01-31', lastReviewed: '2026-07-10', linkedControls: 5,  evidenceCount: 8,  priority: 'high' },

  // GDPR
  { id: 'gdpr-1', framework: 'GDPR',      reference: 'GDPR Art. 5',     title: 'Principles of Personal Data Processing',           description: 'Personal data must be processed lawfully, fairly, transparently, and limited to specified purposes.',           category: 'Data Processing',       status: 'compliant',      owner: 'Data Protection Officer', dueDate: '2026-12-31', lastReviewed: '2026-08-15', linkedControls: 10, evidenceCount: 15, priority: 'critical' },
  { id: 'gdpr-2', framework: 'GDPR',      reference: 'GDPR Art. 17',    title: 'Right to Erasure (Right to be Forgotten)',         description: 'Individuals have the right to request erasure of personal data without undue delay.',                           category: 'Data Subject Rights',  status: 'partial',        owner: 'Data Protection Officer', dueDate: '2026-11-30', lastReviewed: '2026-08-01', linkedControls: 6,  evidenceCount: 4,  priority: 'high' },
  { id: 'gdpr-3', framework: 'GDPR',      reference: 'GDPR Art. 32',    title: 'Security of Processing',                           description: 'Implement appropriate technical and organisational measures to ensure data security.',                        category: 'Data Security',         status: 'partial',        owner: 'CISO',                dueDate: '2026-10-31', lastReviewed: '2026-09-10', linkedControls: 12, evidenceCount: 7,  priority: 'critical' },
  { id: 'gdpr-4', framework: 'GDPR',      reference: 'GDPR Art. 33',    title: 'Breach Notification to Supervisory Authority',     description: 'Notify supervisory authority of personal data breaches within 72 hours of becoming aware.',                    category: 'Incident Response',    status: 'compliant',      owner: 'CISO',                dueDate: '2026-12-31', lastReviewed: '2026-09-02', linkedControls: 7,  evidenceCount: 10, priority: 'critical' },
  { id: 'gdpr-5', framework: 'GDPR',      reference: 'GDPR Art. 35',    title: 'Data Protection Impact Assessment (DPIA)',         description: 'Conduct DPIA for processing likely to result in high risk to individuals.',                                    category: 'Risk Assessment',       status: 'under-review',   owner: 'Data Protection Officer', dueDate: '2026-10-15', lastReviewed: '2026-07-20', linkedControls: 3,  evidenceCount: 2,  priority: 'high' },

  // NIST CSF
  { id: 'nist-1', framework: 'NIST-CSF',  reference: 'CSF ID.AM-1',     title: 'Physical Device Inventory',                        description: 'Maintain an inventory of physical devices and systems within the organisation.',                              category: 'Asset Management',     status: 'compliant',      owner: 'IT Operations',       dueDate: '2026-12-31', lastReviewed: '2026-09-01', linkedControls: 5,  evidenceCount: 8,  priority: 'high' },
  { id: 'nist-2', framework: 'NIST-CSF',  reference: 'CSF PR.AC-1',     title: 'Identity and Credential Management',               description: 'Manage identities and credentials for authorised devices, users, and processes.',                             category: 'Access Control',       status: 'partial',        owner: 'IAM Team',            dueDate: '2026-10-31', lastReviewed: '2026-08-10', linkedControls: 9,  evidenceCount: 6,  priority: 'critical' },
  { id: 'nist-3', framework: 'NIST-CSF',  reference: 'CSF DE.CM-1',     title: 'Network Monitoring',                               description: 'Monitor the network to detect potential cybersecurity events.',                                              category: 'Detection',             status: 'compliant',      owner: 'SOC',                 dueDate: '2026-12-31', lastReviewed: '2026-09-08', linkedControls: 7,  evidenceCount: 11, priority: 'high' },
  { id: 'nist-4', framework: 'NIST-CSF',  reference: 'CSF RS.RP-1',     title: 'Incident Response Plan Execution',                 description: 'Response plan is executed during or after an event.',                                                       category: 'Incident Response',    status: 'partial',        owner: 'CISO',                dueDate: '2026-11-15', lastReviewed: '2026-07-25', linkedControls: 6,  evidenceCount: 4,  priority: 'high' },
  { id: 'nist-5', framework: 'NIST-CSF',  reference: 'CSF RC.RP-1',     title: 'Recovery Plan Execution',                          description: 'Recovery plan is executed during or after a cybersecurity incident.',                                        category: 'Recovery',             status: 'under-review',   owner: 'IT Operations',       dueDate: '2026-10-31', lastReviewed: '2026-06-30', linkedControls: 4,  evidenceCount: 3,  priority: 'medium' },

  // ISO 27001
  { id: 'iso-1',  framework: 'ISO-27001', reference: 'ISO A.9.1',       title: 'Access Control Policy',                            description: 'Establish, document, and review access control policy based on business and security requirements.',          category: 'Access Control',       status: 'compliant',      owner: 'IAM Team',            dueDate: '2027-01-31', lastReviewed: '2026-09-05', linkedControls: 11, evidenceCount: 14, priority: 'critical' },
  { id: 'iso-2',  framework: 'ISO-27001', reference: 'ISO A.12.6',      title: 'Management of Technical Vulnerabilities',          description: 'Obtain timely information about technical vulnerabilities and take appropriate measures.',                    category: 'Vulnerability Mgmt',   status: 'partial',        owner: 'Security Engineering', dueDate: '2026-10-31', lastReviewed: '2026-08-20', linkedControls: 8,  evidenceCount: 5,  priority: 'high' },
  { id: 'iso-3',  framework: 'ISO-27001', reference: 'ISO A.16.1',      title: 'Management of Information Security Incidents',     description: 'Ensure consistent and effective approach to incident management including communication.',                    category: 'Incident Management',  status: 'compliant',      owner: 'CISO',                dueDate: '2026-12-31', lastReviewed: '2026-09-01', linkedControls: 9,  evidenceCount: 13, priority: 'critical' },
  { id: 'iso-4',  framework: 'ISO-27001', reference: 'ISO A.18.1',      title: 'Compliance with Legal and Contractual Requirements', description: 'Identify and document all applicable legislative, regulatory, and contractual requirements.',               category: 'Compliance',           status: 'compliant',      owner: 'Legal & Compliance',  dueDate: '2027-01-31', lastReviewed: '2026-08-15', linkedControls: 6,  evidenceCount: 9,  priority: 'high' },

  // PCI-DSS
  { id: 'pci-1',  framework: 'PCI-DSS',  reference: 'PCI DSS Req 1',   title: 'Network Access Controls',                          description: 'Install and maintain network security controls to protect the cardholder data environment.',                  category: 'Network Security',     status: 'partial',        owner: 'Network Security',    dueDate: '2026-10-15', lastReviewed: '2026-08-01', linkedControls: 10, evidenceCount: 6,  priority: 'critical' },
  { id: 'pci-2',  framework: 'PCI-DSS',  reference: 'PCI DSS Req 3',   title: 'Protection of Stored Account Data',                description: 'Protect stored account data using encryption, truncation, masking, and hashing.',                             category: 'Data Protection',       status: 'non-compliant',  owner: 'Data Engineering',    dueDate: '2026-10-01', lastReviewed: '2026-07-15', linkedControls: 8,  evidenceCount: 2,  priority: 'critical' },
  { id: 'pci-3',  framework: 'PCI-DSS',  reference: 'PCI DSS Req 8',   title: 'Identify Users and Authenticate Access',           description: 'Identify all users with access to system components and assign unique IDs.',                                 category: 'Access Control',       status: 'partial',        owner: 'IAM Team',            dueDate: '2026-10-31', lastReviewed: '2026-08-10', linkedControls: 7,  evidenceCount: 4,  priority: 'critical' },
  { id: 'pci-4',  framework: 'PCI-DSS',  reference: 'PCI DSS Req 12',  title: 'Organisational Policies and Programs',             description: 'Support information security with organisational policies and programs.',                                    category: 'Governance',           status: 'partial',        owner: 'Legal & Compliance',  dueDate: '2026-11-30', lastReviewed: '2026-07-20', linkedControls: 5,  evidenceCount: 3,  priority: 'high' },

  // GLBA
  { id: 'glba-1', framework: 'GLBA',     reference: 'GLBA §314',       title: 'Information Security Program',                     description: 'Develop, implement, and maintain a comprehensive information security program.',                             category: 'Information Security', status: 'compliant',      owner: 'CISO',                dueDate: '2027-01-31', lastReviewed: '2026-09-01', linkedControls: 12, evidenceCount: 16, priority: 'critical' },
  { id: 'glba-2', framework: 'GLBA',     reference: 'GLBA §313',       title: 'Privacy Notice Requirements',                      description: 'Provide initial and annual privacy notices to customers describing information sharing practices.',           category: 'Privacy',              status: 'compliant',      owner: 'Legal & Compliance',  dueDate: '2026-12-31', lastReviewed: '2026-08-25', linkedControls: 4,  evidenceCount: 7,  priority: 'high' },

  // AML
  { id: 'aml-1',  framework: 'AML',      reference: 'AML BSA §5318',   title: 'Customer Identification Program (CIP)',            description: 'Establish a written CIP describing procedures for verifying the identity of each customer.',                  category: 'Customer Due Diligence', status: 'compliant',    owner: 'Compliance Team',     dueDate: '2026-12-31', lastReviewed: '2026-09-05', linkedControls: 7,  evidenceCount: 10, priority: 'critical' },
  { id: 'aml-2',  framework: 'AML',      reference: 'AML SAR',         title: 'Suspicious Activity Reporting',                    description: 'File Suspicious Activity Reports (SARs) with FinCEN for transactions above threshold.',                      category: 'Transaction Monitoring', status: 'partial',      owner: 'Compliance Team',     dueDate: '2026-10-31', lastReviewed: '2026-08-01', linkedControls: 5,  evidenceCount: 4,  priority: 'critical' },

  // CCPA
  { id: 'ccpa-1', framework: 'CCPA',     reference: 'CCPA §1798.100',  title: 'Consumer Right to Know and Access',                description: 'Consumers have the right to request disclosure of personal information collected, used, and shared.',          category: 'Data Subject Rights',  status: 'compliant',      owner: 'Data Protection Officer', dueDate: '2026-12-31', lastReviewed: '2026-09-02', linkedControls: 5,  evidenceCount: 8,  priority: 'high' },
  { id: 'ccpa-2', framework: 'CCPA',     reference: 'CCPA §1798.120',  title: 'Right to Opt-Out of Sale of Personal Information', description: 'Consumers have the right to opt out of the sale of their personal information.',                            category: 'Data Subject Rights',  status: 'compliant',      owner: 'Data Protection Officer', dueDate: '2026-12-31', lastReviewed: '2026-08-20', linkedControls: 4,  evidenceCount: 6,  priority: 'high' },
];

export const ALL_FRAMEWORKS = ['All', 'SOX', 'GDPR', 'NIST-CSF', 'ISO-27001', 'PCI-DSS', 'GLBA', 'AML', 'CCPA'];

export interface ComplianceRegisterViewModel {
  obligations: ComplianceObligation[];
  filtered: ComplianceObligation[];
  framework: string;
  setFramework: (f: string) => void;
  statusFilter: ObligationStatus | 'all';
  setStatusFilter: (s: ObligationStatus | 'all') => void;
  search: string;
  setSearch: (s: string) => void;
  stats: {
    total: number;
    compliant: number;
    partial: number;
    nonCompliant: number;
    underReview: number;
    compliantPct: number;
    upcomingSoon: number;
  };
}

export function useComplianceRegister(): ComplianceRegisterViewModel {
  const [framework, setFramework] = useState('All');
  const [statusFilter, setStatusFilter] = useState<ObligationStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return OBLIGATIONS.filter(o => {
      if (framework !== 'All' && o.framework !== framework) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.title.toLowerCase().includes(q) &&
            !o.reference.toLowerCase().includes(q) &&
            !o.description.toLowerCase().includes(q) &&
            !o.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [framework, statusFilter, search]);

  const stats = useMemo(() => {
    const src = framework === 'All' ? OBLIGATIONS : OBLIGATIONS.filter(o => o.framework === framework);
    const total       = src.length;
    const compliant   = src.filter(o => o.status === 'compliant').length;
    const partial     = src.filter(o => o.status === 'partial').length;
    const nonCompliant = src.filter(o => o.status === 'non-compliant').length;
    const underReview = src.filter(o => o.status === 'under-review').length;
    const compliantPct = total > 0 ? Math.round((compliant / total) * 100) : 0;
    const now = new Date();
    const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const upcomingSoon = src.filter(o => {
      const d = new Date(o.dueDate);
      return d >= now && d <= in60;
    }).length;
    return { total, compliant, partial, nonCompliant, underReview, compliantPct, upcomingSoon };
  }, [framework]);

  return { obligations: OBLIGATIONS, filtered, framework, setFramework, statusFilter, setStatusFilter, search, setSearch, stats };
}
