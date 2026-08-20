import type { AIAction } from '../../models';

export interface SuggestedPrompt {
  label:  string;
  prompt: string;
  action: AIAction;
}

export function getSuggestedPrompts(page: string): SuggestedPrompt[] {
  switch (page) {
    case 'dashboard':
      return [
        { label: 'Summarize risk posture',     prompt: 'Summarize the overall cyber risk posture including top risks and control gaps.',   action: 'summarize' },
        { label: 'Executive summary',           prompt: 'Draft a board-ready executive summary of current cyber risk status.',              action: 'report-draft' },
        { label: 'Top recommendations',         prompt: 'What are the top 5 control recommendations based on current risk levels?',         action: 'recommend-controls' },
        { label: 'Compliance overview',         prompt: 'Give me a compliance overview across NIST CSF, ISO 27001, GDPR and DORA.',        action: 'compliance-check' },
      ];
    case 'domain':
      return [
        { label: 'Analyze domain controls',    prompt: 'Analyze the controls for this domain and identify the most critical gaps.',       action: 'analyze-controls' },
        { label: 'Explain risk score',          prompt: 'Why is this domain risk score at its current level? Break down the drivers.',     action: 'risk-deep-dive' },
        { label: 'Recommend controls',          prompt: 'Recommend specific controls to reduce residual risk in this domain.',             action: 'recommend-controls' },
        { label: 'Policy guidance',             prompt: 'What policy requirements apply to this risk domain under DORA and ISO 27001?',    action: 'policy-guidance' },
      ];
    case 'risk':
      return [
        { label: 'Deep dive this risk',         prompt: 'Perform a deep dive analysis of this specific risk including threat landscape.',  action: 'risk-deep-dive' },
        { label: 'Draft risk issue',             prompt: 'Draft a formal risk issue for this risk including severity, owner and remediation plan.', action: 'draft-issue' },
        { label: 'Business impact translation', prompt: 'Translate this technical risk into business impact language for executives.',    action: 'impact-translation' },
        { label: 'Control analysis',            prompt: 'Analyze the effectiveness of controls mapped to this risk.',                      action: 'analyze-controls' },
      ];
    case 'ai-governance':
      return [
        { label: 'NIST AI RMF compliance',     prompt: 'Assess our AI governance posture against the NIST AI Risk Management Framework.', action: 'compliance-check' },
        { label: 'Shadow AI risks',             prompt: 'Identify and prioritise the risks associated with shadow AI in our environment.', action: 'risk-deep-dive' },
        { label: 'EU AI Act readiness',         prompt: 'What gaps exist in our EU AI Act compliance for high-risk AI systems?',          action: 'policy-guidance' },
        { label: 'OWASP LLM Top 10',           prompt: 'Summarise our exposure to the OWASP LLM Top 10 threats.',                        action: 'summarize' },
      ];
    case 'governance':
      return [
        { label: 'Policy compliance check',    prompt: 'Review policy compliance status and identify overdue reviews.',                   action: 'compliance-check' },
        { label: 'Exception risk analysis',    prompt: 'Analyse active risk exceptions and their cumulative risk exposure.',              action: 'risk-deep-dive' },
        { label: 'Committee briefing',         prompt: 'Draft a governance committee briefing on current risk appetite breaches.',        action: 'report-draft' },
        { label: 'Escalation guidance',        prompt: 'What risks should be escalated to the Risk Committee this quarter?',             action: 'policy-guidance' },
      ];
    case 'resilience':
      return [
        { label: 'Resilience posture',         prompt: 'Summarise the operational resilience posture and key gaps.',                     action: 'summarize' },
        { label: 'DORA compliance',            prompt: 'Assess our resilience controls against DORA requirements.',                      action: 'compliance-check' },
        { label: 'Recovery recommendations',   prompt: 'Recommend improvements to our recovery time objectives and playbooks.',          action: 'recommend-controls' },
        { label: 'Impact tolerance review',    prompt: 'Review whether our current impact tolerances meet FCA/PRA expectations.',        action: 'policy-guidance' },
      ];
    case 'evidence':
      return [
        { label: 'Evidence gaps',              prompt: 'Identify which controls have insufficient evidence coverage.',                   action: 'analyze-controls' },
        { label: 'Attestation status',         prompt: 'Summarise the attestation coverage and overdue items.',                         action: 'summarize' },
        { label: 'Audit readiness',            prompt: 'How audit-ready are we based on current evidence artefacts?',                   action: 'compliance-check' },
        { label: 'Evidence quality',           prompt: 'Assess the quality and completeness of evidence for high-risk controls.',       action: 'risk-deep-dive' },
      ];
    case 'identities':
      return [
        { label: 'High-risk identities',       prompt: 'Identify and explain the highest risk identities and why they are elevated.',   action: 'risk-deep-dive' },
        { label: 'Access review priorities',   prompt: 'Which access reviews should be prioritised and why?',                           action: 'analyze-controls' },
        { label: 'MFA coverage gaps',          prompt: 'Summarise MFA coverage gaps and the risk they create.',                        action: 'summarize' },
        { label: 'Privileged access risk',     prompt: 'Analyse the risk from privileged accounts and recommend controls.',             action: 'recommend-controls' },
      ];
    case 'data-sovereignty':
      return [
        { label: 'Critical sovereignty risks', prompt: 'Explain the critical data sovereignty risks and what actions are needed immediately.',    action: 'risk-deep-dive' },
        { label: 'GDPR compliance gaps',        prompt: 'Which AI tools are non-compliant or unknown under GDPR and what is the exposure?',       action: 'compliance-check' },
        { label: 'Cross-border flow risk',      prompt: 'Assess the risk from cross-border data transfers across our AI tools.',                  action: 'analyze-controls' },
        { label: 'Residency recommendations',   prompt: 'Recommend data residency controls and improvements for our highest-risk AI tools.',      action: 'recommend-controls' },
      ];
    case 'ai-registry':
      return [
        { label: 'Prohibited tools risk',      prompt: 'Explain the risk implications of our prohibited AI tools and why they were banned.', action: 'risk-deep-dive' },
        { label: 'Pending approvals',          prompt: 'Summarise the AI tools pending approval and what security reviews are needed.', action: 'summarize' },
        { label: 'Data sovereignty gaps',      prompt: 'Identify AI tools with data residency concerns and sovereignty risk.',          action: 'analyze-controls' },
        { label: 'Registry controls review',   prompt: 'Assess the adequacy of controls across our approved AI tools.',                action: 'recommend-controls' },
      ];
    case 'ai-finops':
      return [
        { label: 'Shadow AI risk brief',       prompt: 'Summarise the risk exposure from shadow AI tools including data classification concerns and regulatory implications.', action: 'risk-deep-dive' },
        { label: 'Spend optimisation',          prompt: 'Identify opportunities to reduce AI spend by consolidating shadow AI into sanctioned equivalents.', action: 'recommend-controls' },
        { label: 'Budget compliance check',     prompt: 'Assess whether our current AI spend allocation is compliant with our risk appetite and procurement policy.', action: 'compliance-check' },
        { label: 'FinOps executive summary',    prompt: 'Draft an executive summary of AI investment, shadow spend risk and recommended governance actions.', action: 'report-draft' },
      ];
    case 'approval-queue':
      return [
        { label: 'Risk-rank pending actions',  prompt: 'Rank the pending approval queue items by risk level and explain which should be prioritised for review.',  action: 'risk-deep-dive' },
        { label: 'Escalation guidance',         prompt: 'Which pending actions require escalation to senior leadership and why?',                                    action: 'policy-guidance' },
        { label: 'Queue health summary',        prompt: 'Summarise the current state of the approval queue including backlog, average resolution time and risk exposure from pending items.', action: 'summarize' },
        { label: 'Governance compliance check', prompt: 'Are the proposed agentic actions consistent with our governance policies and risk appetite?',               action: 'compliance-check' },
      ];
    case 'architecture':
      return [
        { label: 'Agent risk summary',         prompt: 'Summarise the risk posture of our AI agent inventory, highlighting sandboxed, under-review, and critical-tier agents.', action: 'risk-deep-dive' },
        { label: 'RAG poisoning response',     prompt: 'Our External Threat Intel RAG source has detected poisoning. What are the containment and remediation steps we should follow?', action: 'recommend-controls' },
        { label: 'Model provenance gaps',      prompt: 'Identify models with flagged provenance or significant drift and explain the governance risk they create.', action: 'analyze-controls' },
        { label: 'Circuit breaker status',     prompt: 'Our Human Approval Gate circuit breaker is half-open. What does this mean and what actions should we take?', action: 'policy-guidance' },
      ];
    case 'control-testing':
      return [
        { label: 'Failed control analysis',  prompt: 'Analyse all failed control tests, explain the risks they create, and recommend priority remediation actions.', action: 'risk-deep-dive' },
        { label: 'Testing coverage gaps',    prompt: 'Which domains have the weakest control test coverage or lowest average scores, and what does that mean for our risk posture?', action: 'analyze-controls' },
        { label: 'Overdue test risk',         prompt: 'What are the governance and compliance risks created by overdue control tests, and what should we do about them?', action: 'policy-guidance' },
        { label: 'Test improvement plan',    prompt: 'Based on current test results and findings, draft a control improvement plan prioritised by risk impact.', action: 'recommend-controls' },
      ];
    case 'action-items':
      return [
        { label: 'Overdue item analysis',      prompt: 'Analyse all overdue action items, explain the residual risk they create, and recommend priority order for remediation.', action: 'risk-deep-dive' },
        { label: 'Evidence review guidance',   prompt: 'What criteria should a GRC analyst use when reviewing and verifying evidence submitted for action items?', action: 'policy-guidance' },
        { label: 'Remediation bottlenecks',    prompt: 'Where are the bottlenecks in our closed-loop remediation workflow based on current action item status distribution?', action: 'analyze-controls' },
        { label: 'Draft closure summary',      prompt: 'Draft a risk closure summary for action items currently in evidence-provided or verified status, suitable for a risk committee report.', action: 'report-draft' },
      ];
    case 'incident-triggers':
      return [
        { label: 'Triage active triggers',     prompt: 'Triage all active incident triggers, explain the severity of each KRI breach, and recommend the immediate response actions.', action: 'risk-deep-dive' },
        { label: 'Playbook alignment check',   prompt: 'Are the resilience playbooks linked to our current incident triggers appropriate for the KRI breaches observed? Identify any misalignments.', action: 'analyze-controls' },
        { label: 'Executive incident brief',   prompt: 'Draft an executive incident brief covering active KRI breaches, impacted domains, linked playbooks, and recommended escalation actions.', action: 'report-draft' },
        { label: 'Containment guidance',       prompt: 'For the highest-severity active triggers, what containment and remediation steps should be taken immediately to reduce the KRI breach?', action: 'recommend-controls' },
      ];
    case 'scoring':
      return [
        { label: 'Explain composite score',    prompt: 'Explain why the composite risk score is at its current level and what is driving it highest.', action: 'risk-deep-dive' },
        { label: 'Weight recommendations',     prompt: 'Should any domain weights be adjusted given current regulatory requirements and threat landscape?', action: 'recommend-controls' },
        { label: 'Framework gap analysis',     prompt: 'Based on our scoring, where are the largest gaps to achieve the next NIST CSF tier or DORA compliance level?', action: 'compliance-check' },
        { label: 'Score improvement plan',     prompt: 'What specific actions would have the greatest impact on reducing our composite risk score?', action: 'recommend-controls' },
      ];
    default:
      return [
        { label: 'General risk summary',       prompt: 'Provide a general cyber risk summary for this view.',                           action: 'summarize' },
        { label: 'Recommendations',            prompt: 'What are your top recommendations for improving cyber risk posture?',           action: 'recommend-controls' },
        { label: 'Compliance check',           prompt: 'Check compliance status against applicable frameworks.',                        action: 'compliance-check' },
      ];
  }
}
