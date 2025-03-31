import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import DashboardChartPanel from 'forpdi/src/components/dashboard/DashboardChartPanel';
import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import Messages from 'forpdi/src/Messages';
import { getChartDataAndOptions, onChartClick } from 'forpdi/src/forrisco/helpers/dashboard/incidentDashboardHelper';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import { getYearsToSelect } from 'forpdi/src/utils/util';
import { getYearFromDateTime, nowDateYear } from 'forpdi/src/utils/dateUtil';

const legends = [
  { id: riskType.threat.id, label: Messages.get('label.risk.threats'), color: riskType.threat.color },
  { id: riskType.opportunity.id, label: Messages.get('label.risk.opportunities'), color: riskType.opportunity.color },
];

class IncidentsDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      incidents: null,
      shouldRefreshChart: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const { riskIds } = this.props;
    const risksChanged = !_.isEqual(newProps.riskIds, riskIds);

    this.setState({ shouldRefreshChart: risksChanged });
  }

  componentDidMount() {
    const { planRiskId, setYearsToSelect } = this.props;

    RiskStore.on('incidentbByPlan', ({ data }) => {
      if (data.length > 0) {
        this.yearsToSelect = getYearsToSelect(data, ({ begin }) => getYearFromDateTime(begin));
      } else {
        this.yearsToSelect = getYearsToSelect([{ year: parseInt(nowDateYear(), 10) }]);
      }

      setYearsToSelect(this.yearsToSelect);

      this.setState({ incidents: data.list });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_INCIDENTS_BY_PLAN,
      data: planRiskId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  getChartDataAndOptions = (selectedYear, unitIds, legendChecks) => {
    const { riskIds } = this.props;
    const opportunitiesChecked = legendChecks[riskType.opportunity.id];
    const threatsChecked = legendChecks[riskType.threat.id];
    const { incidents } = this.state;

    this.setState({ shouldRefreshChart: false });

    return getChartDataAndOptions(
      selectedYear,
      riskIds,
      unitIds,
      incidents,
      opportunitiesChecked,
      threatsChecked,
    );
  }

  render() {
    const {
      height,
      units,
      riskIds,
      unitIds,
      selectedYear,
    } = this.props;
    const { incidents, shouldRefreshChart } = this.state;
    const { router } = this.context;

    if (!incidents) {
      return <LoadingGauge />;
    }

    return (
      <DashboardCard
        title={Messages.get('label.incidents')}
        height={height}
      >
        <DashboardChartPanel
          id="incidents-chart"
          units={units}
          years={this.yearsToSelect}
          externalSelectedRiskIds={riskIds}
          externalSelectedUnitIds={unitIds}
          externalSelectedYear={selectedYear}
          legends={legends}
          getChartDataAndOptions={this.getChartDataAndOptions}
          onChartClick={(...args) => onChartClick(...args, riskIds, incidents, router)}
          shouldRefresh={shouldRefreshChart}
        />
      </DashboardCard>
    );
  }
}

IncidentsDashboard.contextTypes = {
  router: PropTypes.shape({}),
};

IncidentsDashboard.propTypes = {
  height: PropTypes.string,
  planRiskId: PropTypes.number.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setYearsToSelect: PropTypes.func.isRequired,
  selectedYear: PropTypes.number,
  riskIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.number),
};

IncidentsDashboard.defaultProps = {
  height: 'inherit',
  selectedYear: null,
  unitIds: null,
};

export default IncidentsDashboard;
