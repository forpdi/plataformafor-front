import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import PageHeader from 'forpdi/src/components/PageHeader';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';

const ProfileUserDetails = ({ children }) => {
  const tabbedPanelTabs = [
    { label: Messages.get('label.userData'), to: '/users/profile/info' },
    { label: Messages.get('label.notification'), to: '/users/profile/notifications' },
    { label: Messages.get('label.terms'), to: '/users/profile/terms' },
  ];

  const renderTopContent = () => (
    <AppContainer.TopContent>
      <PageHeader pageTitle={Messages.get('label.myProfile')} />
    </AppContainer.TopContent>
  );

  const renderMainContent = () => (
    <AppContainer.MainContent>
      <TabbedPanel tabs={tabbedPanelTabs}>
        {children && React.cloneElement(children)}
      </TabbedPanel>
    </AppContainer.MainContent>
  );

  const render = () => (
    <AppContainer.Content>
      {renderTopContent()}
      {renderMainContent()}
    </AppContainer.Content>
  );

  return render();
};

ProfileUserDetails.propTypes = {
  params: PropTypes.shape({}),
  children: PropTypes.node,
};

ProfileUserDetails.defaultProps = {
  params: {},
  children: null,
};

export default ProfileUserDetails;
