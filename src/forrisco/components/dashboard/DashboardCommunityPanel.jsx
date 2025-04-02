import React from 'react';

import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import FiltersSideBar from 'forpdi/src/components/dashboard/community/FiltersSideBar';
import RiskQuantityDashboard from 'forpdi/src/forrisco/components/dashboard/RiskQuantityDashboard';
import AppContainer from 'forpdi/src/components/AppContainer';
import RiskMatrixDashboard from 'forpdi/src/forrisco/components/dashboard/RiskMatrixDashboard';
import RiskTypologyDashboard from 'forpdi/src/forrisco/components/dashboard/RiskTypologyDashboard';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import MonitorRiskCards from 'forpdi/src/forrisco/components/risk/monitor/MonitorRiskCards';
import DashboardChart from 'forpdi/src/components/dashboard/DashboardChart';
import CommunityRiskTable from 'forpdi/src/forrisco/components/dashboard/CommunityRiskTable';
import MainTitle from 'forpdi/src/components/typography/MainTitle';
import LinkButton from 'forpdi/src/components/buttons/LinkButton';
import UnitsAndSubunitsFilterModal from 'forpdi/src/forrisco/components/dashboard/UnitsAndSubunitsFilterModal';
import Modal from 'forpdi/src/components/modals/Modal';
import PreventiveActionsDashboard from 'forpdi/src/forrisco/components/dashboard/PreventiveActionsDashboard';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';

import Messages from 'forpdi/src/Messages';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import riskState from 'forpdi/src/forrisco/enums/riskState';
import { getYearsToSelect } from 'forpdi/src/utils/util';
import { getYearFromDateTime } from 'forpdi/src/utils/dateUtil';
import { getRiskTypesById } from 'forpdi/src/forrisco/helpers/riskHelper';
import { getMonitoringData } from 'forpdi/src/forrisco/helpers/dashboard/monitoringDashboardHelper';
import { getChartDataAndOptions, onChartClick } from 'forpdi/src/forrisco/helpers/dashboard/incidentDashboardHelper';
import _ from 'underscore';

const defaultOption = { name: Messages.get('label.viewAll'), id: -1 };
const cardsHeight = '20rem';
const topContentHeight = '90px';

class DashboardCommunityPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planRisksToSelect: null,
      unitsToSelect: null,
      strategiesToSelect: null,
      yearsToSelect: null,
      risks: null,
      incidents: null,
      riskLevels: null,
      policy: null,

      selectedFilters: {
        planRiskId: -1,
        riskTypeId: -1,
        selectedUnits: [],
        year: -1,
        strategyId: -1,
      },
    };
  }

  componentDidMount() {
    PlanRiskStore.on('list-to-select', ({ data }) => {
      const { selectedFilters } = this.state;
      const planRisksToSelect = data.list;
      const planRiskId = planRisksToSelect.length > 0 ? planRisksToSelect[0].id : -1;

      this.setState({
        planRisksToSelect,
        selectedFilters: {
          ...selectedFilters,
          planRiskId,
        },
      });

      planRisksToSelect.length > 0 && this.loadPlanRiskFilters(planRiskId);
    }, this);

    RiskStore.on('incidentbByPlan', ({ data }) => {
      const incidents = data.list;
      const yearsToSelect = getYearsToSelect(incidents, ({ begin }) => getYearFromDateTime(begin));
      this.setState({ incidents, yearsToSelect: [defaultOption, ...yearsToSelect] });
    }, this);

    UnitStore.on('listToSelect', ({ data }) => {
      const { selectedFilters } = this.state;
      const unitsToSelect = [defaultOption, ...data.list];

      this.setState({ unitsToSelect, selectedFilters: { ...selectedFilters, selectedUnits: unitsToSelect } });
    }, this);


    RiskStore.on('riskbyplan', ({ data }) => {
      const strategiesToSelect = [defaultOption];

      _.forEach(data.list, ({ strategies }) => {
        _.forEach(strategies.list, (strategy) => {
          if (!strategiesToSelect.find(newStrategy => newStrategy.id === strategy.structureId)) {
            strategiesToSelect.push({ name: strategy.name, id: strategy.structureId });
          }
        });
      });

      this.setState({
        risks: data.list,
        strategiesToSelect,
      });
    }, this);

    PolicyStore.on('retrieverisklevel', ({ data: riskLevels }) => {
      this.setState({
        riskLevels,
      });
    }, this);

    PlanRiskStore.on('retrivedplanrisk', ({ data }) => {
      const { policy } = data;
      this.setState({
        policy,
      });

      PolicyStore.dispatch({
        action: PolicyStore.ACTION_RETRIEVE_RISK_LEVEL,
        data: policy.id,
      });
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
    });
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
    PolicyStore.off(null, null, this);
  }

  onChangeHandler = (updatedFilters) => {
    const { planRiskId } = updatedFilters;
    const { selectedFilters } = this.state;

    const isPlanRiskUpdated = planRiskId !== selectedFilters.planRiskId;

    if (!isPlanRiskUpdated) {
      this.setState({ selectedFilters: updatedFilters });
      return;
    }

    this.loadPlanRiskFilters(planRiskId);

    this.setState({
      risks: null,
      policy: null,
      riskLevels: null,
      selectedFilters: { ...updatedFilters, selectedUnits: [] },
    });
  }

  onFilterUnitAndSubunits = (checkedValues) => {
    const { unitsToSelect, selectedFilters } = this.state;
    const filteredUnits = unitsToSelect.slice(1).filter(unit => checkedValues.includes(unit.id));
    this.setState({ selectedFilters: { ...selectedFilters, selectedUnits: filteredUnits } });
  }

  onClearUnitAndSubunitsFilter = () => {
    const { selectedFilters } = this.state;
    this.setState({ selectedFilters: { ...selectedFilters, selectedUnits: [] } });
  }

  getSelectedUnitIds() {
    const { selectedFilters } = this.state;
    const unitsIds = _.map(selectedFilters.selectedUnits, ({ id }) => id);
    return this.isFilteringUnitsAndSubunits()
      ? unitsIds
      : [];
  }

  isFilteringUnitsAndSubunits() {
    const { selectedFilters } = this.state;

    return selectedFilters.selectedUnits.length > 0;
  }

  filterByStrategy() {
    const { risks, selectedFilters } = this.state;
    const { strategyId } = selectedFilters;

    if (strategyId === -1) {
      return [-1];
    }

    const risksFiltered = _.filter(risks, ({ strategies }) => strategies.list.find(strategy => strategy.structureId === strategyId));
    return _.map(risksFiltered, ({ id }) => id);
  }

  loadPlanRiskFilters(planRiskId) {
    this.setState({
      riskLevels: null,
      risks: null,
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_TO_SELECT,
      data: { planRiskId },
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_BY_PLAN,
      data: planRiskId,
    });

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_INCIDENTS_BY_PLAN,
      data: planRiskId,
    });

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_RETRIEVE_PLANRISK,
      data: planRiskId,
    });
  }

  openUnitAndSubunitFilterModal = () => {
    const { unitsToSelect, selectedFilters } = this.state;
    const unitsIds = _.map(selectedFilters.selectedUnits, ({ id }) => id);
    const modal = (
      <UnitsAndSubunitsFilterModal
        defaultCheckedValues={unitsIds}
        unitsAndSubunits={unitsToSelect.slice(1)}
        onFilter={this.onFilterUnitAndSubunits}
        onClear={this.onClearUnitAndSubunitsFilter}
      />
    );

    Modal.show(modal);
  }

  renderTopContent() {
    return (
      <AppContainer.TopContent style={{ minHeight: topContentHeight }}>
        <MainTitle label={Messages.get('label.riskManagement')} />
        {/* <InfoDropdown
          infoMessage={Messages.get('label.information')}
          style={{ marginRight: 'auto' }}
        /> */}
      </AppContainer.TopContent>
    );
  }

  renderFiltersSideBar() {
    const {
      planRisksToSelect,
      unitsToSelect,
      yearsToSelect,
      selectedFilters,
      strategiesToSelect,
    } = this.state;

    return (
      <FiltersSideBar
        onChange={this.onChangeHandler}
        filters={[
          { label: Messages.get('label.risk.managementPlan'), name: 'planRiskId', options: planRisksToSelect },
          {
            label: Messages.get('label.units'),
            name: 'selectedUnits',
            options: unitsToSelect,
            renderExtraContent: this.renderUnitAdvancedSearchButton,
          },
          { label: Messages.get('label.riskType'), name: 'riskTypeId', options: [defaultOption, ...riskType.list] },
          { label: Messages.get('label.period'), name: 'year', options: yearsToSelect },
          { label: Messages.get('label.risk.objectivePDIConfirmation'), name: 'strategyId', options: strategiesToSelect },
        ]}
        selectedFilters={selectedFilters}
        loading={!planRisksToSelect}
      />
    );
  }

  renderUnitAdvancedSearchButton = props => (
    <LinkButton
      {...props}
      className="frisco-secondary-color"
      style={{
        textTransform: 'none', fontSize: '11px', fontWeight: 'bold', marginTop: '1rem',
      }}
      text="Pesquisa avançada Unidade/Subunidade"
      onClick={this.openUnitAndSubunitFilterModal}
    />
  );

  renderRiskMatrixDashboard() {
    const {
      selectedFilters,
      policy,
      riskLevels,
      risks,
    } = this.state;

    return (
      <div className="col col-sm-6">
        <DashboardCard
          title={Messages.get('label.risksMatrix')}
          height={cardsHeight}
          titleClass="frisco-community-card-title"
          // infoMessage={Messages.get('label.information')}
        >
          {
            !policy || !riskLevels || !risks
              ? <LoadingGauge />
              : (
                <RiskMatrixDashboard
                  risks={risks}
                  policy={policy}
                  riskLevels={riskLevels}
                  strategyId={selectedFilters.strategyId}
                  riskTypes={getRiskTypesById(selectedFilters.riskTypeId)}
                  unitIds={this.getSelectedUnitIds()}
                  hideEye
                />
              )
          }
        </DashboardCard>
      </div>
    );
  }

  renderRiskQuantityDashboard() {
    const {
      selectedFilters,
      unitsToSelect,
      riskLevels,
      risks,
    } = this.state;

    const {
      planRiskId,
      riskTypeId,
      riskStateId,
      strategyId,
    } = selectedFilters;

    return (
      <div className="col col-sm-6">
        <DashboardCard
          title={Messages.get('label.riskQuantity')}
          height={cardsHeight}
          titleClass="frisco-community-card-title"
          // infoMessage={Messages.get('label.information')}
        >
          {
            !riskLevels || !risks
              ? <LoadingGauge />
              : (
                <RiskQuantityDashboard
                  height={cardsHeight}
                  planRiskId={planRiskId}
                  unitIds={this.getSelectedUnitIds()}
                  units={unitsToSelect}
                  riskLevels={riskLevels}
                  risks={risks}
                  riskType={getRiskTypesById(riskTypeId)}
                  strategyId={strategyId}
                  riskState={
                    riskStateId >= 0
                      ? [riskState[riskStateId]]
                      : riskState.list
                  }
                  hideEye
                />
              )
          }
        </DashboardCard>
      </div>

    );
  }

  renderRiskTypologiesDashboard() {
    const {
      risks,
      selectedFilters,
    } = this.state;

    const { riskTypeId, strategyId } = selectedFilters;

    return (
      <div className="col col-sm-12">
        <DashboardCard
          title={Messages.get('label.risksTypologies')}
          height={cardsHeight}
          titleClass="frisco-community-card-title"
          // infoMessage={Messages.get('label.information')}
        >
          {
            !risks
              ? <LoadingGauge />
              : (
                <RiskTypologyDashboard
                  unitIds={this.getSelectedUnitIds()}
                  risks={risks}
                  riskTypes={getRiskTypesById(riskTypeId)}
                  strategyId={strategyId}
                  hideEye
                />
              )
          }
        </DashboardCard>
      </div>
    );
  }

  renderIncidentsDashboard() {
    const { selectedFilters, incidents } = this.state;

    const { riskTypeId, year } = selectedFilters;

    const opportunityIsChecked = riskTypeId === -1 || riskTypeId === riskType.opportunity.id;
    const threatIsChecked = riskTypeId === -1 || riskTypeId === riskType.threat.id;

    const { chartData, options } = getChartDataAndOptions(
      year,
      this.filterByStrategy(),
      this.getSelectedUnitIds(),
      incidents,
      opportunityIsChecked,
      threatIsChecked,
    );

    return (
      <div className="col col-sm-12">
        <DashboardCard
          title={Messages.get('label.incidentsGraph')}
          height={cardsHeight}
          titleClass="frisco-community-card-title"
          // infoMessage={Messages.get('label.information')}
        >
          {
            !incidents
              ? <LoadingGauge />
              : (
                <DashboardChart
                  id="incidents-chart"
                  chartData={chartData}
                  options={options}
                  onChartClick={this.onIncidentChartClick}
                />
              )
          }
        </DashboardCard>
      </div>
    );
  }

  onIncidentChartClick = (Chart) => {
    const {
      selectedFilters,
      incidents,
    } = this.state;
    const {
      selectedUnits,
      year,
    } = selectedFilters;
    const { router } = this.context;

    const { chart } = Chart;
    const selection = chart.getSelection();

    const { row, column } = selection && selection.length > 0 ? selection[0] : {};
    if (row !== undefined && column !== undefined) {
      onChartClick(row, column, year, [selectedUnits], [-1], incidents, router, true);
    }
  }


  renderMonitoringDashboard() {
    const { risks, selectedFilters } = this.state;
    const { riskTypeId, year, strategyId } = selectedFilters;

    const monitoringData = risks
      ? getMonitoringData(
        risks,
        [-1],
        this.getSelectedUnitIds(),
        riskTypeId,
        year,
        strategyId,
      ) : null;

    return (
      <div className="col col-sm-6">
        <DashboardCard
          title={Messages.get('label.monitoring')}
          height={cardsHeight}
          titleClass="frisco-community-card-title"
          // infoMessage={Messages.get('label.information')}
        >
          {
            !risks
              ? <LoadingGauge />
              : (
                <MonitorRiskCards
                  monitoringData={monitoringData}
                  hideEye
                />
              )
          }
        </DashboardCard>
      </div>
    );
  }

  renderPreventiveActionDashboard() {
    const {
      selectedFilters,
      unitsToSelect,
      risks,
    } = this.state;

    const {
      planRiskId,
      riskTypeId,
      year,
    } = selectedFilters;

    return (
      <div className="col col-sm-6">
        {
          !risks
            ? <LoadingGauge />
            : (
              <PreventiveActionsDashboard
                height={cardsHeight}
                units={unitsToSelect}
                unitIds={this.getSelectedUnitIds()}
                planRiskId={planRiskId}
                selectedYear={year}
                riskIds={this.filterByStrategy()}
                riskTypeId={riskTypeId}
                hideEye
              />
            )
        }
      </div>
    );
  }

  renderRiskTable() {
    const { selectedFilters, risks, unitsToSelect } = this.state;

    const { riskTypeId, strategyId } = selectedFilters;

    return (
      <div>
        {
          !risks || !unitsToSelect
            ? <LoadingGauge />
            : (
              <CommunityRiskTable
                unitIds={this.getSelectedUnitIds()}
                risks={risks}
                strategyId={strategyId}
                riskType={getRiskTypesById(riskTypeId)}
                units={unitsToSelect}
              />
            )
        }
      </div>
    );
  }

  render() {
    return (
      <div className="app-body">
        {this.renderFiltersSideBar()}
        <AppContainer>
          <div style={{ height: '100%' }}>
            {this.renderTopContent()}
            <AppContainer.MainContent style={{ height: '90%' }}>
              <AppContainer.ScrollableContent>
                <AppContainer.Section>
                  <div className="row" style={{ marginBottom: '30px' }}>
                    {this.renderRiskMatrixDashboard()}
                    {this.renderRiskQuantityDashboard()}
                  </div>
                  <div className="row" style={{ marginBottom: '30px' }}>
                    {this.renderRiskTypologiesDashboard()}
                  </div>
                  <div className="row" style={{ marginBottom: '30px' }}>
                    {this.renderIncidentsDashboard()}
                  </div>
                  <div className="row" style={{ marginBottom: '30px' }}>
                    {this.renderMonitoringDashboard()}
                    {this.renderPreventiveActionDashboard()}
                  </div>
                  <div className="row">
                    {this.renderRiskTable()}
                  </div>
                </AppContainer.Section>
              </AppContainer.ScrollableContent>
            </AppContainer.MainContent>
          </div>
        </AppContainer>
      </div>
    );
  }
}

export default DashboardCommunityPanel;
