import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import IconButton from 'forpdi/src/components/buttons/IconButton';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import PlanRiskHistoryTable from 'forpdi/src/forrisco/views/planRisk/PlanRiskHistoryTable';

import Messages from 'forpdi/src/Messages';

import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class PlanRiskInformation extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      viewMode: 'info',
    };
  }

  onEdit = () => {
    const { planRiskData } = this.props;
    const { router } = this.context;
    const { id } = planRiskData || {};
    if (id) router.push(`/forrisco/plan-risk/edit/${id}`);
  };

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderInfoView() {
    const { planRiskData } = this.props;
    const {
      description,
      policy,
      validityBegin,
      validityEnd,
    } = planRiskData || {};
    const policyName = policy ? policy.name : '';

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplayDateRange
          label={Messages.get('label.policyValidity')}
          beginDate={validityBegin}
          endDate={validityEnd}
        />
        <InfoDisplay label={Messages.get('label.linkedPolicy')} info={policyName} />
        <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { planRiskData } = this.props;

    if (!planRiskData || !planRiskData.id) {
      return (
        <TabbedPanel.MainContainer>
          <LoadingGauge />
        </TabbedPanel.MainContainer>
      );
    }

    return (
      <TabbedPanel.MainContainer>
        <PlanRiskHistoryTable planRiskId={planRiskData.id} />
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    const { planRiskData } = this.props;
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { viewMode } = this.state;

    if (!planRiskData) return <LoadingGauge />;

    const title = viewMode === 'info'
      ? Messages.get('label.generalInfo')
      : `HISTÓRICO DE ALTERAÇÕES - ${(planRiskData.name || '').toUpperCase()}`;

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SecondaryTitle>{title}</SecondaryTitle>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {viewMode === 'info' && hasForriscoManagePlanRiskPermission && (
              <IconButton
                icon="pen"
                title={Messages.get('label.editPlan')}
                onClick={this.onEdit}
              />
            )}

            <SegmentedSwitch
              options={[
                { id: 'info', label: 'Versão Atual' },
                { id: 'history', label: 'Histórico' },
              ]}
              value={viewMode}
              onChange={this.onViewModeChange}
              minWidth={120}
              ariaLabel="Alternar entre Versão Atual e Histórico"
            />
          </div>
        </TabbedPanel.TopContainer>

        {viewMode === 'info' ? this.renderInfoView() : this.renderHistoryView()}
      </div>
    );
  }
}

PlanRiskInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskInformation.propTypes = {
  planRiskData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    validityBegin: PropTypes.string,
    validityEnd: PropTypes.string,
    policy: PropTypes.shape({ name: PropTypes.string }),
  }),
};

PlanRiskInformation.defaultProps = {
  planRiskData: null,
};

export default PlanRiskInformation;
