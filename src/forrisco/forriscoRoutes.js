import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import ForriscoApplication from 'forpdi/src/forrisco/ForriscoApplication';

import DashboardMainPage from 'forpdi/src/forrisco/views/DashboardMainPage';

import PolicyMainPage from 'forpdi/src/forrisco/views/policy/PolicyMainPage';
import NewPolicy from 'forpdi/src/forrisco/views/policy/NewPolicy';
import EditPolicy from 'forpdi/src/forrisco/views/policy/EditPolicy';
import PolicyDetails from 'forpdi/src/forrisco/views/policy/PolicyDetails';
import PolicyInformation from 'forpdi/src/forrisco/views/policy/PolicyInformation';
import PolicyItems from 'forpdi/src/forrisco/views/policy/PolicyItems';
import PolicyItemSubItems from 'forpdi/src/forrisco/views/policy/item/PolicyItemSubItems';
import NewPolicyItem from 'forpdi/src/forrisco/views/policy/item/NewPolicyItem';
import EditPolicyItem from 'forpdi/src/forrisco/views/policy/item/EditPolicyItem';
import PolicyItemDetails from 'forpdi/src/forrisco/views/policy/item/PolicyItemDetails';
import PolicySubItemInformation from 'forpdi/src/forrisco/views/policy/item/PolicySubItemInformation';

import PlanRiskMainPage from 'forpdi/src/forrisco/views/planRisk/PlanRiskMainPage';
import ClonePlanRisk from 'forpdi/src/forrisco/views/planRisk/ClonePlanRisk';
import NewPlanRisk from 'forpdi/src/forrisco/views/planRisk/NewPlanRisk';
import EditPlanRisk from 'forpdi/src/forrisco/views/planRisk/EditPlanRisk';
import PlanRiskDetails from 'forpdi/src/forrisco/views/planRisk/PlanRiskDetails';
import PlanRiskInformation from 'forpdi/src/forrisco/views/planRisk/PlanRiskInformation';
import PlanRiskUnits from 'forpdi/src/forrisco/views/planRisk/PlanRiskUnits';
import PlanRiskItems from 'forpdi/src/forrisco/views/planRisk/PlanRiskItems';
import PlanRiskItemSubItems from 'forpdi/src/forrisco/views/planRisk/item/PlanRiskItemSubItems';
import NewPlanRiskItem from 'forpdi/src/forrisco/views/planRisk/item/NewPlanRiskItem';
import EditPlanRiskItem from 'forpdi/src/forrisco/views/planRisk/item/EditPlanRiskItem';
import PlanRiskItemDetails from 'forpdi/src/forrisco/views/planRisk/item/PlanRiskItemDetails';
import PlanRiskSubItemInformation from 'forpdi/src/forrisco/views/planRisk/item/PlanRiskSubItemInformation';

import UnitMainPage from 'forpdi/src/forrisco/views/unit/UnitMainPage';
import NewUnit from 'forpdi/src/forrisco/views/unit/NewUnit';
import EditUnit from 'forpdi/src/forrisco/views/unit/EditUnit';
import UnitDetails from 'forpdi/src/forrisco/views/unit/UnitDetails';
import SubUnitDetails from 'forpdi/src/forrisco/views/unit/SubUnitDetails';
import UnitInformation from 'forpdi/src/forrisco/views/unit/UnitInformation';
import UnitSubunits from 'forpdi/src/forrisco/views/unit/UnitSubunits';
import UnitRisks from 'forpdi/src/forrisco/views/unit/UnitRisks';
import UnitProcesses from 'forpdi/src/forrisco/views/unit/UnitProcesses';

import NewRisk from 'forpdi/src/forrisco/views/risk/NewRisk';
import EditRisk from 'forpdi/src/forrisco/views/risk/EditRisk';
import ReplicateRisk from 'forpdi/src/forrisco/views/risk/ReplicateRisk';
import MoveRisk from 'forpdi/src/forrisco/views/risk/MoveRisk';
import RiskRoutesWrapper from 'forpdi/src/forrisco/views/risk/RiskRoutesWrapper';
import RiskDetailsWrapper from 'forpdi/src/forrisco/views/risk/RiskDetailsWrapper';
import RiskDetails from 'forpdi/src/forrisco/views/risk/RiskDetails';
import RiskInformation from 'forpdi/src/forrisco/views/risk/RiskInformation';
import RiskPreventiveActions from 'forpdi/src/forrisco/views/risk/RiskPreventiveActions';
import NewPreventiveAction from 'forpdi/src/forrisco/views/risk/preventiveAction/NewPreventiveAction';
import EditPreventiveAction from 'forpdi/src/forrisco/views/risk/preventiveAction/EditPreventiveAction';
import PreventiveActionInformation from 'forpdi/src/forrisco/views/risk/preventiveAction/PreventiveActionInformation';
import RiskMonitoring from 'forpdi/src/forrisco/views/risk/RiskMonitoring';
import NewMonitor from 'forpdi/src/forrisco/views/risk/monitor/NewMonitor';
import EditMonitor from 'forpdi/src/forrisco/views/risk/monitor/EditMonitor';
import MonitorInformation from 'forpdi/src/forrisco/views/risk/monitor/MonitorInformation';
import ContingencyInformation from 'forpdi/src/forrisco/views/risk/contingency/ContingencyInformation';
import RiskIncidents from 'forpdi/src/forrisco/views/risk/RiskIncidents';
import NewIncident from 'forpdi/src/forrisco/views/risk/incident/NewIncident';
import EditIncident from 'forpdi/src/forrisco/views/risk/incident/EditIncident';
import IncidentInformation from 'forpdi/src/forrisco/views/risk/incident/IncidentInformation';
import RiskContingency from 'forpdi/src/forrisco/views/risk/RiskContingency';
import NewContingency from 'forpdi/src/forrisco/views/risk/contingency/NewContingency';
import EditContingency from 'forpdi/src/forrisco/views/risk/contingency/EditContingency';

import ProcessDetails from 'forpdi/src/forrisco/views/process/ProcessDetails';
import NewProcess from 'forpdi/src/forrisco/views/process/NewProcess';
import EditProcess from 'forpdi/src/forrisco/views/process/EditProcess';

import ReportsMainPage from 'forpdi/src/forrisco/views/ReportsMainPage';

import ItemInformation from 'forpdi/src/forrisco/views/ItemInformation';

const forriscoRoutes = () => (
  <Route path="forrisco" component={ForriscoApplication}>
    <Route path="home" component={DashboardMainPage} />
    <Route path="policy" component={PolicyMainPage} />
    <Route path="policy/new" component={NewPolicy} />
    <Route path="policy/edit/:policyId" component={EditPolicy} />

    <Route path="policy/:policyId" component={PolicyDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={PolicyInformation} />
      <Route path="item">
        <IndexRedirect to="overview" />
        <Route path="overview" component={PolicyItems} />
      </Route>
    </Route>

    <Route path="policy/:policyId/item/new" component={NewPolicyItem} />
    <Route path="policy/item/:itemId/edit" component={EditPolicyItem} />
    <Route path="policy/subitem/:subitemId/edit" component={EditPolicyItem} />
    <Route path="policy/:policyId/item/:itemId/subitem/:subitemId" component={NewPolicyItem} />
    <Route path="policy/:policyId/item/:itemId" component={PolicyItemDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={ItemInformation} />
      <Route path="subitems" component={PolicyItemSubItems} />
    </Route>

    <Route path="policy/:policyId/item/:itemId/subitem/:subItemId/info" component={PolicySubItemInformation} />

    <Route path="plan-risk" component={PlanRiskMainPage} />
    <Route path="plan-risk/new" component={NewPlanRisk} />
    <Route path="plan-risk/edit/:planRiskId" component={EditPlanRisk} />
    <Route path="plan-risk/clone/:planRiskId" component={ClonePlanRisk} />

    <Route path="unit" component={UnitMainPage} />
    <Route path="unit/new" component={NewUnit} />
    <Route path="unit/edit/:unitId" component={EditUnit} />
    <Route path="unit/:unitId/risk/new" component={NewRisk} />
    <Route path="risk/edit/:riskId" component={EditRisk} />
    <Route path="risk/replicate/:riskId" component={ReplicateRisk} />
    <Route path="risk/move/:riskId" component={MoveRisk} />
    <Route path="unit/:parentId/subunit/new" component={NewUnit} />

    <Route path="plan-risk/:planRiskId/unit/new" component={NewUnit} />
    <Route path="plan-risk/:planRiskId/item/new" component={NewPlanRiskItem} />
    <Route path="plan-risk/item/:itemId/edit" component={EditPlanRiskItem} />
    <Route path="plan-risk/subitem/:subitemId/edit" component={EditPlanRiskItem} />
    <Route path="plan-risk/:planRiskId/item/:itemId/subitem/new" component={NewPlanRiskItem} />
    <Route path="plan-risk/:planRiskId/item/:itemId" component={PlanRiskItemDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={ItemInformation} />
      <Route path="subitems" component={PlanRiskItemSubItems} />
    </Route>

    <Route path="plan-risk/:planRiskId/item/:itemId/subitem/:subItemId/info" component={PlanRiskSubItemInformation} />

    <Route path="plan-risk/:planRiskId" component={PlanRiskDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={PlanRiskInformation} />
      <Route path="itens" component={PlanRiskItems} />
      <Route path="units" component={PlanRiskUnits} />
    </Route>

    <Route path="risk/:riskId" component={RiskRoutesWrapper}>
      <Route path="" component={RiskDetailsWrapper}>
        <Route path="details" component={RiskDetails}>
          <IndexRedirect to="info" />
          <Route path="info" component={RiskInformation} />
          <Route path="monitors" component={RiskMonitoring} />
          <Route path="incidents" component={RiskIncidents} />
          <Route path="contingency" component={RiskContingency} />
          <Route path="preventiveActions" component={RiskPreventiveActions} />
        </Route>
        <Route path="preventiveAction/:actionId/info" component={PreventiveActionInformation} />
        <Route path="monitors/:monitorId/info" component={MonitorInformation} />
        <Route path="incident/:incidentId/info" component={IncidentInformation} />
        <Route path="contingency/:contingencyId/info" component={ContingencyInformation} />
      </Route>
      <Route path="preventiveActions/new" component={NewPreventiveAction} />
      <Route path="preventiveActions/edit/:actionId" component={EditPreventiveAction} />
      <Route path="monitors/new" component={NewMonitor} />
      <Route path="monitors/edit/:monitorId" component={EditMonitor} />
      <Route path="incidents/new" component={NewIncident} />
      <Route path="incidents/edit/:incidentId" component={EditIncident} />
      <Route path="contingency/new" component={NewContingency} />
      <Route path="contingency/edit/:contingencyId" component={EditContingency} />
    </Route>

    <Route path="unit" component={UnitMainPage} />
    <Route path="unit/new" component={NewUnit} />
    <Route path="unit/edit/:unitId" component={EditUnit} />
    <Route path="unit/:parentId/subunit/new" component={NewUnit} />
    <Route path="unit/:unitId" component={UnitDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={UnitInformation} />
      <Route path="subunits" component={UnitSubunits} />
      <Route path="risks" component={UnitRisks} />
      <Route path="processes" component={UnitProcesses} />
    </Route>

    <Route path="subunit/:unitId" component={SubUnitDetails}>
      <IndexRedirect to="info" />
      <Route path="info" component={UnitInformation} />
      <Route path="risks" component={UnitRisks} />
      <Route path="processes" component={UnitProcesses} />
    </Route>
    <Route path="unit/:unitId/process/new" component={NewProcess} />
    <Route path="process/edit/:processId" component={EditProcess} />
    <Route path="process/:processId/info" component={ProcessDetails} />

    <Route path="reports" component={ReportsMainPage} />
  </Route>
);

export default forriscoRoutes;
