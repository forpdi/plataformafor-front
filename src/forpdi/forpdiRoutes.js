import React from 'react';
import { Route, IndexRedirect } from 'react-router';
import _ from "underscore"; // Import necessário para verificação

// Imports existentes
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
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import Toastr from 'toastr';

const NewPlanGuard = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
    roles: React.PropTypes.object.isRequired,
    permissions: React.PropTypes.array.isRequired
  },
  
  componentWillMount() {
    this.checkPermission();
  },

  componentDidUpdate() {
    this.checkPermission();
  },

  checkPermission() {
    const { roles, permissions } = this.context;
    const hasPermission = roles.ADMIN || _.contains(permissions, PermissionsTypes.MANAGE_PLAN_MACRO_PERMISSION);

    if (!hasPermission) {
      Toastr.warning("Você não tem permissão para acessar esta página.");
      this.context.router.push('/home');
    }
  },

  render() {
    const { roles, permissions } = this.context;
    const hasPermission = roles.ADMIN || _.contains(permissions, PermissionsTypes.MANAGE_PLAN_MACRO_PERMISSION);
    
    if (hasPermission) {
      return <PlanMacroEdit {...this.props} />;
    }
    return null; 
  }
});

const ReportsGuard = React.createClass({
  contextTypes: {
    router: React.PropTypes.object,
    roles: React.PropTypes.object.isRequired
  },

  componentWillMount() {
    if (!this.context.roles.ADMIN) {
      Toastr.warning("Acesso negado.");
      this.context.router.push('/home');
    }
  },

  render() {
    if (this.context.roles.ADMIN) {
      return <ReportsMainPage {...this.props} />;
    }
    return null;
  }
});

const forpdiRoutes = () => (
  <Route path="" component={ForpdiApplication}>
    <Route path="home" component={Dashboard} />
    <Route path="structures" component={StructureList}>
      <Route path="preview/:modelId" component={StructurePreview} />
    </Route>

    <Route path="budget-element" component={BudgetElement} />
    
    {/* Rota protegida: Reports (Apenas Admin) */}
    <Route path="reports" component={ReportsGuard} />

    {/* Rota protegida: Novo Plano (Admin ou Permissão Específica) - Correção da V009 */}
    <Route path="plan/new" component={NewPlanGuard} />

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