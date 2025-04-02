import React from 'react';
import _ from 'underscore';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import AppContainer from 'forpdi/src/components/AppContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import RiskDashboards from 'forpdi/src/forrisco/components/dashboard/RiskDashboards';
import IncidentsDashboard from 'forpdi/src/forrisco/components/dashboard/IncidentsDashboard';
import MonitoringDashboard from 'forpdi/src/forrisco/components/dashboard/MonitoringDashboard';
import PreventiveActionsDashboard from 'forpdi/src/forrisco/components/dashboard/PreventiveActionsDashboard';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Text from 'forpdi/src/components/typography/Text';
import ExportReportModal from 'forpdi/src/components/modals/ExportReportModal';
import ExportCSVModal from 'forpdi/src/forrisco/components/dashboard/ExportCSVModal';
import Modal from 'forpdi/src/components/modals/Modal';
import LinkButton from 'forpdi/src/components/buttons/LinkButton';
import UnitsAndSubunitsFilterModal from 'forpdi/src/forrisco/components/dashboard/UnitsAndSubunitsFilterModal';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';

import { getYearsToSelect } from 'forpdi/src/utils/util';
import { getYearFromDateTime } from 'forpdi/src/utils/dateUtil';
import Messages from 'forpdi/src/Messages';

import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';

const mainContentHeightPercent = 71;
const cardsHeight = '21rem';
const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };

class DashboardMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planRisks: null,
      selectedPlanRiskId: undefined,
      selectedUnits: [],
      selectedYear: -1,
      units: null,
      risks: null,
      processes: [],
      selectedProcesses: [],
      years: undefined,
      yearsToSelect: null,
    };

    this.planRiskInputName = 'selectedPlanRiskId';
  }

  componentDidMount() {
    PlanRiskStore.on('list-to-select', ({ data }) => {
      const { list } = data;
      const firstPlanRisk = list && list.length > 0 && list[0];
      const selectedPlanRiskId = firstPlanRisk && firstPlanRisk.id;
      this.setState({
        planRisks: list,
        selectedPlanRiskId,
      });
      selectedPlanRiskId && this.listUnitsAndRisks(selectedPlanRiskId);
    }, this);

    UnitStore.on('listToSelect', ({ data }) => {
      const units = data.list;
      this.setState({
        units,
        selectedUnits: units,
      });

      this.listProcessess();
    }, this);

    RiskStore.on('riskbyplan', ({ data }) => {
      this.setState({
        risks: data.list,
      });
    }, this);

    ProcessStore.on('listProcessesLinkedToRisksByPlan', ({ data }) => {
      this.planRiskProcesses = data.list;
      if (this.planRiskProcesses.length > 0) {
        const processes = this.getUniqueProcessToSelect(this.planRiskProcesses);

        this.setState({ processes });
      }
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
    });

    RiskStore.on('filteredActionsRetrieved', ({ data }) => {
      const preventiveActionData = _.filter(data.list, date => date.validityBegin != null);

      let yearsToSelect = getYearsToSelect(preventiveActionData,
        ({ validityBegin }) => getYearFromDateTime(validityBegin));

      yearsToSelect = [
        viewAllOption,
        ...yearsToSelect,
      ];
      this.setState({ yearsToSelect });
    }, this);

    RiskStore.on('incidentbByPlan', ({ data }) => {
      const incidentsData = _.filter(data.list, date => date.begin != null);

      let years = getYearsToSelect(incidentsData,
        ({ begin }) => getYearFromDateTime(begin));

      years = [
        viewAllOption,
        ...years,
      ];
      this.setState({ years });
    }, this);
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
    ProcessStore.off(null, null, this);
  }

  onChangeUnits = (newSelectedUnits) => {
    const newSelectedUnitIds = _.map(newSelectedUnits, ({ id }) => id);
    const newProcess = _.filter(
      this.planRiskProcesses,
      ({ unitId }) => newSelectedUnitIds.includes(unitId),
    );

    this.setState({
      selectedUnits: newSelectedUnits,
      processes: newProcess.length > 0 ? this.getUniqueProcessToSelect(newProcess) : [],
      selectedProcesses: [],
    });
  }

  getUniqueProcessToSelect(allProcess) {
    return _.uniq(
      _.map(allProcess, ({ id, name }) => ({ id, name })),
      ({ id }) => id,
    );
  }

  onChangeProcesses = (newSelectedProcesses) => {
    this.setState({
      selectedProcesses: newSelectedProcesses,
    });
  }

  onChange = (event) => {
    const { name, value } = event.target;
    const intValue = parseInt(value, 10);

    if (name === this.planRiskInputName) {
      this.setState({
        selectedPlanRiskId: intValue,
        selectedUnits: [],
        selectedYear: undefined,
        units: null,
        risks: null,
        years: null,
      });

      this.listUnitsAndRisks(intValue);
    } else {
      this.setState({ [name]: intValue });
    }
  }

  setYearsToSelect = () => {
    const { years } = this.state;
    this.setState({ years, selectedYear: years[0].id });
  }

  listUnitsAndRisks(planRiskId) {
    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_TO_SELECT,
      data: { planRiskId },
    });
    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_BY_PLAN,
      data: planRiskId,
    });
  }

  listProcessess() {
    const { selectedPlanRiskId } = this.state;
    ProcessStore.dispatch({
      action: ProcessStore.ACTION_LIST_BY_PLAN_LINKED_TO_RISKS,
      data: { id: selectedPlanRiskId },
    });
  }

  showExportReportModal = () => {
    const { units, selectedPlanRiskId } = this.state;

    const unitTopic = Messages.get('label.units');
    const subunitTopic = Messages.get('label.subunitys');
    const options = {
      [unitTopic]: [],
      [subunitTopic]: [],
    };

    _.forEach(units, ({ id, name, parentId }) => {
      const topic = !parentId ? unitTopic : subunitTopic;
      options[topic].push({ id, name });
    });

    const onExport = (universityName, checkedValues) => {
      const selecao = checkedValues.join(',');
      const url = `${PlanRiskStore.url}/exportBoardReport?planId=${selectedPlanRiskId}&title=${encodeURIComponent(universityName)}&selecao=${encodeURIComponent(selecao)}`;
      window.open(url, universityName);
    };

    const modal = (
      <ExportReportModal
        onExport={onExport}
        options={options}
      />
    );

    Modal.show(modal);
  }

  showExportCSVModal = () => {
    const { yearsToSelect, selectedPlanRiskId } = this.state;

    const onExport = (selectedAxis, selectedYear) => {
      const data = {
        selectedAxis,
        selectedYear,
        planId: selectedPlanRiskId,
      };
      window.location.href = `forpdi/risk/linked-axes/exportCSV?${ new URLSearchParams(data).toString()}`;
    };

    const modal = (
      <ExportCSVModal
        onExport={onExport}
        years={yearsToSelect}
      />
    );

    Modal.show(modal);
  }

  hasUnits() {
    const { units } = this.state;
    return units && units.length > 0;
  }

  openUnitAndSubunitFilterModal = () => {
    const { units, selectedUnits } = this.state;

    const defaultCheckedValues = _.map(selectedUnits, ({ id }) => id);

    const modal = (
      <UnitsAndSubunitsFilterModal
        defaultCheckedValues={defaultCheckedValues}
        unitsAndSubunits={units}
        onFilter={this.onFilterUnitAndSubunits}
        onClear={() => this.setState({ selectedUnits: [] })}
      />
    );

    Modal.show(modal);
  }

  onFilterUnitAndSubunits = (checkedValues) => {
    const { units } = this.state;
    this.setState({
      selectedUnits: _.filter(units, ({ id }) => checkedValues.includes(id)),
    });
  }

  getFilteredRiskIds() {
    const { selectedProcesses } = this.state;
    if (selectedProcesses.length === 0) {
      return [-1];
    }

    const selectedProcessIds = _.map(selectedProcesses, ({ id }) => id);

    return _.map(
      _.filter(this.planRiskProcesses, ({ id }) => selectedProcessIds.includes(id)),
      ({ riskId }) => riskId,
    );
  }

  renderTopContent() {
    const {
      planRisks,
      selectedPlanRiskId,
      units,
      selectedUnits,
      selectedYear,
      years,
      processes,
      selectedProcesses,
    } = this.state;

    return (
      <AppContainer.TopContent style={{ height: `${100 - mainContentHeightPercent}%` }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <div>
            <MainTitle label={Messages.get('label.dashboard')} />
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              alignItems: 'flex-start',
              gap: '1rem',
              marginTop: '1rem',
            }}
            >
              <SelectBox
                name={this.planRiskInputName}
                options={planRisks}
                label={Messages.get('label.risk.managementPlan')}
                value={selectedPlanRiskId}
                onChange={this.onChange}
                containerStyle={{ flex: 1 }}
              />
              <div style={{ flex: 1 }}>
                <MultiSelectWithSelectAll
                  label={Messages.get('label.unitys')}
                  onChange={this.onChangeUnits}
                  options={units}
                  placeholderButtonLabel={Messages.get('label.selectOneUnit')}
                  selectedOptions={selectedUnits}
                  hideSearchField={false}
                />
                <LinkButton
                  className="frisco-primary-color"
                  style={{
                    textTransform: 'none', fontSize: '11px', fontWeight: 'bold', marginTop: '5px',
                  }}
                  text="Pesquisa avançada Unidade/Subunidade"
                  onClick={this.openUnitAndSubunitFilterModal}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MultiSelectWithSelectAll
                  label={Messages.get('label.processes')}
                  onChange={this.onChangeProcesses}
                  options={processes}
                  selectedOptions={selectedProcesses}
                  placeholderButtonLabel={Messages.get('label.selectProcess')}
                  placeholderToEmpty={Messages.get('label.noLinkedProcesses')}
                />
              </div>
              <div style={{ flex: 1 }}>
                <SelectBox
                  name="selectedYear"
                  options={years}
                  label={Messages.get('label.period')}
                  value={selectedYear}
                  onChange={this.onChange}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: 'flex-end',
            }}
          >
            {
              this.hasUnits() && (
                <div>
                  <PrimaryButton
                    title={Messages.get('label.exportReport')}
                    text={Messages.get('label.exportReport')}
                    onClick={this.showExportReportModal}
                    style={{ marginRight: '1rem' }}
                  />
                  <PrimaryButton
                    title={Messages.get('label.exportCSV')}
                    text={Messages.get('label.exportCSV')}
                    onClick={this.showExportCSVModal}
                  />
                </div>
              )
            }
          </div>
        </div>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const {
      planRisks,
      selectedPlanRiskId,
      units,
      selectedYear,
      selectedUnits,
      risks,
    } = this.state;

    const selectedUnitIds = selectedUnits.map(unit => unit.id);

    if (planRisks.length === 0) {
      return this.renderEmptyContent();
    }

    if (!risks) {
      return <LoadingGauge />;
    }

    const riskIds = this.getFilteredRiskIds();

    return (
      <AppContainer.MainContent style={{ height: `${mainContentHeightPercent}%` }}>
        <AppContainer.ScrollableContent>
          <AppContainer.Section>
            <RiskDashboards
              height={cardsHeight}
              units={units}
              riskMatrixStyle={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
              riskIds={riskIds}
              unitIds={selectedUnitIds}
              planRiskId={selectedPlanRiskId}
              risks={risks}
            />
            <IncidentsDashboard
              height={cardsHeight}
              units={units}
              planRiskId={selectedPlanRiskId}
              riskIds={riskIds}
              unitIds={selectedUnitIds}
              selectedYear={selectedYear}
              setYearsToSelect={this.setYearsToSelect}
            />
            <div className="row" style={{ marginTop: '30px' }}>
              <div className="col col-sm-6">
                <MonitoringDashboard
                  height={cardsHeight}
                  units={units}
                  riskIds={riskIds}
                  unitIds={selectedUnitIds}
                  planRiskId={selectedPlanRiskId}
                  selectedYear={selectedYear}
                  risks={risks}
                />
              </div>
              <div className="col col-sm-6">
                <PreventiveActionsDashboard
                  height={cardsHeight}
                  units={units}
                  riskIds={riskIds}
                  unitIds={selectedUnitIds}
                  planRiskId={selectedPlanRiskId}
                  risks={risks}
                />
              </div>
            </div>
          </AppContainer.Section>
        </AppContainer.ScrollableContent>
      </AppContainer.MainContent>
    );
  }

  renderEmptyContent() {
    return (
      <Text style={{ textAlign: 'center', fontSize: '15px' }}>
        {Messages.get('label.noRecords')}
      </Text>
    );
  }

  render() {
    const { planRisks, units } = this.state;

    if (!planRisks || !units) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

export default DashboardMainPage;
