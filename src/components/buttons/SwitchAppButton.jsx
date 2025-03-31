import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Messages from 'forpdi/src/Messages';

import logoPDI from 'forpdi/img/logo-fpdi-reduzido.png';
import logoRisco from 'forpdi/img/logo-frisco-reduzido.png';
import logoFor from 'forpdi/img/logo-for-reduzido.png';

const defaultOpts = {
  for: { to: '/app-select', title: Messages.get('label.acessForPlatform'), logo: logoFor },
  fpdi: { to: '/forrisco/home', title: Messages.get('label.acessForRisco'), logo: logoRisco },
  frisco: { to: '/home', title: Messages.get('label.acessForPdi'), logo: logoPDI },
};

const SwitchAppButton = ({ appName, opts }) => {
  function getAppOpt() {
    const appOpt = opts[appName] || {};
    const defaultAppOpt = defaultOpts[appName];

    return {
      to: appOpt.to || defaultAppOpt.to,
      title: appOpt.title || defaultAppOpt.title,
      logo: appOpt.logo || defaultAppOpt.logo,
    };
  }

  const { to, title, logo } = getAppOpt();

  return (
    <Link
      to={to}
      className="forpdi-button frisco-primary-color frisco-hover-3-bg frisco-secondary-2-bg"
      title={title}
    >
      <img style={{ width: '2.5rem', height: '2.5rem' }} alt={title} src={logo} />
    </Link>

  );
};

SwitchAppButton.propTypes = {
  appName: PropTypes.string,
  opts: PropTypes.shape({}),
};

SwitchAppButton.defaultProps = {
  appName: 'for',
  opts: defaultOpts,
};

export default SwitchAppButton;
