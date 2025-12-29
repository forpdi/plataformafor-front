import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import MainMenu from 'forpdi/src/components/MainMenu';
import AppContainer from 'forpdi/src/components/AppContainer';
import TopBar from 'forpdi/src/components/TopBar';

import AccessLog from 'forpdi/src/forpdi/core/store/AccessLog';

import forRiscoLogo from 'forpdi/img/logo_frisco_white.png';

class ForriscoApplication extends React.Component {
  componentDidMount() {
    AccessLog.dispatch({
      action: AccessLog.FRISCO_ACCESS,
    });
  }

  getChildContext() {
    return {
      theme: 'frisco',
    };
  }

  render() {
    const { children, location } = this.props;
    const { roles } = this.context;

    const canManageData = roles && (roles.ADMIN || roles.SYSADMIN);

    return (
      <div className="app-body">
        <MainMenu appLogo={forRiscoLogo}>
          <MainMenu.MenuItem
            label="Painel de bordo"
            icon="chart-pie"
            to="/forrisco/home"
            location={location}
          />
          {EnvInfo.company && (
            <>
              <MainMenu.MenuItem
                label="Políticas"
                icon="file-signature"
                to="/forrisco/policy"
                location={location}
              />
              <MainMenu.MenuItem
                label="Planos de gestão de risco"
                icon="list"
                to="/forrisco/plan-risk"
                location={location}
              />
              <MainMenu.MenuItem
                label="Unidades"
                icon="map-marker-alt"
                to="/forrisco/unit"
                location={location}
              />
              <MainMenu.MenuItem
                label="Relatórios"
                icon="download"
                to="/forrisco/reports"
                location={location}
              />
              {canManageData && (
                <MainMenu.MenuItem
                  label="Importar Dados"
                  icon="file-import"
                  to="/forrisco/imports"
                  location={location}
                />
              )}
              {canManageData && (
                <MainMenu.MenuItem
                  label="Exportar Dados"
                  icon="file-export"
                  to="/forrisco/exports"
                  location={location}
                />
              )}
            </>
          )}
        </MainMenu>
        <AppContainer>
          <Helmet>
            <title>ForRisco</title>
            <link rel="icon" type="image/x-icon" href="favicon2.ico" />
          </Helmet>
          <TopBar location={location} />
          {children}
        </AppContainer>
      </div>
    );
  }
}

ForriscoApplication.propTypes = {
  location: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
};

ForriscoApplication.defaultProps = {
  children: null,
};

ForriscoApplication.childContextTypes = {
  theme: PropTypes.string.isRequired,
};

ForriscoApplication.contextTypes = {
  roles: PropTypes.shape({
    ADMIN: PropTypes.bool,
    SYSADMIN: PropTypes.bool,
  }).isRequired,
};

export default ForriscoApplication;
