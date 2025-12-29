import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import AppContainer from 'forpdi/src/components/AppContainer';

import Messages from 'forpdi/src/Messages';

const PageHeader = ({ pageTitle, goBack }, { router }) => (
  <AppContainer.Column breakWord>
    <SecondaryIconButton
      title={Messages.get('label.goBack')}
      icon="arrow-left"
      onClick={() => (goBack ? goBack() : router.goBack())}
    />
    <MainTitle
      label={pageTitle}
      style={{ display: 'inline-block', marginLeft: '15px' }}
    />
  </AppContainer.Column>
);

PageHeader.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

PageHeader.propTypes = {
  goBack: PropTypes.func,
  pageTitle: PropTypes.string.isRequired,
};

PageHeader.defaultProps = {
  goBack: null,
};

export default PageHeader;
