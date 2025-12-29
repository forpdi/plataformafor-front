import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Toastr from 'toastr';

import AppContainer from 'forpdi/src/components/AppContainer';
import PageHeader from 'forpdi/src/components/PageHeader';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';

import Messages from 'forpdi/src/Messages';

const UserDetails = ({ params, children }, context) => {
  const { userId } = params;
  const { router, roles } = context;

  useEffect(() => {
    const isAdmin = roles && (roles.ADMIN || roles.SYSADMIN);

    if (!isAdmin) {
      Toastr.warning('Você não tem permissão para acessar os detalhes de usuários.');
      router.push('/home');
    }
  }, [roles, router]);

  const isAdmin = roles && (roles.ADMIN || roles.SYSADMIN);

  if (!isAdmin) {
    return null;
  }

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

  return (
    <AppContainer.Content>
      {renderTopContent()}
      {renderMainContent()}
    </AppContainer.Content>
  );
};

UserDetails.propTypes = {
  params: PropTypes.shape({
    userId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

UserDetails.defaultProps = {
  children: null,
};

UserDetails.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  roles: PropTypes.shape({
    ADMIN: PropTypes.bool,
    SYSADMIN: PropTypes.bool,
  }),
};

export default UserDetails;
