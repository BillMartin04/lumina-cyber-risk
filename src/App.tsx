import { Routes, Route } from 'react-router-dom';
import MasterLayout from './layouts/MasterLayout';
import DashboardView from './views/DashboardView';
import DomainDetailView from './views/DomainDetailView';
import RiskDetailView from './views/RiskDetailView';
import AIGovernanceView from './views/AIGovernanceView';
import GovernanceView from './views/GovernanceView';
import ResilienceView from './views/ResilienceView';
import EvidenceView from './views/EvidenceView';
import IdentityView from './views/IdentityView';
import WorkflowView from './views/WorkflowView';
import AIRegistryView from './views/AIRegistryView';
import DataSovereigntyView from './views/DataSovereigntyView';
import ScoringView from './views/ScoringView';
import ApprovalQueueView from './views/ApprovalQueueView';
import AIFinOpsView from './views/AIFinOpsView';
import ArchitectureView from './views/ArchitectureView';
import ActionItemsView from './views/ActionItemsView';
import ControlTestingView from './views/ControlTestingView';
import IncidentTriggerView from './views/IncidentTriggerView';

export default function App() {
  return (
    <Routes>
      <Route element={<MasterLayout />}>
        <Route path="/" element={<DashboardView />} />
        <Route path="/domain/:domainId" element={<DomainDetailView />} />
        <Route path="/domain/:domainId/risk/:riskId" element={<RiskDetailView />} />
        <Route path="/ai-governance" element={<AIGovernanceView />} />
        <Route path="/governance" element={<GovernanceView />} />
        <Route path="/resilience" element={<ResilienceView />} />
        <Route path="/evidence"   element={<EvidenceView />} />
        <Route path="/identities" element={<IdentityView />} />
        <Route path="/workflows"  element={<WorkflowView />} />
        <Route path="/ai-registry"       element={<AIRegistryView />} />
        <Route path="/data-sovereignty"  element={<DataSovereigntyView />} />
        <Route path="/scoring"           element={<ScoringView />} />
        <Route path="/approval-queue"   element={<ApprovalQueueView />} />
        <Route path="/ai-finops"        element={<AIFinOpsView />} />
        <Route path="/architecture"     element={<ArchitectureView />} />
        <Route path="/action-items"      element={<ActionItemsView />} />
        <Route path="/control-testing"   element={<ControlTestingView />} />
        <Route path="/incident-triggers" element={<IncidentTriggerView />} />
      </Route>
    </Routes>
  );
}
