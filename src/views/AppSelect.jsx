import React from 'react';
import { Link } from 'react-router';

import ModalComponent from 'forpdi/src/components/modals/Modal';
import CommunicationModal from 'forpdi/src/forpdi/planning/widget/CommunicationModal';
import CommunicationStore from 'forpdi/src/forpdi/core/store/Communication';
import { getCompanyName, getCompanyLogo } from 'forpdi/src/utils/urlUtil';

import ForpdiLogo from 'forpdi/img/logo.png';
import ForriscoLogo from 'forpdi/img/forrisco-logo.png';
import AppLogo from 'forpdi/img/plataforma-for-logo.svg';
import Messages from 'forpdi/src/Messages';

const companyLogo = getCompanyLogo();
const companyName = getCompanyName();

class AppSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      communication: null,
    };
  }

  componentDidMount() {
    CommunicationStore.on('communicationPopupRetrieved', (response) => {
      this.setState({ communication: response.data }, this.showModals);
    }, this);

    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_SHOW_COMMUNICATION,
    });
  }

  componentWillUnmount() {
    CommunicationStore.off(null, null, this);
  }

  showModals() {
    const { communication } = this.state;

    if (communication != null
      && parseInt(localStorage.lastCommunicationVisualized, 10) !== communication.id) {
      this.showCommunication(communication);
    }
  }

  showCommunication(communication) {
    const modal = <CommunicationModal communication={communication} />;
    ModalComponent.show(modal, 'for');
  }

  render() {
    return (
      <div className="app-container-init">
        <div style={{
          position: 'absolute', zIndex: 1, width: '100%', top: 0,
        }}
        >
          <div className="fpdi-top-bar" style={{ height: '120px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <div className="col-12 col-md-5" style={{ width: '850px' }}>
              <img
                style={{ height: '60px' }}
                src={AppLogo}
                alt={Messages.get('PlatFor')}
              />
            </div>
            <div
              className="col col-md-auto"
              style={{
                fontSize: '16px',
                marginRight: '20px',
                display: 'flex',
                flexDirection: companyLogo ? 'row' : 'column',
                justifyContent: companyLogo ? 'flex-start' : 'center',
              }}
            >
              <div
                style={{
                  fontSize: companyLogo ? '16px' : '14px',
                  marginRight: '20px',
                  display: 'flex',
                  marginTop: companyLogo ? '20px' : '0px',
                  color: 'black',
                }}
              >
              Você está acessando o ambiente:
              </div>
              <div className="col col-md-auto">
                {companyLogo ? (
                  <img
                    style={{
                      height: '60px',
                    }}
                    src={companyLogo}
                    alt={Messages.get('LogoIFE')}
                  />
                ) : (
                  <span
                    style={{
                      color: 'black',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}
                  >
                    {companyName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="app-select">
          <div className="app-select--card">
            <div className="logo-container">
              <img alt="ForPDI Logo" src={ForpdiLogo} />
            </div>
            <p className="app-paragraph">
              Realize a
              <b style={{ fontWeight: 600 }}> Gestão do Plano de Desenvolvimento Institucional </b>
              (ForPDI).
            </p>
            <Link to="/home" className="app-select--card-bt app-select--forpdi">
              {Messages.getEditable('label.access')}
            </Link>
          </div>
          <div className="app-select--card">
            <div className="logo-container">
              <img alt="ForRisco Logo" src={ForriscoLogo} />
            </div>
            <p className="app-paragraph">
                Realize a
              <b style={{ fontWeight: 600 }}> Gestão de Riscos Institucionais </b>
                (ForRisco) da sua instituição.
            </p>
            <Link to="/forrisco/home" className="app-select--card-bt app-select--forrisco">
              {Messages.getEditable('label.access')}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default AppSelect;
