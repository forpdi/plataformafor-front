import React from 'react';
import PropTypes from 'prop-types';

import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import InfoDisplayDateRange from 'forpdi/src/components/info/InfoDisplayDateRange';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Text from 'forpdi/src/components/typography/Text';
import Tag from 'forpdi/src/components/Tag';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';
import InfoRiskMatrix from 'forpdi/src/forrisco/components/policy/InfoRiskMatrix';
import PolicyHistoryTable from 'forpdi/src/forrisco/views/policy/PolicyHistoryTable';

import { getPolicyTagLabel, convertPIdescriptions } from 'forpdi/src/forrisco/helpers/policyHelper';
import Messages from 'forpdi/src/Messages';

class PolicyInformation extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      viewMode: 'info',
    };
  }

  onEdit = () => {
    const { policyData } = this.props;
    const { router } = this.context;
    const { id } = policyData || {};
    if (id) router.push(`/forrisco/policy/edit/${id}`);
  };

  onViewModeChange = (viewMode) => {
    this.setState({ viewMode });
  };

  renderInfoView() {
    const { policyData, riskLevels } = this.props;
    const renderListItem = item => (
      <div>
        <Text>
          <span style={{ fontWeight: 'bold' }}>{item.value}</span>
          <span style={{ margin: '0 5px' }}>-</span>
          {item.description}
        </Text>
      </div>
    );

    const {
      name,
      description,
      validityBegin,
      validityEnd,
      PIDescriptions,
      matrix,
    } = policyData || {};

    const { pdescriptions, idescriptions } = convertPIdescriptions(PIDescriptions);

    return (
      <TabbedPanel.MainContainer>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
        }}
        >
          <SecondaryTitle style={{ margin: 0 }}>{name}</SecondaryTitle>
          <Tag label={getPolicyTagLabel(EnvInfo.company)} />
        </div>
        <InfoDisplayDateRange
          label={Messages.get('label.policyValidity')}
          beginDate={validityBegin}
          endDate={validityEnd}
        />
        <InfoRiskMatrix
          matrix={matrix}
          riskLevels={riskLevels}
        />
        <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
        <InfoDisplayList
          label={Messages.get('label.piDescription')}
          infoList={pdescriptions}
          renderItem={renderListItem}
        />
        <InfoDisplayList
          infoList={idescriptions}
          renderItem={renderListItem}
        />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { policyData, historyRefreshKey } = this.props;

    if (!policyData || !policyData.id) {
      return (
        <TabbedPanel.MainContainer>
          <LoadingGauge />
        </TabbedPanel.MainContainer>
      );
    }

    return (
      <TabbedPanel.MainContainer>
        <PolicyHistoryTable
          policyId={policyData.id}
          refreshKey={historyRefreshKey}
        />
      </TabbedPanel.MainContainer>
    );
  }

  render() {
    const { policyData } = this.props;
    const { viewMode } = this.state;

    if (!policyData) return <LoadingGauge />;

    const title = viewMode === 'info'
      ? Messages.get('label.generalInfo')
      : `HISTÓRICO DE ALTERAÇÕES - ${(policyData.name || '').toUpperCase()}`;

    return (
      <div>
        <TabbedPanel.TopContainer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SecondaryTitle>{title}</SecondaryTitle>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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

PolicyInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

PolicyInformation.propTypes = {
  policyData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    validityBegin: PropTypes.string,
    validityEnd: PropTypes.string,
    PIDescriptions: PropTypes.any,
    matrix: PropTypes.any,
  }),
  riskLevels: PropTypes.arrayOf(PropTypes.shape({})),
  historyRefreshKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

PolicyInformation.defaultProps = {
  policyData: null,
  riskLevels: null,
  historyRefreshKey: 0,
};

export default PolicyInformation;
