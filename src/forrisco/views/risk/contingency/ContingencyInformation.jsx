import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import Tag from 'forpdi/src/components/Tag';
import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';

import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class ContingencyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contingency: null,
      viewMode: 'info',
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { contingencyId } = params;

    RiskStore.on(
      'findContingency',
      ({ data }) => {
        this.setState({ contingency: data });
      },
      this,
    );

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_CONTINGENCY,
      data: contingencyId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderHistoryView() {
    const { contingency } = this.state;
    return (
      <TabbedPanel.MainContainer>
        <HistoryTable entityId={contingency.id} entityName="Contingency" />
      </TabbedPanel.MainContainer>
    );
  }

  renderMainContent() {
    const { contingency, viewMode } = this.state;

    const {
      user,
      action,
      validityBegin,
      validityEnd,
      risk,
      manager,
    } = contingency;
    const { unit } = risk || {};

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>
            {viewMode === 'info'
              ? Messages.get('label.contingencyActions')
              : `HISTÓRICO DE ALTERAÇÕES - ${risk?.name?.toUpperCase?.() || ''}`}
          </SecondaryTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Tag label={getUnitTagLabel(unit)} />
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

        {viewMode === 'history' ? (
          this.renderHistoryView()
        ) : (
          <TabbedPanel.MainContainer>
            <InfoDisplay label={Messages.get('label.action')} info={action} />
            {validityBegin && validityEnd ? (
              <InfoDisplayDateRange
                label={Messages.get('label.policyValidity')}
                beginDate={validityBegin}
                endDate={validityEnd}
              />
            ) : (
              <InfoDisplay
                label={Messages.get('label.policyValidity')}
                info="Data não informada"
              />
            )}
            <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
            <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
          </TabbedPanel.MainContainer>
        )}
      </div>
    );
  }

  render() {
    const { contingency } = this.state;

    return (
      <AppContainer.Content>
        <AppContainer.MainContent>
          <TabbedPanel tabs={[{ label: Messages.get('label.contingency') }]}>
            {contingency ? this.renderMainContent() : <LoadingGauge />}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

ContingencyDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

ContingencyDetails.propTypes = {
  params: PropTypes.shape({
    contingencyId: PropTypes.string.isRequired,
  }).isRequired,
};

export default ContingencyDetails;
