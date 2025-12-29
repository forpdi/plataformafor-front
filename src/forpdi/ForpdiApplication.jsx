import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet'; // OBS: No futuro, considere migrar para 'react-helmet-async'

import FpdiMainMenu from 'forpdi/src/forpdi/FpdiMainMenu';
import TopBar from 'forpdi/src/components/TopBar';
import AppContainer from 'forpdi/src/components/AppContainer';

import AccessLog from 'forpdi/src/forpdi/core/store/AccessLog';

class ForpdiApplication extends React.Component {
  componentDidMount() {
    // React 18 faz "Automatic Batching", o que melhora a performance
    // de disparos como este.
    AccessLog.dispatch({
      action: AccessLog.FPDI_ACCESS,
    })
  }

  // ATENÇÃO: Legacy Context API
  // O React 18 ainda suporta getChildContext, mas ele é obsoleto.
  // Mantenha assim por enquanto para não quebrar o react-router v2.
  getChildContext() {
    return {
      theme: this.isForPlatform() ? 'for': 'fpdi',
    };
  }

  isForPlatform() {
    const { location } = this.props;
    // Verificação de segurança caso location seja undefined (comum em testes)
    if (!location) return false;
    return location.pathname.includes('/users') || location.pathname.includes('/system');
  }

  render() {
    const { children, location } = this.props;

    // Verificação defensiva para evitar erro de "cannot read property of undefined"
    const pathname = location ? location.pathname : '';

    return (
      <div className="app-body">
        {/* Lógica condicional do menu mantida */}
        {
          !pathname.includes('/users') && !pathname.includes('/system')
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
            {/* Se 'fpdi-background-bg' for uma classe personalizada sua, tudo bem.
               Se fosse do Bootstrap, teríamos de verificar se ela ainda existe.
            */}
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
  // PropTypes continuam a funcionar normalmente no React 18
  location: PropTypes.shape({
    pathname: PropTypes.string, // Especifiquei melhor para evitar erros
  }).isRequired,
  children: PropTypes.node,
  router: PropTypes.shape({}),
};

ForpdiApplication.defaultProps = {
  children: null,
};

// Declaração do contexto antigo (Necessário para manter compatibilidade)
ForpdiApplication.childContextTypes = {
  theme: PropTypes.string.isRequired,
};

ForpdiApplication.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default ForpdiApplication;
