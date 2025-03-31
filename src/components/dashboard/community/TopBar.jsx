import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import Messages from 'forpdi/src/Messages';
import { getCompanyLogo } from 'forpdi/src/utils/urlUtil';

const companyLogo = getCompanyLogo();

const TopBar = ({
  title,
  logo,
  altLogo,
  logoForApp,
  switchTitle,
  switchAdress,
  switchLogo,
  titleClass,
}, { router }) => (
  <div style={{ position: 'absolute', zIndex: 1, width: '100%' }}>
    <div className="fpdi-top-bar" style={{ height: '70px' }}>
      <div className="marginRight0">
        <SecondaryIconButton
          title={Messages.get('label.logoff')}
          icon="arrow-left"
          onClick={() => router.push('/login')}
        />
      </div>
      <div className="col-md-2 marginRight0">
        <div className="fpdi-top-bar-brand">
          <img alt={altLogo} src={logo} />
        </div>
      </div>
      <div className="col-md-8 textAlignCenter marginRight0" style={{ width: '130%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MainTitle label={title} className={titleClass} />
          {companyLogo && (
            <img
              style={{ height: '50px', marginLeft: '10px' }}
              src={companyLogo}
              alt={Messages.get('LogoIFE')}
            />
          )}
        </div>
      </div>
      <div className="logoForApp-container" style={{ marginLeft: '10px', marginRight: '-30px' }}>
        <img style={{ width: '2.3rem', height: '2.3rem', textAlign: 'right' }} alt={logoForApp} src={logoForApp} />
      </div>
      <div className="col-md-2" style={{ display: 'flex', marginLeft: '10px' }}>
        <div
          style={{
            borderLeft: '1px solid rgba(128, 128, 128, 0.5)',
            marginLeft: '10px',
            paddingLeft: '10px',
            color: 'black',
            opacity: '0.8',
            fontSize: '0.85rem',
          }}
        >
          Acessar comunidade
          <div>
            <Link to={switchAdress} title={switchTitle}>
              <img src={switchLogo} alt={altLogo} style={{ width: '3.7rem', height: '1.6rem' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  switchAdress: PropTypes.string.isRequired,
  switchLogo: PropTypes.string.isRequired,
  switchTitle: PropTypes.string.isRequired,
  altLogo: PropTypes.string.isRequired,
  logoForApp: PropTypes.string.isRequired,
  titleClass: PropTypes.string,
  imageStyle: PropTypes.shape({}).isRequired,
};

TopBar.defaultProps = {
  titleClass: '',
};

TopBar.contextTypes = {
  router: PropTypes.shape({}).isRequired,
};

export default TopBar;
