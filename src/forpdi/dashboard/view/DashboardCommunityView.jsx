import React from 'react';
import PropTypes from 'prop-types';

import DashboardCommunityPanel from 'forpdi/src/forpdi/dashboard/view/DashboardCommunityPanel';
import TopBar from 'forpdi/src/components/dashboard/community/TopBar'

import Logo from 'forpdi/img/logo.png';
import Logo1 from 'forpdi/img/logo2.png';
import SwitchLogo from 'forpdi/img/ForRisco.png'
import Messages from 'forpdi/src/Messages';

class DashboardCommunityView extends React.Component {
  getChildContext() {
    return {
      theme: 'fpdi',
    };
  }

  renderDashboardContent() {
    return (
      <div className="wFull">
        <DashboardCommunityPanel />
      </div>
    );
  }

  renderUnabledDashboardMsg() {
    return (
      <div>
        <h1 className="dashboard-noCommunity">
          {Messages.get('label.unableCommunityDashboard')}
        </h1>
      </div>
    );
  }

  render() {
    return (
      <div className="fpdi-app-container" style={{ display: 'block' }}>
        <TopBar
          title={Messages.get('label.institutionalDevelopmentPlan')}
          logo={Logo}
          altLogo={Messages.get('label.forPdiLogo')}
          appName="fpdi"
          logoForApp={Logo1}
          switchLogo={SwitchLogo}
          switchTitle={Messages.get('label.acessForRisco')}
          switchAdress="/comunidade/forrisco"
        />
        <div className="app-body overFlowY community-app-body">
          {
            EnvInfo.company.showDashboard
              ? this.renderDashboardContent()
              : this.renderUnabledDashboardMsg()
          }
        </div>
      </div>
    );
  }
}

DashboardCommunityView.childContextTypes = {
  accessLevel: PropTypes.number,
  accessLevels: PropTypes.shape({}),
  permissions: PropTypes.arrayOf(PropTypes.string),
  roles: PropTypes.shape({}),
  toastr: PropTypes.shape({}),
};

DashboardCommunityView.childContextTypes = {
  theme: PropTypes.string.isRequired,
};

export default DashboardCommunityView;
