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

class IncidentInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      incident: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { incidentId } = params;

    RiskStore.on('findIncident', ({ data }) => {
      this.setState({
        incident: data,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_INCIDENT,
      data: incidentId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  renderMainContent() {
    const { incident } = this.state;

    const {
      user,
      begin,
      description,
      action,
      type,
      risk,
      manager,
    } = incident;
    const { unit } = risk;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.incidentsHistory')}</SecondaryTitle>
          <Tag label={getUnitTagLabel(unit)} />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <InfoDisplayHtml label={Messages.get('label.description')} htmlInfo={description} />
          <InfoDisplay label={Messages.get('label.correctionalActions')} info={action} />
          <InfoDisplay label={Messages.get('label.type')} info={riskType[type].label} />
          <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
          <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
          <InfoDisplay label={Messages.get('label.dateTimeHour')} info={begin} />
        </TabbedPanel.MainContainer>
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
