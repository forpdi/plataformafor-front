import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import IncidentForm from 'forpdi/src/forrisco/components/risk/incident/IncidentForm';
import validationIncident from 'forpdi/src/forrisco/validations/validationIncident';
import { joinDateTime, getCurrentDateAndTime } from 'forpdi/src/utils/dateUtil';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class NewIncident extends React.Component {
  constructor(props) {
    super(props);
    const { risk } = this.props;
    const { user, manager } = risk;
    const { date: actualDate, time: actualTime } = getCurrentDateAndTime();
    this.state = {
      incident: {
        userId: user.id,
        managerId: manager.id,
        type: '',
        date: actualDate || '',
        time: actualTime || '',
        correctionalActions: '',
        description: '',
      },
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { risk } = this.props;

    RiskStore.on('incidentCreated',
      () => {
        toastr.addAlertSuccess(Messages.get('notification.incident.save'));
        router.push(`/forrisco/risk/${risk.id}/details/incidents`);
      });

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChangeHandler = (incident) => {
    this.setState({ incident });
  }

  onSubmit = () => {
    const { risk } = this.props;
    const { incident } = this.state;
    const {
      userId,
      managerId,
      date,
      correctionalActions,
      time,
    } = incident;

    const onSuccess = () => {
      const data = {
        incident: {
          ...incident,
          action: correctionalActions,
          user: { id: userId },
          manager: { id: managerId },
          risk: { id: risk.id },
          begin: joinDateTime(date, time),
        },
      };

      RiskStore.dispatch({
        action: RiskStore.ACTION_NEW_INCIDENT,
        data,
      });
    };

    validationIncident(incident, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.newIncident')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { incident, errors } = this.state;
    const { risk } = this.props;
    const { unit } = risk;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.incident') }]}
          topContainerContent={{
            title: Messages.get('label.incident'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            <IncidentForm
              errors={errors}
              incident={incident}
              risk={risk}
              onChange={this.onChangeHandler}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewIncident.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewIncident.propTypes = {
  risk: PropTypes.shape({}),
};

NewIncident.defaultProps = {
  risk: {},
};

export default NewIncident;
