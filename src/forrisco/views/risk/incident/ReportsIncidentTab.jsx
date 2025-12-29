import React from 'react';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import IncidentReportFilter from 'forpdi/src/forrisco/components/report/IncidentReportFilter';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import IncidentReportTable from '../../../components/report/IncidentReportTable';

const topContainerHeight = 30;

class ReportIncidentTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planRiskId: undefined,
      unitIds: [],
      subunitIds: [],
      filters: null,

      incidents: null,
      total: 0,
      loading: false,
    };
  }

  componentDidMount() {
    RiskStore.on(
      'incidents-filtered',
      (payload) => {
        this.setState({
          incidents: (payload && (payload.data || [])) || [],
          total: (payload && payload.total) || 0,
          loading: false,
        });
      },
      this,
    );
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onFilter = (planRiskId, unitIds, subunitIds, filters) => {
    this.setState(
      {
        planRiskId,
        unitIds,
        subunitIds,
        filters,
      },
      this.fetchIncidents,
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('REPORTS_INCIDENT_FILTER', {
          detail: {
            planRiskId,
            unitIds,
            subunitIds,
            filters,
          },
        }),
      );
    }
  };

  fetchIncidents = () => {
    const {
      planRiskId, unitIds, subunitIds, filters,
    } = this.state;
    if (!planRiskId) return;

    this.setState({ loading: true });

    const rawType = filters && filters.type;
    let typeId = null;
    if (rawType !== undefined && rawType !== null && String(rawType).trim() !== '') {
      const parsed = parseInt(String(rawType), 10);
      if (!Number.isNaN(parsed)) {
        typeId = parsed;
      }
    }

    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_INCIDENTS,
      data: {
        planRiskId,
        unitIds: [].concat(unitIds || [], subunitIds || []),
        incident: (filters && filters.incident) || null,
        type: typeId,
        startCreation: filters && filters.startCreation,
        endCreation: filters && filters.endCreation,
        page: 1,
        pageSize: 50,
      },
      opts: { filtering: true },
    });
  };

  renderExtractConfirmationInfo() {
    const { incidents, total } = this.state;
    const hasResults = Array.isArray(incidents);
    return (
      <SystemInfo>
        {hasResults ? `Confirme os resultados para a extração. (${total} incidente${total === 1 ? '' : 's'})` : 'Confirme os resultados para a extração.'}
      </SystemInfo>
    );
  }

  render() {
    const { loading, incidents } = this.state;

    return (
      <TabbedPanel.MainContainer>
        <IncidentReportFilter onFilter={this.onFilter} />
        {this.renderExtractConfirmationInfo()}
        <div id="scroll-reference" />
        <IncidentReportTable
          incidents={incidents}
          loading={loading}
          stickyTopHead={TabbedPanel.tabsHeight + topContainerHeight}
        />
        <div id="scroll-reference" />
      </TabbedPanel.MainContainer>
    );
  }
}

ReportIncidentTab.propTypes = {};
ReportIncidentTab.defaultProps = {};

export default ReportIncidentTab;
