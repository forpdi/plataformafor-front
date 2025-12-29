import React from 'react';
import PropTypes from 'prop-types';

import DashboardCommunityPanel from 'forpdi/src/forrisco/components/dashboard/DashboardCommunityPanel';
import TopBar from 'forpdi/src/components/dashboard/community/TopBar';
import MainTitle from 'forpdi/src/components/typography/MainTitle';

import Logo from 'forpdi/img/forrisco-logo.png';
import Logo1 from 'forpdi/img/logo1.png';
import SwitchLogo from 'forpdi/img/ForPDI.png';
import Messages from 'forpdi/src/Messages';

class DashboardCommunityView extends React.Component {
  getChildContext() {
    return {
      theme: 'frisco',
    };
  }

  renderUnabledDashboardMsg() {
    return (
      <div className="dashboard-noCommunity">
        <MainTitle label={Messages.get('label.unableCommunityDashboard')} />
      </div>
    );
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <TopBar
          title={Messages.get('label.riskManagement')}
          logo={Logo}
          altLogo={Messages.get('label.forRiscoLogo')}
          appName="frisco"
          titleClass="frisco-community-card-title"
          logoForApp={Logo1}
          switchLogo={SwitchLogo}
          switchTitle={Messages.get('label.acessForPdi')}
          switchAdress="/comunidade/forpdi"
        />
        <div className="community-app-body">
          {
            EnvInfo.company.showDashboard
              ? <DashboardCommunityPanel />
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
