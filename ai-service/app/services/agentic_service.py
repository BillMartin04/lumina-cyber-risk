from datetime import datetime
from fastapi import HTTPException
from app.interfaces.i_agentic_service import IAgenticService
from app.models.schemas import ApprovalQueueItem, AgentActionSuggestion


class AgenticServiceImpl(IAgenticService):
    """
    Human-in-the-loop approval queue for agentic actions.
    SRP: manages the lifecycle of proposed agentic actions only.
    No AI logic lives here — that belongs in agents/.
    """

    def __init__(self) -> None:
        self._queue: dict[str, ApprovalQueueItem] = {}
        self._seed_demo_items()

    def propose_action(self, suggestion: AgentActionSuggestion, context: dict) -> ApprovalQueueItem:
        item = ApprovalQueueItem(
            proposed_action=suggestion.action,
            description=suggestion.description,
            impact=suggestion.impact,
            risk_level=suggestion.risk_level,
            tier=suggestion.tier,
            context=context,
        )
        self._queue[item.id] = item
        return item

    def get_queue(self) -> list[ApprovalQueueItem]:
        return sorted(self._queue.values(), key=lambda x: x.created_at, reverse=True)

    def approve(self, item_id: str, approved_by: str = "system") -> ApprovalQueueItem:
        item = self._get_or_raise(item_id)
        if item.status != "pending":
            raise HTTPException(status_code=400, detail=f"Item is already {item.status}")
        item.status = "approved"
        item.resolved_by = approved_by
        item.resolved_at = datetime.utcnow().isoformat()
        return item

    def reject(self, item_id: str, reason: str = "") -> ApprovalQueueItem:
        item = self._get_or_raise(item_id)
        if item.status != "pending":
            raise HTTPException(status_code=400, detail=f"Item is already {item.status}")
        item.status = "rejected"
        item.resolved_at = datetime.utcnow().isoformat()
        item.result = reason or "Rejected by reviewer"
        return item

    async def execute(self, item_id: str) -> ApprovalQueueItem:
        item = self._get_or_raise(item_id)
        if item.status != "approved":
            raise HTTPException(status_code=400, detail="Only approved actions can be executed")
        item.status = "executed"
        item.result = f"Action '{item.proposed_action}' executed successfully at {datetime.utcnow().isoformat()}"
        return item

    def reset_to_pending(self, item_id: str) -> ApprovalQueueItem:
        item = self._get_or_raise(item_id)
        item.status = "pending"
        item.resolved_by = None
        item.resolved_at = None
        item.result = None
        return item

    def _get_or_raise(self, item_id: str) -> ApprovalQueueItem:
        item = self._queue.get(item_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"Approval item '{item_id}' not found")
        return item

    def _seed_demo_items(self) -> None:
        demos = [
            # Pending — Executor tier
            ApprovalQueueItem(
                proposed_action="schedule-attestation",
                description="Schedule quarterly control attestation for PAM domain",
                impact="Attestation requests dispatched to 4 control owners with 10-day SLA",
                risk_level="medium",
                tier="executor",
                status="pending",
                expiry_date="2026-08-31",
                compensating_control="Manual attestation checklist in place via SharePoint until automation is approved",
                context={"domain": "Identity & Access Management", "controls": 4, "due": "2026-07-25"},
            ),
            # Pending — Analyst tier
            ApprovalQueueItem(
                proposed_action="create-workflow",
                description="Initiate governance workflow for Shadow AI risk issue",
                impact="Creates tracked remediation workflow with CISO approval stage",
                risk_level="high",
                tier="analyst",
                status="pending",
                expiry_date="2026-08-15",
                compensating_control="Shadow AI usage monitored via DLP alerts and monthly manual review by Risk team",
                context={"risk": "Shadow AI Usage", "domain": "AI & Emerging Technology", "priority": "P1"},
            ),
            # Pending — Orchestrator tier (highest autonomy request)
            ApprovalQueueItem(
                proposed_action="escalate-to-board",
                description="Escalate Third-Party & Vendor Risk domain to Board Risk Committee given score breach of 76 (Critical band)",
                impact="Board notification issued; mandatory remediation plan required within 5 business days",
                risk_level="critical",
                tier="orchestrator",
                status="pending",
                expiry_date="2026-08-05",
                compensating_control="Enhanced vendor monitoring in place; weekly risk review by CISO until board escalation is actioned",
                context={"domain": "Third-Party & Vendor Risk", "score": 76, "threshold": 75, "committee": "Board Audit & Risk Committee"},
            ),
            # Pending — Executor tier
            ApprovalQueueItem(
                proposed_action="assign-risk-owner",
                description="Assign Data Security domain residual risk owner following recent org restructure",
                impact="Ownership gap closed; attestation cycle unblocked for Q3 2026",
                risk_level="medium",
                tier="executor",
                status="pending",
                expiry_date="2026-09-15",
                compensating_control="Risk Manager acting as interim owner; all decisions require CISO sign-off",
                context={"domain": "Data Security & Privacy", "gap": "unassigned since 2026-06-01"},
            ),
            # Approved — awaiting execution (expired)
            ApprovalQueueItem(
                proposed_action="generate-board-report",
                description="Generate Q2 2026 Board cyber risk summary report with composite score trend",
                impact="Board-ready PDF report covering all 9 domains, KRI status and top recommendations",
                risk_level="low",
                tier="analyst",
                status="approved",
                resolved_by="Sarah Chen (CISO)",
                resolved_at="2026-07-10T09:14:22",
                expiry_date="2026-07-20",
                compensating_control="Manual board pack prepared by Risk Analyst as interim deliverable",
                context={"period": "Q2 2026", "audience": "Board Audit & Risk Committee"},
            ),
            # Approved — awaiting execution
            ApprovalQueueItem(
                proposed_action="notify-risk-owners",
                description="Send overdue control remediation notifications to 3 domain risk owners",
                impact="Automated reminder emails dispatched; escalation triggered if no response in 48 hours",
                risk_level="low",
                tier="executor",
                status="approved",
                resolved_by="James Okafor (Risk Manager)",
                resolved_at="2026-07-11T14:30:00",
                expiry_date="2026-08-11",
                compensating_control="Manual email reminders sent by Risk Manager on weekly basis",
                context={"owners": 3, "overdue_controls": 7, "escalation_trigger": "48h"},
            ),
            # Rejected
            ApprovalQueueItem(
                proposed_action="auto-revoke-access",
                description="Auto-revoke stale privileged access for 12 service accounts inactive >90 days",
                impact="12 service account tokens revoked immediately; potential disruption to batch jobs",
                risk_level="high",
                tier="orchestrator",
                status="rejected",
                resolved_by="Wei Zhang (IAM Lead)",
                resolved_at="2026-07-09T11:05:44",
                result="Rejected: batch job dependency not confirmed. Manual review required before any revocation. Re-submit with confirmed dependency mapping.",
                expiry_date="2026-09-01",
                compensating_control="Quarterly access review performed manually; accounts flagged for next IAM governance cycle",
                context={"accounts": 12, "inactive_days": 90, "domain": "Identity & Access Management"},
            ),
            # Executed
            ApprovalQueueItem(
                proposed_action="create-risk-issue",
                description="Create formal risk issue for unpatched vulnerabilities in Application Security domain",
                impact="Issue logged in risk register; assigned to AppSec Lead with 30-day remediation deadline",
                risk_level="high",
                tier="analyst",
                status="executed",
                resolved_by="Priya Nair (Risk Analyst)",
                resolved_at="2026-07-08T16:22:11",
                result="Issue RSEC-2026-047 created and assigned to Marcus Lee (AppSec Lead). Due date: 2026-08-08.",
                expiry_date="2026-08-08",
                compensating_control="WAF rules tightened and vulnerability scanning frequency increased to daily",
                context={"domain": "Application Security", "cves": 3, "severity": "High"},
            ),
        ]
        for d in demos:
            self._queue[d.id] = d


agentic_service: IAgenticService = AgenticServiceImpl()
