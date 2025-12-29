/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
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
const cardsHeight = '26rem';
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
      years: [{ id: -1, name: 'Exibir todos' }],
      yearsToSelect: null,
      loadingProcesses: false,
    };

    this.planRiskInputName = 'selectedPlanRiskId';

    this.abortControllers = [];
    this.planRiskProcesses = [];
  }

  componentDidMount() {
    if (!EnvInfo.company) {
      return;
    }
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
        processes: [],
        selectedProcesses: [],
        loadingProcesses: true,
      }, async () => {
        await this.onChangeUnits(units);
        this.listProcessess();
      });
    }, this);

    RiskStore.on('riskbyplan', ({ data }) => {
      this.setState({
        risks: data.list,
      });
    }, this);

    ProcessStore.on('listProcessesLinkedToRisksByPlan', ({ data }) => {
      this.planRiskProcesses = data.list;
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
    });

    RiskStore.on('filteredActionsRetrieved', ({ data }) => {
      const preventiveActionData = _.filter(data.list, date => date.validityBegin != null);

      let yearsToSelect = getYearsToSelect(
        preventiveActionData,
        ({ validityBegin }) => getYearFromDateTime(validityBegin),
      );

      yearsToSelect = [
        viewAllOption,
        ...yearsToSelect,
      ];
      this.setState({ yearsToSelect });
    }, this);

    RiskStore.on('incidentbByPlan', ({ data }) => {
      const incidentsData = _.filter(data.list, date => date.begin != null);

      let years = getYearsToSelect(
        incidentsData,
        ({ begin }) => getYearFromDateTime(begin),
      );

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
    this.abortAllInFlight();
  }

  abortAllInFlight() {
    this.abortControllers.forEach(ctrl => ctrl && ctrl.abort && ctrl.abort());
    this.abortControllers = [];
  }

  async fetchProcessesByUnitIds(unitIds, {
    page, pageSize, term, sortedBy,
  } = {}) {
    this.abortAllInFlight();
    if (!unitIds || unitIds.length === 0) return [];

    const calls = unitIds.map((unitId) => {
      const ctrl = new AbortController();
      this.abortControllers.push(ctrl);

      const params = new URLSearchParams();
      if (page != null) params.append('page', page);
      if (pageSize != null) params.append('pageSize', pageSize);
      if (term) params.append('term', term);
      if (sortedBy) params.append('sortedBy', sortedBy);

      const url = `${ProcessStore.url}/${unitId}${params.toString() ? `?${params.toString()}` : ''}`;

      return fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
      }).then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json && Array.isArray(json.data)) return json.data;
        if (json && json.data && Array.isArray(json.data.list)) return json.data.list;
        if (json && Array.isArray(json.list)) return json.list;
        if (Array.isArray(json)) return json;
        return [];
      });
    });

    const results = await Promise.all(calls);
    const combined = _.flatten(results).filter(Boolean);
    const deduped = _.uniq(combined, p => p && p.id);
    return deduped;
  }

  onChangeUnits = async (newSelectedUnits) => {
    const newSelectedUnitIds = _.map(newSelectedUnits, ({ id }) => id);

    this.setState({
      selectedUnits: newSelectedUnits,
      processes: [],
      selectedProcesses: [],
      loadingProcesses: true,
    });

    try {
      const list = await this.fetchProcessesByUnitIds(newSelectedUnitIds);
      const processes = this.getUniqueProcessToSelect(list);
      this.setState({ processes, loadingProcesses: false });
    } catch (e) {
      this.setState({ processes: [], loadingProcesses: false });
    }
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
        processes: [],
        selectedProcesses: [],
        loadingProcesses: false,
      });

      this.listUnitsAndRisks(intValue);
    } else {
      this.setState({ [name]: intValue });
    }
  }

  setYearsToSelect = (newYears) => {
    const years = newYears ?? this.state.years;

    if (!Array.isArray(years) || years.length === 0) {
      this.setState({ years: [], selectedYear: -1 });
      return;
    }

    const allOption = { id: -1, name: 'Exibir todos' };

    const finalYears = [allOption, ...years];

    this.setState({
      years: finalYears,
      selectedYear: -1,
    }, () => {
    });
  };


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

  exportRiskCsv = async (exportData) => {
    document.body.style.cursor = 'wait';
    try {
      const response = await fetch('/forpdi/risk/linked-axes/exportCSV', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}. Detalhes: ${errorText}`);
      }
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'riscos.csv';
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      Modal.hide();
      alert('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      document.body.style.cursor = 'default';
    }
  }

  showExportCSVModal = () => {
    const { yearsToSelect, selectedPlanRiskId } = this.state;
    const onExport = (selectedAxis, selectedYear) => {
      const data = {
        planId: selectedPlanRiskId,
        selectedAxis,
        selectedYear,
      };
      this.exportRiskCsv(data);
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
        onClear={() => this.setState({ selectedUnits: [], processes: [], selectedProcesses: [] })} // NEW: limpa processos também
      />
    );

    Modal.show(modal);
  }

  onFilterUnitAndSubunits = async (checkedValues) => {
    const { units } = this.state;
    const selectedUnits = _.filter(units, ({ id }) => checkedValues.includes(id));
    this.setState({
      selectedUnits,
      selectedProcesses: [],
      processes: [],
      loadingProcesses: true,
    });

    try {
      const list = await this.fetchProcessesByUnitIds(selectedUnits.map(u => u.id));
      const processes = this.getUniqueProcessToSelect(list);
      this.setState({ processes, loadingProcesses: false });
    } catch (e) {
      this.setState({ processes: [], loadingProcesses: false });
    }
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
      loadingProcesses,
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
                  placeholderButtonLabel={loadingProcesses ? (Messages.get('label.loading') || 'Carregando...') : Messages.get('label.selectProcess')} // NEW
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

            {/* --- INÍCIO DA CORREÇÃO --- */}
            {/* 1. Row com Flexbox: Garante alinhamento lado a lado e mesma altura básica */}
            <div className="row" style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap' }}>

              {/* 2. Colunas Flexíveis:
                  display: flex e flexDirection: column fazem a coluna ocupar toda a altura da linha.
              */}
              <div className="col-sm-6" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* 3. Wrapper Flexível:
                    flex: 1 garante que este componente ocupe 100% da altura da coluna.
                    Removemos a altura fixa para que ele cresça conforme o conteúdo.
                */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <MonitoringDashboard
                    height={cardsHeight} // Mantemos a prop para o tamanho interno do gráfico, se usado
                    units={units}
                    riskIds={riskIds}
                    unitIds={selectedUnitIds}
                    planRiskId={selectedPlanRiskId}
                    selectedYear={selectedYear}
                    risks={risks}
                    setYearsToSelect={this.setYearsToSelect}
                  />
                </div>
              </div>

              <div className="col-sm-6" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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

            </div>
            {/* --- FIM DA CORREÇÃO --- */}

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
