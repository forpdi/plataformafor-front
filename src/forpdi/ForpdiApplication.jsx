import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import FpdiMainMenu from 'forpdi/src/forpdi/FpdiMainMenu';
import TopBar from 'forpdi/src/components/TopBar';
import AppContainer from 'forpdi/src/components/AppContainer';

import AccessLog from 'forpdi/src/forpdi/core/store/AccessLog';

class ForpdiApplication extends React.Component {
  componentDidMount() {
    AccessLog.dispatch({
      action: AccessLog.FPDI_ACCESS,
    })
  }

  getChildContext() {
    return {
      theme: this.isForPlatform() ? 'for': 'fpdi',
    };
  }

  isForPlatform() {
    const { location } = this.props;
    return location.pathname.includes('/users') || location.pathname.includes('/system');
  }

  render() {
    const { children, location } = this.props;
    const { router } = this.context;

    return (
      <div className="app-body">
        {
          !location.pathname.includes('/users') && !location.pathname.includes('/system')
            ? <FpdiMainMenu {...this.props} />
            : null
        }
        <AppContainer>
          <Helmet>
            <title>ForPDI</title>
            <link rel="icon" type="image/x-icon" href="favicon.ico" />
          </Helmet>
          <TopBar location={location} />
          <AppContainer.Content>
            <div
              className="app-content fpdi-background-bg custom-scrollbar"
              style={{ height: '100%' }}
            >
              {children}
            </div>
          </AppContainer.Content>
        </AppContainer>
      </div>
    );
  }
}

ForpdiApplication.propTypes = {
  location: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
  router: PropTypes.shape({}),
};

ForpdiApplication.defaultProps = {
  children: null,
};

ForpdiApplication.childContextTypes = {
  theme: PropTypes.string.isRequired,
};

ForpdiApplication.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default ForpdiApplication;
