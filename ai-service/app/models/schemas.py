from pydantic import BaseModel, Field
from typing import Optional, Literal, Any
from datetime import datetime
import uuid


# ── Request models ────────────────────────────────────────────────────────────

class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AIAssistRequest(BaseModel):
    action: Literal[
        "summarize",
        "analyze-controls",
        "draft-issue",
        "policy-guidance",
        "impact-translation",
        "report-draft",
        "recommend-controls",
        "risk-deep-dive",
        "compliance-check",
    ]
    mode: Literal["genai", "agentic"] = "genai"
    context: dict[str, Any] = Field(default_factory=dict)
    prompt: str
    conversation_history: list[ConversationMessage] = Field(default_factory=list)


class AgentRunRequest(BaseModel):
    agent_type: Literal["risk-analyst", "compliance"]
    context: dict[str, Any] = Field(default_factory=dict)
    objective: str


class ApprovalActionRequest(BaseModel):
    reason: Optional[str] = None


# ── Response models ───────────────────────────────────────────────────────────

class AgentActionSuggestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    action: str
    description: str
    impact: str
    risk_level: Literal["low", "medium", "high", "critical"] = "medium"
    requires_approval: bool = True
    tier: Literal["analyst", "executor", "orchestrator"] = "analyst"


class AIAssistResponse(BaseModel):
    response: str
    mode: str
    action: str
    suggested_agent_actions: list[AgentActionSuggestion] = Field(default_factory=list)
    tokens_used: Optional[int] = None
    model: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AgentRunResponse(BaseModel):
    agent_type: str
    objective: str
    steps: list[dict[str, Any]] = Field(default_factory=list)
    final_output: str
    recommendations: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ── Approval queue ────────────────────────────────────────────────────────────

class ApprovalQueueItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    proposed_action: str
    description: str
    impact: str
    risk_level: Literal["low", "medium", "high", "critical"] = "medium"
    status: Literal["pending", "approved", "rejected", "executed"] = "pending"
    tier: Literal["analyst", "executor", "orchestrator"] = "analyst"
    context: dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    resolved_at: Optional[str] = None
    resolved_by: Optional[str] = None
    result: Optional[str] = None
    expiry_date: Optional[str] = None
    compensating_control: Optional[str] = None


# ── Status ────────────────────────────────────────────────────────────────────

class AIStatusResponse(BaseModel):
    status: str
    ai_enabled: bool
    model: str
    service: str = "Python FastAPI + LangGraph"
    frameworks: list[str] = Field(default_factory=lambda: [
        "LangChain 0.3", "LangGraph 0.2", "Anthropic SDK"
    ])
    capabilities: list[str] = Field(default_factory=lambda: [
        "GenAI Assist", "Agentic Workflows", "LangGraph Agents",
        "RAG Pipeline", "Multi-step Reasoning", "Tool Calling"
    ])
