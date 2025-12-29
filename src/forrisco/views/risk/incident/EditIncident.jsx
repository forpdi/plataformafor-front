import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import IncidentForm from 'forpdi/src/forrisco/components/risk/incident/IncidentForm';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import validationIncident from 'forpdi/src/forrisco/validations/validationIncident';
import { splitDateTime, joinDateTime } from 'forpdi/src/utils/dateUtil';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';

class EditIncident extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      incident: {
        userId: '',
        managerId: '',
        type: '',
        date: '',
        time: '',
        correctionalActions: '',
        description: '',
      },
      unit: null,
      riskId: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;
    const { incidentId } = params;

    RiskStore.on('findIncident', ({ data }) => {
      const { risk, begin, manager } = data;
      const { id: userId } = data.user;
      const { date, time } = splitDateTime(begin);

      this.setState({
        incident: {
          ...data,
          correctionalActions: data.action,
          manager,
          managerId: manager && manager.id,
          userId,
          date,
          time,
        },
        unit: risk.unit,
        riskId: risk.id,
      });
    }, this);

    RiskStore.on(
      'incidentUpdated',
      () => {
        const { riskId } = this.state;
        toastr.addAlertSuccess(Messages.get('notification.incident.edit'));
        router.push(`/forrisco/risk/${riskId}/details/incidents`);
      },
      this,
    );

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_INCIDENT,
      data: incidentId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChangeHandler = (incident) => {
    this.setState({ incident });
  }

  onSubmit = () => {
    const { incident } = this.state;
    const { params } = this.props;
    const { riskId } = params;
    const {
      userId,
      date,
      time,
      correctionalActions,
      managerId,
    } = incident;

    const onSuccess = () => {
      const data = {
        incident: {
          ...incident,
          action: correctionalActions,
          user: { id: userId },
          manager: { id: managerId },
          risk: { id: riskId },
          begin: joinDateTime(date, time),
        },
      };

      RiskStore.dispatch({
        action: RiskStore.ACTION_UPDATE_INCIDENT,
        data,
      });
    };

    validationIncident(incident, onSuccess, this);
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editIncident')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { incident, errors, unit } = this.state;
    const { risk } = this.props;

    if (!unit || !incident || !risk) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.editIncident') }]}
          topContainerContent={{
            title: Messages.get('label.editIncident'),
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

EditIncident.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditIncident.propTypes = {
  params: PropTypes.shape({}).isRequired,
  risk: PropTypes.shape({}),
};

EditIncident.defaultProps = {
  risk: null,
};

export default EditIncident;
