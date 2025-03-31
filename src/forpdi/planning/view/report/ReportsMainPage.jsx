import React from 'react';
import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import PDIReportFilter from './FpdiReportFilter';
import FpdiReportTable from './FpdiReportTable';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import Messages from 'forpdi/src/Messages';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Toastr from 'toastr';
import StructureStore from "forpdi/src/forpdi/planning/store/Structure";


const topContainerHeight = 30;
const scrollReferenceId = 'scroll-reference';
const scrollOffset = 75;

class PDIReportMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      filters: null,
      reportData: null,
      loading: false,
      totalItems: 0,
    };
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
  };

  updateTotalItems = (totalItems) => {
    this.setState({ totalItems });
  };

  onFilter = (filters) => {
    this.setState({
      filters,
      page: 1,
    }, () => this.findReports());
  };

  handlePageChange = (page, pageSize) => {
    const { reportData } = this.state;
    this.setState({
      page,
      pageSize,
    }, () => reportData && this.findReports(false));
  };

  findReports = (filtering = true) => {
    this.setState({ loading: true });

    const {
      filters,
      page,
      pageSize,
    } = this.state;

    this.setState({ loading: false });
  };

  exportPDF = () => {
    const { filters } = this.state;
  
    if (!filters || !filters.selectedPlanId) {
      Toastr.error('Por favor, selecione um plano antes de gerar o PDF.');
      return;
    }

    let levelInstance = null;
  
    if (filters.selectedIndicatorId && filters.selectedIndicatorId !== -1) {
      levelInstance = filters.selectedIndicatorId;
    } else if (filters.selectedObjectivesId && filters.selectedObjectivesId !== -1) {
      levelInstance = filters.selectedObjectivesId;
    } else if (filters.selectedStrategicAxisId && filters.selectedStrategicAxisId !== -1) {
      levelInstance = filters.selectedStrategicAxisId;
    }
  
    const queryParams = new URLSearchParams({
      macro: filters.selectedPlanId,
      plan: filters.selectedSubplanId,
      levelInstance: levelInstance,
    });
  
    const title = 'RELATÓRIO DE PLANOS';
    const url = `${StructureStore.url}/exportPDF?${queryParams.toString()}`;
    window.open(url, title);
  };
  

  renderExtractConfirmationInfo() {
    return (
      <SystemInfo>Confirme os resultados para a extração.</SystemInfo>
    );
  }

  renderContent() {
    const { filters, page, pageSize } = this.state;

    return (
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <PDIReportFilter onFilter={this.onFilter} />
        {this.renderExtractConfirmationInfo()}
        <div id="scroll-reference" />
        <FpdiReportTable
          selectedPlanId={filters ? filters.selectedPlanId : null}
          selectedSubplanId={filters ? filters.selectedSubplanId : null}
          selectedStrategicAxisId={filters ? filters.selectedStrategicAxisId : null}
          selectedObjectivesId={filters ? filters.selectedObjectivesId : null}
          selectedIndicatorId={filters ? filters.selectedIndicatorId : null}
          selectedGoalId={filters ? filters.selectedGoalId : null}
          startDate={filters ? filters.startDate : null}
          endDate={filters ? filters.endDate : null}
          selectedGoalStatus={filters ? filters.selectedGoalStatus : -1}
          selectedGoalProgressStatus={filters ? filters.selectedGoalProgressStatus: -1}
          page={page}
          pageSize={pageSize}
          updateTotalItems={this.updateTotalItems}
          stickyTopHead={TabbedPanel.tabsHeight + topContainerHeight}
        />
      </div>
    );
  }

  render() {
    const { totalItems, page, pageSize, filters } = this.state;

    const hasPlanSelected = filters && filters.selectedPlanId;

    return (
      <AppContainer.Content style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.reports')} />
          <div>
            <PrimaryButton
              title={Messages.get('label.exportPDF')}
              text={Messages.get('label.exportPDF')}
              onClick={this.exportPDF}
              disabled={!hasPlanSelected}
            />
          </div>
        </AppContainer.TopContent>
        <AppContainer.MainContent style={{ flexGrow: 1, overflowY: 'auto' }}>
          <TabbedPanel
            tabs={[{ label: Messages.get('label.goalsPlan') }]}
            topContainerContent={{ height: topContainerHeight }}
          >
            <TabbedPanel.MainContainer>
              {this.renderContent()}
            </TabbedPanel.MainContainer>
            <Pagination
              total={totalItems}
              onChange={this.handlePageChange}
              page={page}
              pageSize={pageSize}
            />
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

export default PDIReportMainPage;
