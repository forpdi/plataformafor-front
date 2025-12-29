import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import Messages from 'forpdi/src/Messages';
import { getCompanyLogo } from 'forpdi/src/utils/urlUtil';

const companyLogo = getCompanyLogo();

const styles = {
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  container: {
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 15px',
    width: '100%',
    boxSizing: 'border-box',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '200px',
  },
  centerSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    textAlign: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: '200px',
  },
  brandLogo: {
    maxHeight: '40px',
    marginLeft: '10px',
  },
  companyLogo: {
    height: '40px',
    marginLeft: '15px',
  },
  appLogo: {
    width: '3.0rem',
    height: '3.0rem',
    marginLeft: '10px',
  },
  switchContainer: {
    borderLeft: '1px solid #ccc',
    marginLeft: '15px',
    paddingLeft: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: '0.85rem',
    color: '#333',
    lineHeight: '1.2',
  },
  switchLogo: {
    height: '2.0rem',
    width: 'auto',
    marginTop: '3px',
  },
};

const TopBar = ({
  title,
  logo,
  altLogo,
  logoForApp = '',
  switchTitle,
  switchAdress,
  switchLogo,
  titleClass = '',
}, { router }) => (
  <div style={styles.wrapper}>
    <div style={styles.container}>
      <div style={styles.leftSection}>
        <SecondaryIconButton
          title={Messages.get('label.logoff')}
          icon="arrow-left"
          onClick={() => router.push('/login')}
        />
        <div className="fpdi-top-bar-brand">
          <img alt={altLogo} src={logo} style={styles.brandLogo} />
        </div>
      </div>

      <div style={styles.centerSection}>
        <MainTitle label={title} className={titleClass} />
        {companyLogo && (
          <img
            style={styles.companyLogo}
            src={companyLogo}
            alt={Messages.get('LogoIFE')}
          />
        )}
      </div>

      <div style={styles.rightSection}>
        {logoForApp && (
          <img style={styles.appLogo} alt="Logo App" src={logoForApp} />
        )}
        <div style={styles.switchContainer}>
          <span>Acessar comunidade</span>
          <Link to={switchAdress} title={switchTitle}>
            <img src={switchLogo} alt={altLogo} style={styles.switchLogo} />
          </Link>
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
  logoForApp: PropTypes.string,
  titleClass: PropTypes.string,
};

TopBar.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default TopBar;
