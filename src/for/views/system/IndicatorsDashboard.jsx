import React from 'react';
import _ from 'underscore';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import AppContainer from 'forpdi/src/components/AppContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import IndicatorsCard from 'forpdi/src/for/components/indicatorsDashboard/IndicatorsCard';
import AdhesionsCard from 'forpdi/src/for/components/indicatorsDashboard/AdhesionsCard';
import InstitutionsCard from 'forpdi/src/for/components/indicatorsDashboard/InstitutionsCard';
import AccessHistoryCard from 'forpdi/src/for/components/indicatorsDashboard/AccessHistoryCard';
import ExportReportButtons from 'forpdi/src/for/components/ExportReportButtons';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';

import Messages from 'forpdi/src/Messages';
import CompanyStore from 'forpdi/src/forpdi/core/store/Company';
import IndicatorsDashboardStore from 'forpdi/src/forpdi/dashboard/store/IndicatorsDashboard';

import {
  dateStrIsSameOrAfter,
  dateStrIsSameOrBefore,
  dateStrIsAfter,
  nowDate,
} from 'forpdi/src/utils/dateUtil';
import CompanyType from 'forpdi/src/forpdi/planning/enum/CompanyType';
import Region from 'forpdi/src/forpdi/planning/enum/Region';
import {
  exportPdf,
  exportCsv,
  ALL_CARDS_ID,
  REGIONS_COUNT_CARD_ID,
  ACCESS_CARD_ID,
  INSTITUTIONS_CARD_ID,
} from 'forpdi/src/for/helpers/indicatorsDashboardHelper';

const mainContentHeightPercent = 78;
const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };

class IndicatorsDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      companies: null,
      loadingData: true,
      selectedRegionId: -1,
      selectedTypeId: -1,
      selectedCompanies: [],
      beginDate: null,
      endDate: null,
      beginDateError: null,
      endDateError: null,
    };
  }

  componentDidMount() {
    CompanyStore.on('companies-listed', ({ data }) => {
      this.allCompanies = data;
      this.setState({
        companies: this.allCompanies,
        selectedCompanies: this.allCompanies,
      });
    });

    IndicatorsDashboardStore.on('indicatorsDataRetrieved', ({ data }) => {
      this.indicatorsData = data;
      this.setState({ loadingData: false });
    });

    CompanyStore.dispatch({
      action: CompanyStore.ACTION_LIST_COMPANIES,
    });

    IndicatorsDashboardStore.dispatch({
      action: IndicatorsDashboardStore.GET_INDICATORS_DATA,
    });
  }

  componentWillUnmount() {
    CompanyStore.off(null, null, this);
    IndicatorsDashboardStore.off(null, null, this);
  }

  onRegionChange = (event) => {
    const selectedRegionId = parseInt(event.target.value, 10);
    const { selectedTypeId, beginDate, endDate } = this.state;
    this.onChange(selectedRegionId, selectedTypeId, beginDate, endDate);
  }

  onTypeChange = (event) => {
    const selectedTypeId = parseInt(event.target.value, 10);
    const { selectedRegionId, beginDate, endDate } = this.state;
    this.onChange(selectedRegionId, selectedTypeId, beginDate, endDate);
  }

  onCompanyChange = (selectedCompanies) => {
    this.setState({ selectedCompanies });
  }

  onPeriodChange = (beginDate, endDate) => {
    let beginDateError = null;
    let endDateError = null;
    if (beginDate && endDate && dateStrIsSameOrAfter(beginDate, endDate)) {
      beginDateError = 'A data fim não pode ser anterior da data início';
    }
    if (endDate && dateStrIsAfter(endDate, nowDate())) {
      endDateError = 'A data início não pode ser maior que a data atual';
    }
    if (!beginDateError && !endDateError) {
      const { selectedRegionId, selectedTypeId } = this.state;
      this.onChange(selectedRegionId, selectedTypeId, beginDate, endDate);
    } else {
      this.setState({
        beginDateError, endDateError, beginDate, endDate,
      });
    }
  }

  onChange(selectedRegionId, selectedTypeId, beginDate, endDate) {
    const companies = this.getFilteredCompanies(selectedRegionId, selectedTypeId, beginDate, endDate);
    this.setState({
      selectedRegionId,
      selectedTypeId,
      beginDate,
      endDate,
      beginDateError: null,
      endDateError: null,
      selectedCompanies: companies,
      companies,
    });
  }

  clearFilters = () => {
    this.setState({
      selectedRegionId: -1,
      selectedTypeId: -1,
      selectedCompanies: this.allCompanies,
      companies: this.allCompanies,
      beginDate: null,
      endDate: null,
      beginDateError: null,
      endDateError: null,
    });
  };

  getFilteredCompanies(selectedRegionId, selectedTypeId, beginDate, endDate) {
    return this.allCompanies.filter(company => (
      (selectedRegionId === -1 || company.county.uf.region.id === selectedRegionId)
      && (selectedTypeId === -1 || company.type === selectedTypeId))
      && (!beginDate || dateStrIsSameOrAfter(company.creation, beginDate))
      && (!endDate || dateStrIsSameOrBefore(company.creation, endDate)));
  }

  getFilteredIndicators(companies) {
    const { companiesFpdiIndicators, companiesFriscoIndicators } = this.indicatorsData;
    const companyIds = _.map(companies, ({ id }) => id);

    return {
      companiesFpdiIndicators: this.filterIndicators(companiesFpdiIndicators, companyIds),
      companiesFriscoIndicators: this.filterIndicators(companiesFriscoIndicators, companyIds),
    };
  }

  filterIndicators(indicators, companyIds) {
    return _.filter(
      indicators,
      ({ company }) => companyIds.includes(company.id),
    );
  }

  getRegionCounts() {
    const { regionsCounts } = this.indicatorsData;
    const { selectedRegionId } = this.state;

    if (selectedRegionId === -1) {
      return regionsCounts;
    }

    return regionsCounts.filter(region => region.regionId === selectedRegionId);
  }

  getCompaniesAccessHistory(companies) {
    const { companiesAccessHistory } = this.indicatorsData;
    const companyIds = _.map(companies, ({ id }) => id);
    return _.filter(companiesAccessHistory, ({ companyId }) => companyIds.includes(companyId));
  }

  getCompaniesIndicators(companies) {
    const { companiesIndicators } = this.indicatorsData;
    const companyIds = _.map(companies, ({ id }) => id);

    return _.filter(companiesIndicators, ({ id }) => companyIds.includes(id));
  }

  getFpdiIndicators(companiesFpdiIndicators) {
    return [
      {
        name: 'Quantidade de PDI vigentes',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'planMacros'),
      }, {
        name: 'Plano de metas',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'plans'),
      }, {
        name: 'Eixos temáticos',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'axes'),
      }, {
        name: 'Objetivos',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'objectives'),
      }, {
        name: 'Indicadores',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'indicators'),
      }, {
        name: 'Metas',
        value: this.getCountByIndicator(companiesFpdiIndicators, 'goals'),
      },
    ];
  }

  getFriscoIndicators(companiesFriscoIndicators) {
    return [
      {
        name: 'Quantidade de Plano de Gestão de riscos vigentes',
        value: this.getCountByIndicator(companiesFriscoIndicators, 'planRisks'),
      }, {
        name: 'Políticas',
        value: this.getCountByIndicator(companiesFriscoIndicators, 'policies'),
      }, {
        name: 'Riscos',
        value: this.getCountByIndicator(companiesFriscoIndicators, 'risks'),
      }, {
        name: 'Realizando monitoramento',
        value: this.getCountByIndicator(companiesFriscoIndicators, 'monitoredRisks'),
      },
    ];
  }

  getCountByIndicator(companiesIndicators, indicatorField) {
    return _.reduce(companiesIndicators, (memo, ci) => memo + ci[indicatorField], 0);
  }

  onExportPdf = (cardId) => {
    const {
      selectedRegionId,
      selectedTypeId,
      beginDate,
      endDate,
      selectedCompanies,
    } = this.state;
    const checkedValues = [selectedRegionId, selectedTypeId, beginDate, endDate, selectedCompanies];
    exportPdf(checkedValues, cardId);
  }

  onExportCsv = (cardId) => {
    const {
      selectedRegionId,
      selectedTypeId,
      selectedCompanies,
      beginDate,
      endDate,
    } = this.state;
    const filters = {
      regionId: selectedRegionId,
      typeId: selectedTypeId,
      companyIds: _.map(selectedCompanies, ({ id }) => id),
      companyCreationBegin: beginDate,
      companyCreationEnd: endDate,
    };
    exportCsv(filters, cardId);
  }

  hasSelectedCompanies() {
    const { selectedCompanies } = this.state;
    return selectedCompanies.length > 0;
  }

  renderTopContent() {
    const {
      companies,
      selectedRegionId,
      selectedCompanies,
      selectedTypeId,
      beginDate,
      endDate,
      beginDateError,
      endDateError,
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
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <MainTitle label={Messages.get('label.indicatorsPanel')} />
              {
                this.hasSelectedCompanies() && (
                  <ExportReportButtons
                    onExportPdf={() => this.onExportPdf(ALL_CARDS_ID)}
                    onExportCsv={() => this.onExportCsv(ALL_CARDS_ID)}
                  />
                )
              }
            </div>
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
                name="selectedRegionId"
                options={[viewAllOption, ...Region.list]}
                label="Região"
                value={selectedRegionId}
                onChange={this.onRegionChange}
                containerStyle={{ flex: 1 }}
              />
              <div style={{ flex: 1 }}>
                <SelectBox
                  name="selectedTypeId"
                  label="Tipo"
                  onChange={this.onTypeChange}
                  options={[viewAllOption, ...CompanyType.list]}
                  value={selectedTypeId}
                />
              </div>
              <div style={{ flex: 1 }}>
                <MultiSelectWithSelectAll
                  label="Instituição"
                  onChange={this.onCompanyChange}
                  options={companies}
                  placeholderButtonLabel={Messages.get('label.selectOneUnit')}
                  selectedOptions={selectedCompanies}
                  hideSearchField={false}
                />
              </div>
              <div>
                <DatePickerRange
                  beginValue={beginDate}
                  endValue={endDate}
                  label="Período de adesão"
                  onChange={this.onPeriodChange}
                  beginErrorMsg={beginDateError}
                  endErrorMsg={endDateError}
                />
              </div>
              <div style={{ marginTop: '34px' }}>
                <PrimaryButton
                  onClick={this.clearFilters}
                  title="Limpar Filtro"
                  text="Limpar Filtro"
                />
              </div>
            </div>
          </div>
        </div>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const {
      selectedCompanies, companies, beginDate, endDate,
    } = this.state;

    const regionCounts = this.getRegionCounts();

    const { companiesFpdiIndicators, companiesFriscoIndicators } = this.getFilteredIndicators(selectedCompanies);

    if (!this.hasSelectedCompanies()) {
      return <SecondaryTitle style={{ marginLeft: '56px' }}>Selecione uma instituição</SecondaryTitle>;
    }

    const accessHistory = this.getCompaniesAccessHistory(selectedCompanies);

    return (
      <AppContainer.MainContent style={{ height: `${mainContentHeightPercent}%` }}>
        <AppContainer.ScrollableContent>
          <AppContainer.Section>
            <AdhesionsCard
              selectedCompanies={selectedCompanies}
              totalCompanies={this.allCompanies.length}
              regionCounts={regionCounts}
              companies={companies}
              onExportPdf={() => this.onExportPdf(REGIONS_COUNT_CARD_ID)}
              onExportCsv={() => this.onExportCsv(REGIONS_COUNT_CARD_ID)}
            />
            <div className="row" style={{ marginTop: '30px' }}>
              <div className="col col-sm-6">
                <IndicatorsCard
                  title="PDI em números"
                  indicators={this.getFpdiIndicators(companiesFpdiIndicators)}
                />
              </div>
              <div className="col col-sm-6">
                <IndicatorsCard
                  title="Riscos em números"
                  indicators={this.getFriscoIndicators(companiesFriscoIndicators)}
                />
              </div>
            </div>
            <div style={{ marginTop: '30px' }}>
              <AccessHistoryCard
                companiesAccessHistory={accessHistory}
                beginDate={beginDate}
                endDate={endDate}
                onExportPdf={() => this.onExportPdf(ACCESS_CARD_ID)}
                onExportCsv={() => this.onExportCsv(ACCESS_CARD_ID)}
              />
            </div>
            <div style={{ marginTop: '30px' }}>
              <InstitutionsCard
                companiesIndicators={this.getCompaniesIndicators(selectedCompanies)}
                companiesAccessHistory={accessHistory}
                beginDate={beginDate}
                endDate={endDate}
                onExportPdf={() => this.onExportPdf(INSTITUTIONS_CARD_ID)}
                onExportCsv={() => this.onExportCsv(INSTITUTIONS_CARD_ID)}
              />
            </div>
          </AppContainer.Section>
        </AppContainer.ScrollableContent>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { companies, loadingData } = this.state;

    if (!companies || loadingData) {
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

export default IndicatorsDashboard;
