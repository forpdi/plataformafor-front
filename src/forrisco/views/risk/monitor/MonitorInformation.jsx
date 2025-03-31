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
import { getUnitTagLabel } from 'forpdi/src/forrisco/helpers/unitHelper';
import { getManagerDisplayName } from 'forpdi/src/forrisco/helpers/riskHelper';

class MonitorDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      monitor: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { monitorId } = params;

    RiskStore.on('findMonitor', ({ data }) => {
      this.setState({
        monitor: data,
      });
    }, this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_MONITOR_BY_ID,
      data: monitorId,
    });
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);
  }

  renderMainContent() {
    const { monitor } = this.state;

    const {
      user,
      report,
      begin,
      impact,
      probability,
      risk,
      manager,
    } = monitor;
    const { unit } = risk;

    return (
      <div>
        <TabbedPanel.TopContainer>
          <SecondaryTitle>{Messages.get('label.monitor.history')}</SecondaryTitle>
          <Tag label={getUnitTagLabel(unit)} />
        </TabbedPanel.TopContainer>
        <TabbedPanel.MainContainer>
          <InfoDisplayHtml label={Messages.get('label.report')} htmlInfo={report} />
          <InfoDisplay label={Messages.get('label.probability')} info={probability} />
          <InfoDisplay label={Messages.get('label.impact')} info={impact} />
          <InfoDisplay label={Messages.get('label.manager')} info={getManagerDisplayName(manager)} />
          <InfoDisplay label={Messages.get('label.responsible')} info={user.name} />
          <InfoDisplay label={Messages.get('label.dateTimeHour')} info={begin} />
        </TabbedPanel.MainContainer>
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
