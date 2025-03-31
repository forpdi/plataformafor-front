import React from 'react';
import PropTypes from 'prop-types';

import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import RiskMatrixDashboard from 'forpdi/src/forrisco/components/dashboard/RiskMatrixDashboard';
import RiskQuantityDashboard from 'forpdi/src/forrisco/components/dashboard/RiskQuantityDashboard';
import RiskTypologyDashboard from 'forpdi/src/forrisco/components/dashboard/RiskTypologyDashboard';
import StateButtonGroup from 'forpdi/src/components/buttons/StateButtonGroup';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import riskType from 'forpdi/src/forrisco/enums/riskType';

class RiskDashboards extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policy: null,
      riskLevels: null,
      selectedTypeId: riskType.threat.id,
    };
  }

  componentDidMount() {
    const { planRiskId } = this.props;
    PolicyStore.on('retrieverisklevel', ({ data: riskLevels }) => {
      this.setState({
        riskLevels,
      });
    }, this);

    PlanRiskStore.on('retrivedplanrisk', ({ data }) => {
      const { policy } = data;
      this.setState({
        policy,
      });

      PolicyStore.dispatch({
        action: PolicyStore.ACTION_RETRIEVE_RISK_LEVEL,
        data: policy.id,
      });
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_RETRIEVE_PLANRISK,
      data: planRiskId,
    });
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
    PolicyStore.off(null, null, this);
  }

  onRiskLevelTypeChange = (value) => {
    this.setState({
      selectedTypeId: value,
    });
  }

  renderRiskMatrixDashboard() {
    const {
      risks, riskIds, unitIds, riskMatrixStyle,
    } = this.props;

    const {
      riskLevels,
      selectedTypeId,
      policy,
    } = this.state;

    if (!riskLevels || !policy) {
      return <LoadingGauge />;
    }

    return (
      <div style={riskMatrixStyle}>
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px' }}>
          <div style={{ height: '36px' }}>
            <StateButtonGroup
              onClick={this.onRiskLevelTypeChange}
              checkedValue={selectedTypeId}
              options={riskType.list}
              optionLabelName="pluralLabel"
              groupName="risk-type"
            />
          </div>
        </div>
        <RiskMatrixDashboard
          policy={policy}
          risks={risks}
          riskIds={riskIds}
          unitIds={unitIds}
          riskLevels={riskLevels}
          riskTypes={[riskType[selectedTypeId]]}
        />
      </div>
    );
  }

  renderRiskQuantityDashboard() {
    const {
      planRiskId,
      units,
      risks,
      riskIds,
      unitIds,
    } = this.props;
    const {
      riskLevels,
      selectedTypeId,
    } = this.state;

    if (!riskLevels) {
      return <LoadingGauge />;
    }

    return (
      <RiskQuantityDashboard
        planRiskId={planRiskId}
        unitIds={unitIds}
        units={units}
        riskLevels={riskLevels}
        riskIds={riskIds}
        risks={risks}
        riskType={[riskType[selectedTypeId]]}
      />
    );
  }

  renderRiskTypologyDashboard() {
    const { risks, riskIds, unitIds } = this.props;
    const { selectedTypeId } = this.state;

    return (
      <RiskTypologyDashboard
        riskIds={riskIds}
        unitIds={unitIds}
        risks={risks}
        riskTypes={[riskType[selectedTypeId]]}
      />
    );
  }

  render() {
    const { height } = this.props;

    return (
      <div>
        <div className="row" style={{ marginBottom: '30px' }}>
          <div className="col col-sm-6">
            <DashboardCard
              title={Messages.get('label.risksMatrix')}
              height={height}
            >
              {this.renderRiskMatrixDashboard()}
            </DashboardCard>
          </div>
          <div className="col col-sm-6">
            <DashboardCard
              title={Messages.get('label.riskQuantity')}
              height={height}
            >
              {this.renderRiskQuantityDashboard()}
            </DashboardCard>
          </div>
        </div>
        <div className="row" style={{ marginBottom: '30px' }}>
          <div className="col col-sm-12">
            <DashboardCard
              title={Messages.get('label.risksTypologies')}
              height={height}
            >
              {this.renderRiskTypologyDashboard()}
            </DashboardCard>
          </div>
        </div>
      </div>
    );
  }
}

RiskDashboards.propTypes = {
  height: PropTypes.string.isRequired,
  planRiskId: PropTypes.number.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  risks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  riskMatrixStyle: PropTypes.shape({}),
};

RiskDashboards.defaultProps = {
  riskMatrixStyle: {},
};

export default RiskDashboards;
