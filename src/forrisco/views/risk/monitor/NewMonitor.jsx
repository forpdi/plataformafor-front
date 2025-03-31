import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import MonitorForm from 'forpdi/src/forrisco/components/risk/monitor/MonitorForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import validationMonitor from 'forpdi/src/forrisco/validations/validationMonitor';
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { joinDateTime, getCurrentDateAndTime } from 'forpdi/src/utils/dateUtil';

class NewMonitor extends React.Component {
  constructor(props) {
    super(props);
    const { risk } = this.props;
    const {
      impact,
      probability,
      user,
      manager,
    } = risk;
    const { date: actualDate, time: actualTime } = getCurrentDateAndTime();
    this.state = {
      monitor: {
        report: '',
        userId: user.id,
        managerId: manager.id,
        probability: probability || '',
        impact: impact || '',
        beginDate: actualDate || null,
        beginTime: actualTime || null,
      },
      risk: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { router, toastr } = this.context;
    const { risk } = this.props;

    RiskStore.on('findRisk', (response) => {
      this.setState({
        risk: response.data,
      });
    }, this);

    RiskStore.on('monitorCreated', () => {
      toastr.addAlertSuccess(Messages.get('notification.monitoring.created'));
      router.push(`/forrisco/risk/${risk.id}/details/monitors`);
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }));

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_RISK,
      data: risk.id,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  onChangeHandler = (monitor) => {
    this.setState({ monitor });
  }

  onSubmit = () => {
    const { monitor, risk } = this.state;
    const { beginDate, beginTime, managerId } = monitor;

    const onSuccess = () => (
      RiskStore.dispatch({
        action: RiskStore.ACTION_NEW_MONITOR,
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
        label={Messages.get('label.monitor.history')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const {
      monitor, errors, risk,
    } = this.state;
    const { unit } = risk;
    const { planRisk } = unit;
    const { policy } = planRisk;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.newMonitor') }]}
          topContainerContent={{
            title: Messages.get('label.newMonitor'),
            tag: getUnitTagLabel(unit),
          }}
        >
          <TabbedPanel.MainContainer>
            <MonitorForm
              errors={errors}
              monitor={monitor}
              risk={risk}
              policy={policy}
              onChange={this.onChangeHandler}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { risk } = this.state;
    if (!risk) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewMonitor.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

NewMonitor.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }).isRequired,
  risk: PropTypes.shape({}),
};

NewMonitor.defaultProps = {
  risk: {},
};

export default NewMonitor;
