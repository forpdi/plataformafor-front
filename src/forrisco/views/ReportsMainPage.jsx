import React from 'react';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import RiskReportFilter from 'forpdi/src/forrisco/components/report/RiskReportFilter';
import RiskReportTable from 'forpdi/src/forrisco/components/report/RiskReportTable';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Toastr from 'toastr';
import Messages from 'forpdi/src/Messages';

const topContainerHeight = 30;
const scrollReferenceId = 'scroll-reference';
const scrollOffset = 75;

class RiskReportMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      planRiskId: undefined,
      unitIds: [],
      subunitIds: [],
      filters: null,
      risks: null,
      loading: false,
    };
  }

  componentDidMount() {
    RiskStore.on('risks-filtered', (response, { filtering }) => {
      this.setState({
        risks: response.data,
        total: response.total,
        loading: false,
      }, () => filtering && this.scrollToTable());
    }, this);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  scrollToTable() {
    if (!this.scrollReferenceElement) {
      this.scrollableContentElement = AppContainer.ScrollableContent.getElement();
      this.scrollReferenceElement = document.getElementById(scrollReferenceId);
    }

    this.scrollableContentElement.scrollTo({ top: 0 });
    const position = this.scrollReferenceElement.getBoundingClientRect().top
      - this.scrollableContentElement.getBoundingClientRect().top - scrollOffset;

    this.scrollableContentElement.scrollTo({ top: position, behavior: 'smooth' });
  }

  pageChange = (page, pageSize) => {
    const { risks } = this.state;
    this.setState({
      page,
      pageSize,
    }, () => risks && this.findRisks(false));
  }

  onFilter = (planRiskId, unitIds, subunitIds, filters) => {
    this.setState({
      planRiskId,
      unitIds,
      subunitIds,
      filters,
      page: 1,
    }, () => this.findRisks());
  }

  findRisks = (filtering = true) => {
    this.setState({ loading: true });

    const {
      planRiskId,
      unitIds,
      subunitIds,
      filters,
      page,
      pageSize,
    } = this.state;

    const unitAndSubunitIds = [...unitIds, ...subunitIds];

    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_RISKS,
      data: {
        planRiskId,
        page,
        pageSize,
        filters: {
          ...filters,
          unitIds: unitAndSubunitIds,
        },
      },
      opts: { filtering },
    });
  }

  exportPDF = () => {
    const {
      unitIds, subunitIds, filters, planRiskId,
    } = this.state;

    if (!unitIds || unitIds.length === 0) {
      Toastr.error('Por favor, preencha pelo menos uma unidade antes de gerar o PDF.');
      return;
    }

    const title = 'RELATÓRIO DE RISCOS';
    const filtersJson = JSON.stringify(filters);
    const url = `${UnitStore.url}/exportUnitReport?planRiskId=${encodeURIComponent(planRiskId)}&title=${encodeURIComponent(title)}&units=${encodeURIComponent(unitIds)}&subunits=${encodeURIComponent(subunitIds)}&riskFilters=${encodeURIComponent(filtersJson)}&selectedYear=-1`;
    window.open(url, title);
  }

  exportCSV = () => {
    const {
      planRiskId,
      unitIds,
      subunitIds,
      filters,
    } = this.state;

    const unitAndSubunitIds = [...unitIds, ...subunitIds];

    const filtersWithUnits = {
      ...filters,
      unitIds: unitAndSubunitIds,
    };

    const filtersJson = JSON.stringify(filtersWithUnits);

    window.location.href = `forpdi/risk/exportCSV?planRiskId=${planRiskId}&filters=${encodeURIComponent(filtersJson)}`;
  }

  renderExtractConfirmationInfo() {
    return (
      <SystemInfo>Confirme os resultados para a extração.</SystemInfo>
    );
  }

  renderContent() {
    const { loading, risks } = this.state;

    return (
      <div>
        <RiskReportFilter onFilter={this.onFilter} />
        {this.renderExtractConfirmationInfo()}
        <div id="scroll-reference" />
        <RiskReportTable
          risks={risks}
          loading={loading}
          stickyTopHead={TabbedPanel.tabsHeight + topContainerHeight}
        />

      </div>
    );
  }

  render() {
    const {
      total,
      page,
      pageSize,
      planRiskId,
    } = this.state;

    const hasPlanRiskSelected = !!planRiskId;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.reports')} />
          <div>
            <PrimaryButton
              title={Messages.get('label.exportCSV')}
              text={Messages.get('label.exportCSV')}
              onClick={this.exportCSV}
              disabled={!hasPlanRiskSelected}
              style={{ marginRight: '1rem' }}
            />
            <PrimaryButton
              title={Messages.get('label.exportPDF')}
              text={Messages.get('label.exportPDF')}
              onClick={this.exportPDF}
              disabled={!hasPlanRiskSelected}
            />
          </div>
        </AppContainer.TopContent>
        <AppContainer.MainContent>
          <TabbedPanel
            tabs={[{ label: Messages.get('label.risks') }]}
            topContainerContent={{ height: topContainerHeight }}
          >
            <TabbedPanel.MainContainer>
              {this.renderContent()}
            </TabbedPanel.MainContainer>
            <Pagination
              total={total}
              onChange={this.pageChange}
              page={page}
              pageSize={pageSize}
            />
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

export default RiskReportMainPage;
