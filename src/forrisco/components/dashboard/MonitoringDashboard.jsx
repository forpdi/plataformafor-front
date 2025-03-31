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
    };
  }

  componentDidMount() {
    const { planRiskId } = this.props;

    RiskStore.on('monitorHistoryByUnit', ({ data }) => {
      this.setState({ monitorHistoryList: data.list });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_MONITOR_HISTORY_BY_UNIT,
      data: {
        unit: -1,
        plan: planRiskId,
      },
    });

    this.refreshMonitoringData();
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  componentDidUpdate(previousProps) {
    const { riskIds: previoutsRiskIds } = previousProps;
    const { unitIds: previoutsUnitIds } = previousProps;
    const { riskIds, unitIds } = this.props;
    const risksChanged = !_.isEqual(previoutsRiskIds, riskIds);
    const unitsChanged = !_.isEqual(previoutsUnitIds, unitIds);

    if (unitsChanged || risksChanged) {
      this.refreshMonitoringData();
    }
  }

  onChartButtonClick = () => {
    const { monitorHistoryList } = this.state;
    const { unitIds, units } = this.props;
    const years = getYearsToSelect(monitorHistoryList);

    const modal = (
      <DashboardChartModal
        heading={Messages.get('label.monitor.history')}
        chartProps={{
          units,
          legends: riskState.list,
          years,
          getChartDataAndOptions: this.getChartDataAndOptions,
          defaultSelectedUnitIds: unitIds,
          id: 'monitoring-chart',
        }}
      />
    );

    Modal.show(modal);
  }

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
  }

  refreshMonitoringData = () => {
    const { risks, riskIds, unitIds } = this.props;

    const monitoringData = getMonitoringData(risks, riskIds, unitIds);
    this.setState({ monitoringData });
  }

  renderChartButton() {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '0 25px' }}>
        <IconButton icon="chart-line" onClick={this.onChartButtonClick} />
      </div>
    );
  }

  renderCards() {
    const { monitoringData } = this.state;

    return (
      <MonitorRiskCards
        monitoringData={monitoringData}
      />
    );
  }

  render() {
    const { height } = this.props;
    const { monitoringData } = this.state;

    if (!monitoringData) {
      return <LoadingGauge />;
    }

    return (
      <DashboardCard
        title={Messages.get('label.monitoring')}
        icon="chart-line"
        onIconClick={this.onChartButtonClick}
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
};

MonitoringDashboard.defaultProps = {
  riskIds: [-1],
  height: 'inherit',
};

export default MonitoringDashboard;
