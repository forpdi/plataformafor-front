import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayLink from 'forpdi/src/components/info/InfoDisplayLink';

import Messages from 'forpdi/src/Messages';
import { useTermsPath, privacyWarningPath } from 'forpdi/src/consts';

const UserTerms = () => {
  function renderUserTerms() {
    return (
      <div>
        <InfoDisplayLink
          label={Messages.get('label.useTerms')}
          href={useTermsPath}
          info={Messages.get('label.viewUseTerms')}
        />
        <InfoDisplayLink
          label={Messages.get('label.privacyWarning')}
          href={privacyWarningPath}
          info={Messages.get('label.viewPrivacyWarning')}
        />
      </div>
    );
  }

  return (
    <div>
      <TabbedPanel.TopContainer>
        <SecondaryTitle>
          {Messages.get('label.userTerms')}
        </SecondaryTitle>
      </TabbedPanel.TopContainer>
      <TabbedPanel.MainContainer>
        { renderUserTerms() }
      </TabbedPanel.MainContainer>
    </div>
  );
};

UserTerms.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default UserTerms;
