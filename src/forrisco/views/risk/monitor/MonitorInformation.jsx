import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import Tag from 'forpdi/src/components/Tag';
import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import Text from 'forpdi/src/components/typography/Text';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName, getClassificationNameFromPolicy, getDynamicColorForClassification } from 'forpdi/src/forrisco/helpers/riskHelper';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class MonitorDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitor: null,
      viewMode: 'info', // 'info' | 'history'
      riskLevels: null,
    };
  }

  renderRiskClassificationCard(monitor) {
    const { riskLevels } = this.state;
    const policy = monitor?.risk?.unit?.planRisk?.policy;

    if (!monitor || !policy || !riskLevels) return null;

    const { probability, impact } = monitor;
    if (probability == null || impact == null) return null;

    const classificationName = getClassificationNameFromPolicy(policy, probability, impact);
    if (!classificationName) return null;

    const classificationColor = getDynamicColorForClassification(classificationName, riskLevels);
    if (!classificationColor) return null;

    const textColorClassName = classificationColor ? 'frisco-secondary-color' : '';

    return (
      <div
        className="info-risk-matrix__cell"
        style={{
          backgroundColor: classificationColor,
          width: '10%',
          textAlign: 'center',
          padding: '5px 0',
          borderRadius: '4px',
          marginTop: 8,
        }}
      >
        <Text
          title={classificationName}
          className={`info-risk-matrix__cell-text ${textColorClassName}`}
          text={classificationName}
        />
      </div>
    );
  }

  componentDidMount() {
    const { params } = this.props;
    const { monitorId } = params;

    RiskStore.on('findMonitor', ({ data }) => {
      this.setState({ monitor: data });
      const policyId = data?.risk?.unit?.planRisk?.policy?.id;
      if (policyId) {
        PolicyStore.dispatch({
          action: PolicyStore.ACTION_RETRIEVE_RISK_LEVEL,
          data: policyId,
        });
      }
    }, this);

    PolicyStore.on('retrieverisklevel', ({ data: riskLevels }) => {
      this.setState({ riskLevels });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_MONITOR_BY_ID,
      data: monitorId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
    PolicyStore.off(null, null, this);
  }

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  handleUnitClick = () => {
    const { monitor } = this.state;
    const { router } = this.context;
    const unitId = monitor?.risk?.unit?.id;
    if (unitId) router.push(`forrisco/unit/${unitId}/info`);
  };

  renderInfoView() {
    const { monitor } = this.state;

    const {
      user,
      report,
      begin,
      impact,
      probability,
      manager,
    } = monitor;

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplayHtml label={Messages.get('label.report')} htmlInfo={report} />
        <InfoDisplay label={Messages.get('label.probability')} info={probability} />
        <InfoDisplay label={Messages.get('label.impact')} info={impact} />
        <div>
          {this.renderRiskClassificationCard(monitor)}
        </div>
        <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
        <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
        <InfoDisplay label={Messages.get('label.dateTimeHour')} info={begin} />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { monitor } = this.state;

    return (
      <TabbedPanel.MainContainer>
        <HistoryTable
          entityId={monitor.id}
          entityName="Monitoring"
        />
      </TabbedPanel.MainContainer>
    );
  }

  renderMainContent() {
    const { monitor, viewMode } = this.state;

    const title = viewMode === 'info'
      ? Messages.get('label.monitoring')
      : `HISTÓRICO DE ALTERAÇÕES - ${(monitor?.risk?.name || monitor?.risk?.code || '').toUpperCase()}`;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle title={title} style={{ maxWidth: '60%' }}>{title}</SecondaryTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Tag
              label={getUnitTagLabel(monitor?.risk?.unit)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={this.handleUnitClick}
            />

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

  render() {
    const { monitor } = this.state;

    return (
      <AppContainer.Content>
        <AppContainer.MainContent>
          <TabbedPanel tabs={[{ label: Messages.get('label.monitoring') }]}>
            {monitor ? this.renderMainContent() : <LoadingGauge />}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

MonitorDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

MonitorDetails.propTypes = {
  params: PropTypes.shape({
    monitorId: PropTypes.string.isRequired,
  }).isRequired,
};

export default MonitorDetails;
