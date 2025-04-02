import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import PreventiveActionsCards from 'forpdi/src/forrisco/components/risk/preventiveAction/PreventiveActionsCards';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { filterPreventiveActionData } from 'forpdi/src/forrisco/helpers/dashboard/preventiveActionDashboardHelper';

class PreventiveActions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preventiveActionData: null,
      filteredPreventiveActionData: null,
    };
  }

  componentDidMount() {
    const { planRiskId } = this.props;

    RiskStore.on('filteredActionsRetrieved', ({ data }) => {
      this.setState({ preventiveActionData: data.list });
      this.refreshFilteredData();
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_FILTERED_ACTIONS,
      data: {
        plan: planRiskId,
      },
    });
  }

  refreshFilteredData() {
    const {
      riskIds, unitIds, riskTypeId,
    } = this.props;
    const { preventiveActionData } = this.state;
    const filteredPreventiveActionData = filterPreventiveActionData(
      preventiveActionData, riskIds, unitIds, riskTypeId,
    );
    this.setState({ filteredPreventiveActionData });
  }

  componentDidUpdate(previousProps) {
    const {
      riskIds, unitIds, riskTypeId,
    } = this.props;

    const {
      riskIds: previousRiskIds,
      unitIds: previousUnitIds,
      riskTypeId: previousriskTypeId,
    } = previousProps;
    const risksChanged = !_.isEqual(previousRiskIds, riskIds);
    const unitsChanged = !_.isEqual(previousUnitIds, unitIds);
    const typeChanged = !_.isEqual(previousriskTypeId, riskTypeId);

    if (risksChanged || unitsChanged || typeChanged) {
      this.refreshFilteredData();
    }
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  renderCards() {
    const { hideEye } = this.props;
    const { filteredPreventiveActionData } = this.state;

    return (
      <PreventiveActionsCards
        preventiveActionsData={filteredPreventiveActionData}
        hideEye={hideEye}
      />
    );
  }

  render() {
    const { height } = this.props;
    const { filteredPreventiveActionData } = this.state;

    if (!filteredPreventiveActionData) {
      return <LoadingGauge />;
    }

    return (
      <DashboardCard
        title={Messages.get('label.preventiveActions')}
        height={height}
      >
        {this.renderCards()}
      </DashboardCard>
    );
  }
}

PreventiveActions.contextTypes = {
  router: PropTypes.shape({}),
};

PreventiveActions.propTypes = {
  height: PropTypes.string,
  planRiskId: PropTypes.number.isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number),
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  riskTypeId: PropTypes.number,
  hideEye: PropTypes.bool,
};

PreventiveActions.defaultProps = {
  height: 'inherit',
  riskTypeId: -1,
  hideEye: false,
  riskIds: [-1],
};

export default PreventiveActions;
