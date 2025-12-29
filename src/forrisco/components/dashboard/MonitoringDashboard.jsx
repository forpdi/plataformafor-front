import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import MonitorRiskCards from 'forpdi/src/forrisco/components/risk/monitor/MonitorRiskCards';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import DashboardChartModal from 'forpdi/src/components/modals/DashboardChartModal';
import Modal from 'forpdi/src/components/modals/Modal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getMonitoringData, getChartDataAndOptions } from 'forpdi/src/forrisco/helpers/dashboard/monitoringDashboardHelper';
import { getYearsToSelect } from 'forpdi/src/utils/util';
import riskState from 'forpdi/src/forrisco/enums/riskState';

class MonitoringDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitorHistoryList: null,
      monitoringData: null,
      isFetchingHistory: false,
    };
  }

  componentDidMount() {
    const { planRiskId, setYearsToSelect } = this.props;

    RiskStore.on(
      'monitorHistoryByUnit',
      ({ data }) => {
        const list = (data && (data.list || data)) || [];
        this.setState({ monitorHistoryList: list, isFetchingHistory: false });

        try {
          const years = getYearsToSelect(list) || [];
          if (typeof setYearsToSelect === 'function' && years.length) {
            setYearsToSelect(years);
          }
        } catch {
          // ignora falhas de cálculo de anos
        }
      },
      this,
    );

    this.fetchMonitorHistory(planRiskId);
    this.refreshMonitoringData();
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  componentDidUpdate(prevProps) {
    const { riskIds, unitIds, planRiskId } = this.props;
    const { riskIds: prevRiskIds, unitIds: prevUnitIds, planRiskId: prevPlanId } = prevProps;

    const risksChanged = !_.isEqual(prevRiskIds, riskIds);
    const unitsChanged = !_.isEqual(prevUnitIds, unitIds);
    const planChanged = prevPlanId !== planRiskId;

    if (risksChanged || unitsChanged) {
      this.refreshMonitoringData();
    }

    if (planChanged) {
      this.fetchMonitorHistory(planRiskId);
    }
  }

  fetchMonitorHistory = (planRiskId) => {
    this.setState({ isFetchingHistory: true });

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_MONITOR_HISTORY_BY_UNIT,
      data: { unit: -1, plan: planRiskId },
    });
  };

  onChartButtonClick = () => {
    const { monitorHistoryList } = this.state;
    const { unitIds, units, selectedYear } = this.props;

    if (!monitorHistoryList || monitorHistoryList.length === 0) return;

    const years = getYearsToSelect(monitorHistoryList) || [];

    const modal = (
      <DashboardChartModal
        heading={Messages.get('label.monitor.history')}
        chartProps={{
          units,
          legends: riskState.list,
          years,
          defaultSelectedYear: selectedYear,
          defaultSelectedUnitIds: unitIds,
          id: 'monitoring-chart',
          getChartDataAndOptions: this.getChartDataAndOptions,
        }}
      />
    );

    Modal.show(modal);
  };

  getChartDataAndOptions = (selectedYear, unitIdsSelectedInChart, legendChecks) => {
    const { monitorHistoryList } = this.state;
    const selectedStates = _.filter(riskState.list, ({ id }) => !!legendChecks[id]);
    const selectedStateNames = _.map(selectedStates, ({ name }) => name);

    return getChartDataAndOptions(
      monitorHistoryList,
      unitIdsSelectedInChart,
      selectedYear,
      selectedStateNames,
    );
  };

  refreshMonitoringData = () => {
    const { risks, riskIds, unitIds } = this.props;
    const monitoringData = getMonitoringData(risks, riskIds, unitIds);
    this.setState({ monitoringData });
  };

  renderChartButton() {
    const { monitorHistoryList, isFetchingHistory } = this.state;

    if (isFetchingHistory || !monitorHistoryList || monitorHistoryList.length === 0) {
      return null;
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 25px' }}>
        <IconButton icon="chart-line" onClick={this.onChartButtonClick} />
      </div>
    );
  }

  renderCards() {
    const { monitoringData } = this.state;
    const { units } = this.props;

    return <MonitorRiskCards monitoringData={monitoringData} units={units} />;
  }

  render() {
    const { height } = this.props;
    const { monitoringData, monitorHistoryList, isFetchingHistory } = this.state;

    if (!monitoringData) {
      return <LoadingGauge />;
    }

    const canOpenChart = !isFetchingHistory
      && Array.isArray(monitorHistoryList)
      && monitorHistoryList.length > 0;

    return (
      <DashboardCard
        title={Messages.get('label.monitoring')}
        icon="chart-line"
        onIconClick={canOpenChart ? this.onChartButtonClick : undefined}
        height={height}
      >
        {this.renderChartButton()}
        {this.renderCards()}
      </DashboardCard>
    );
  }
}

MonitoringDashboard.contextTypes = {
  router: PropTypes.shape({}),
};

MonitoringDashboard.propTypes = {
  height: PropTypes.string,
  planRiskId: PropTypes.number.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  risks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number),
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setYearsToSelect: PropTypes.func,
  selectedYear: PropTypes.number,
};

MonitoringDashboard.defaultProps = {
  riskIds: [-1],
  height: 'inherit',
  setYearsToSelect: undefined,
  selectedYear: undefined,
};

export default MonitoringDashboard;
