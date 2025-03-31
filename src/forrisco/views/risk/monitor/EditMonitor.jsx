import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import MonitorForm from 'forpdi/src/forrisco/components/risk/monitor/MonitorForm';

import validationMonitor from 'forpdi/src/forrisco/validations/validationMonitor';
import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { splitDateTime, joinDateTime } from 'forpdi/src/utils/dateUtil';

class EditMonitor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitor: null,
      unit: null,
      policy: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { params } = this.props;
    const { monitorId } = params;

    RiskStore.on('monitorUpdated', ({ data }) => {
      const { risk } = data;
      router.push(`/forrisco/risk/${risk.id}/details/monitors`);
      toastr.addAlertSuccess(Messages.get('notification.monitoring.updated'));
    }, this);

    RiskStore.on('findMonitor', ({ data }) => {
      const {
        user,
        begin,
        risk,
        manager,
      } = data;
      const { unit } = risk;
      const { planRisk } = unit;
      const { policy } = planRisk;
      const { id: userId } = user;
      const { date, time } = splitDateTime(begin);

      this.setState({
        monitor: {
          ...data,
          userId,
          managerId: manager && manager.id,
          beginDate: date,
          beginTime: time,
          begin,
        },
        unit,
        policy,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_MONITOR_BY_ID,
      data: monitorId,
    });

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    RiskStore.off('findMonitor', null, this);
  }

  onChangeHandler = (monitor) => {
    this.setState({
      monitor,
    });
  }

  onSubmit = () => {
    const { monitor } = this.state;
    const {
      risk,
      beginDate,
      beginTime,
      managerId,
    } = monitor;

    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_UPDATE_MONITOR,
        data: {
          monitor: {
            ...monitor,
            begin: joinDateTime(beginDate, beginTime),
            user: {
              id: parseInt(monitor.userId, 10),
            },
            manager: { id: managerId },
            risk: {
              id: risk.id,
            },
          },
        },
      })
    );

    validationMonitor(monitor, onSuccess, this);
  }


  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.editMonitoring')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }


  renderMainContent() {
    const {
      errors, monitor, unit, policy,
    } = this.state;
    const { risk } = this.props;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo') }]}
          topContainerContent={{
            title: Messages.get('label.editMonitoring'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            {monitor ? (
              <MonitorForm
                errors={errors}
                monitor={monitor}
                risk={risk}
                policy={policy}
                onChange={this.onChangeHandler}
              />
            ) : <LoadingGauge />}
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

EditMonitor.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

EditMonitor.propTypes = {
  params: PropTypes.shape({
    monitorId: PropTypes.string.isRequired,
  }).isRequired,
  risk: PropTypes.shape({}),
};

EditMonitor.defaultProps = {
  risk: null,
};

export default EditMonitor;
