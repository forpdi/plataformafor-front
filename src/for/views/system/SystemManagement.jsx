import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';

const SystemManagement = ({ children }, { router }) => {
  const goBack = () => {
    router.goBack();
  };

  const renderTopContent = () => (
    <AppContainer.TopContent>
      <PageHeader pageTitle={Messages.get('label.system')} goBack={goBack} />
    </AppContainer.TopContent>
  );

  const renderMainContent = () => {
    const systemTabs = [
      { label: Messages.get('label.institutions'), to: '/system/companies/' },
      { label: Messages.get('label.domains'), to: '/system/domains/' },
      { label: Messages.get('label.users'), to: '/system/users/' },
    ];

    return (
      <AppContainer.MainContent>
        <TabbedPanel tabs={systemTabs}>
          {React.cloneElement(children)}
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  };

  const render = () => (
    <AppContainer.Content>
      {renderTopContent()}
      {renderMainContent()}
    </AppContainer.Content>
  );

  return render();
};

SystemManagement.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

SystemManagement.propTypes = {
  children: PropTypes.node,
};

SystemManagement.defaultProps = {
  children: null,
};

export default SystemManagement;
