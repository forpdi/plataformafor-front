import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import ColorfulCard from 'forpdi/src/components/dashboard/ColorfulCard';
import ShadowedButton from 'forpdi/src/components/buttons/ShadowedButton';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import DashboardChartModal from 'forpdi/src/components/modals/DashboardChartModal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import riskLevelColors from 'forpdi/src/forrisco/enums/riskLevelColors';
import { getQuantityData, getChartDataAndOptions } from 'forpdi/src/forrisco/helpers/dashboard/riskQuantityDashboardHelper';
import { getYearsToSelect } from 'forpdi/src/utils/util';

class RiskQuantityDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = { riskHistoryList: null };
  }

  componentDidMount() {
    const { planRiskId } = this.props;

    RiskStore.on('historyByUnit', ({ data }) => {
      this.setState({
        riskHistoryList: data.list,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_HISTORY_BY_UNIT,
      data: {
        unit: -1,
        plan: planRiskId,
      },
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChartButtonClick = (riskLevelId) => {
    const {
      units,
      riskLevels,
      unitIds,
    } = this.props;
    const { riskHistoryList } = this.state;
    const years = getYearsToSelect(riskHistoryList);
    const legends = _.map(
      riskLevels,
      ({ id, level, color }) => ({ id, label: level, color: riskLevelColors[color].hex }),
    );

    const modal = (
      <DashboardChartModal
        heading={Messages.get('label.risk.history')}
        chartProps={{
          units,
          legends,
          years,
          defaultSelectedUnitIds: unitIds,
          getChartDataAndOptions: this.getChartDataAndOptions,
          defaultLegendCheckedIds: [riskLevelId],
          id: 'risk-quantity-chart',
        }}
      />
    );

    Modal.show(modal);
  }

  onCardClick = (riskLevelId, level, quantityData) => {
    const { router } = this.context;
    const { risks } = _.find(
      quantityData,
      ({ id }) => riskLevelId === id,
    ) || {};

    const { hideEye } = this.props;

    const modal = (
      <DashboardItemsModal
        heading={level}
        subHeading={Messages.get('label.risks')}
        items={risks}
        getItemText={({ name }) => name}
        onClick={({ id }) => router.push(`/forrisco/risk/${id}/details/info`)}
        hideEye={hideEye}
      />
    );

    Modal.show(modal);
  }

  getChartDataAndOptions = (selectedYear, unitIdsSelectedInChart, legendChecks) => {
    const { riskLevels, riskType } = this.props;
    const { riskHistoryList } = this.state;
    const selectedRiskLevels = _.filter(riskLevels, ({ id }) => !!legendChecks[id]);

    return getChartDataAndOptions(
      riskHistoryList,
      selectedRiskLevels,
      unitIdsSelectedInChart,
      selectedYear,
      riskType[0].id,
    );
  }

  render() {
    const {
      risks,
      riskLevels,
      riskType,
      riskIds,
      unitIds,
      riskState,
      strategyId,
    } = this.props;
    const { riskHistoryList } = this.state;

    if (!riskHistoryList) {
      return <LoadingGauge />;
    }

    const quantityData = getQuantityData(risks, riskLevels, riskType, riskIds, unitIds, riskState, strategyId);

    return (
      <ColorfulCard.GroupContainer>
        {
          _.map(quantityData, ({
            quantity,
            level,
            color,
            id,
          }) => (
            <ColorfulCard
              key={`card-${level}`}
              color={riskLevelColors[color].hex}
              onClick={() => this.onCardClick(id, level, quantityData)}
            >
              {
                <ShadowedButton
                  style={{ position: 'absolute', top: '10px', right: '10px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.onChartButtonClick(id);
                  }}
                />
              }
              <ColorfulCard.MainContent>
                {quantity || '0'}
              </ColorfulCard.MainContent>
              <ColorfulCard.PrimaryLabel>
                {level}
              </ColorfulCard.PrimaryLabel>
            </ColorfulCard>
          ))
        }
      </ColorfulCard.GroupContainer>
    );
  }
}

RiskQuantityDashboard.contextTypes = {
  router: PropTypes.shape({}),
};

RiskQuantityDashboard.propTypes = {
  planRiskId: PropTypes.number.isRequired,
  riskIds: PropTypes.arrayOf(PropTypes.number),
  unitIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  risks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskLevels: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  riskType: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  strategyId: PropTypes.number,
  riskState: PropTypes.arrayOf(PropTypes.shape({})),
  hideEye: PropTypes.bool,
};

RiskQuantityDashboard.defaultProps = {
  riskState: [],
  riskIds: [-1],
  hideEye: false,
  strategyId: -1,
};

export default RiskQuantityDashboard;
