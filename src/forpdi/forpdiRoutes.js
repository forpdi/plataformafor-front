import React from 'react';
import { Route, IndexRedirect } from 'react-router';

import ForpdiApplication from 'forpdi/src/forpdi/ForpdiApplication';
import PlanMacroDetails from 'forpdi/src/forpdi/planning/view/plan/PlanMacroDetails';
import PlanMacroEdit from 'forpdi/src/forpdi/planning/view/plan/PlanMacroEdit';
import LevelTab from 'forpdi/src/forpdi/planning/view/plan/LevelTab';
import PlanMacroTab from 'forpdi/src/forpdi/planning/view/plan/PlanMacroTab';
import DocumentSectionAttributes from 'forpdi/src/forpdi/planning/view/document/DocumentSectionAttributes';
import DocumentDetails from 'forpdi/src/forpdi/planning/view/document/DocumentDetails';
import LevelAttributeInstance from 'forpdi/src/forpdi/planning/view/plan/LevelAttributeInstance';
import PlanRegister from 'forpdi/src/forpdi/planning/view/plan/PlanRegister';
import StructureList from 'forpdi/src/forpdi/planning/view/structure/StructureList';
import StructurePreview from 'forpdi/src/forpdi/planning/view/structure/StructurePreview';
import DuplicatePlan from 'forpdi/src/forpdi/planning/view/plan/DuplicatePlan';
import Dashboard from 'forpdi/src/forpdi/dashboard/view/DashboardPanel';
import BudgetElement from 'forpdi/src/forpdi/planning/view/budget/BudgetElement';
import ReportsMainPage from 'forpdi/src/forpdi/planning/view/report/ReportsMainPage';

const forpdiRoutes = () => (
  <Route path="" component={ForpdiApplication}>
    <Route path="home" component={Dashboard} />
    <Route path="structures" component={StructureList}>
      <Route path="preview/:modelId" component={StructurePreview} />
    </Route>

    <Route path="budget-element" component={BudgetElement} />
    <Route path="reports" component={ReportsMainPage} />

    <Route path="plan/new" component={PlanMacroEdit} />
    <Route path="plan/:id">
      <IndexRedirect to="document" />
      <Route path="edit" component={PlanMacroEdit} />
      <Route path="details" component={PlanMacroDetails}>
        <IndexRedirect to="overview" />
        <Route path="overview" component={PlanMacroTab} />
        <Route path="subplan/:subplanId" component={PlanRegister} />
        <Route path="subplans/new" component={PlanRegister} />
        <Route path="level/:subplanId/:levelId" component={LevelTab} />
        <Route path="subplan/level/:levelInstanceId" component={LevelAttributeInstance} />
        <Route path="duplicate" component={DuplicatePlan} />
      </Route>
      <Route path="document" component={PlanMacroDetails}>
        <IndexRedirect to="overview" />
        <Route path="overview" component={DocumentDetails} />
        <Route path="section/:sectionId" component={DocumentSectionAttributes} />
      </Route>
    </Route>
  </Route>
);

export default forpdiRoutes;
