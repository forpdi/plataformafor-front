import React from 'react';
import PropTypes from 'prop-types';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import riskType from 'forpdi/src/forrisco/enums/riskType';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';
import Tag from 'forpdi/src/components/Tag';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';

import HistoryTable from 'forpdi/src/forrisco/components/HistoryTable';
import SegmentedSwitch from 'forpdi/src/forrisco/components/controls/SegmentedSwitch';

class IncidentInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      incident: null,
      viewMode: 'info',
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { incidentId } = params;

    RiskStore.on('findIncident', ({ data }) => {
      this.setState({ incident: data });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_INCIDENT,
      data: incidentId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onViewModeChange = (newViewMode) => {
    this.setState({ viewMode: newViewMode });
  };

  renderInfoView() {
    const { incident } = this.state;

    const {
      user,
      begin,
      description,
      action,
      type,
      manager,
    } = incident;

    return (
      <TabbedPanel.MainContainer>
        <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
        <InfoDisplay label={Messages.get('label.correctionalActions')} info={action} />
        <InfoDisplay label={Messages.get('label.type')} info={riskType[type].label} />
        <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
        <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
        <InfoDisplay label={Messages.get('label.dateTimeHour')} info={begin} />
      </TabbedPanel.MainContainer>
    );
  }

  renderHistoryView() {
    const { incident } = this.state;
    return (
      <TabbedPanel.MainContainer>
        <HistoryTable
          entityId={incident.id}
          entityName="Incident"
        />
      </TabbedPanel.MainContainer>
    );
  }

  renderHeader() {
    const { incident, viewMode } = this.state;

    const title = viewMode === 'info'
      ? Messages.get('label.incidentsHistory')
      : `HISTÓRICO DE ALTERAÇÕES - ${incident?.risk?.name ? incident.risk.name.toUpperCase() : ''}`;

    return (
      <TabbedPanel.TopContainer style={{ display: 'flex', alignItems: 'center' }}>
        <SecondaryTitle>{title}</SecondaryTitle>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {incident?.risk?.unit && <Tag label={getUnitTagLabel(incident.risk.unit)} />}

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
    );
  }

  renderMainContent() {
    const { viewMode } = this.state;
    return (
      <div>
        {this.renderHeader()}
        {viewMode === 'info' ? this.renderInfoView() : this.renderHistoryView()}
      </div>
    );
  }

  render() {
    const { incident } = this.state;

    return (
      <AppContainer.Content>
        <AppContainer.MainContent>
          <TabbedPanel tabs={[{ label: Messages.get('label.incident') }]}>
            {incident ? this.renderMainContent() : <LoadingGauge />}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

IncidentInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

IncidentInformation.propTypes = {
  params: PropTypes.shape({
    incidentId: PropTypes.string.isRequired,
  }).isRequired,
};

export default IncidentInformation;
