import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import AppContainer from 'forpdi/src/components/AppContainer';
import TopBar from 'forpdi/src/components/TopBar';

class ForApplication extends React.Component {
  getChildContext() {
    return {
      theme: 'for',
    };
  }

  render() {
    const { children, location } = this.props;

    return (
      <div className="app-body">
        <AppContainer>
          <Helmet>
            <title>For</title>
            <link rel="icon" type="image/x-icon" href="favicon.ico" />
          </Helmet>
          <TopBar location={location} />
          {children}
        </AppContainer>
      </div>
    );
  }
}

ForApplication.propTypes = {
  location: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
};

ForApplication.defaultProps = {
  children: null,
};

ForApplication.childContextTypes = {
  theme: PropTypes.string.isRequired,
};

ForApplication.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default ForApplication;
