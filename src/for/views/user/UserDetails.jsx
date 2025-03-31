import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import PageHeader from 'forpdi/src/components/PageHeader';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';

const UserDetails = ({ params, children }) => {
  const { userId } = params;

  const tabbedPanelTabs = [
    { label: Messages.get('label.userData'), to: `/users/details/${userId}/info` },
    { label: Messages.get('label.userPermissions'), to: `/users/details/${userId}/permissions` },
    { label: Messages.get('label.userAssociations'), to: `/users/details/${userId}/associations` },
    { label: Messages.get('label.messageHistory'), to: `/users/details/${userId}/messages` },
  ];

  const renderTopContent = () => (
    <AppContainer.TopContent>
      <PageHeader pageTitle={Messages.get('label.editUser')} />
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

UserDetails.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

UserDetails.defaultProps = {
  params: {},
  children: null,
};

UserDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default UserDetails;
