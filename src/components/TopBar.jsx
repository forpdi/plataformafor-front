import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import TransparentIconButton from 'forpdi/src/components/buttons/TransparentIconButton';
import Dropdown from 'forpdi/src/components/Dropdown';
import Icon from 'forpdi/src/components/Icon';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Notifications from 'forpdi/src/components/notifications/Notifications';
import NewNotificationBadge from 'forpdi/src/components/notifications/NewNotificationBadge';

import Messages from 'forpdi/src/Messages';
import { getCompanyLogo } from 'forpdi/src/utils/urlUtil';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels.json';

import fpdiLogo from 'forpdi/img/logo.png';
import friscoLogo from 'forpdi/img/forrisco-logo.png';

import { DROPDOWN_NOTIFICATIONS_LIMIT } from 'forpdi/src/consts';

const companyLogo = getCompanyLogo();

const iconSize = '24px';
const iconColor = '#63af66';
const checkNotificationsIntervalTime = 20000;

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    const { location } = props;

    this.fpdiSelected = !location.pathname.startsWith('/forrisco');

    this.state = {
      hasNewNotifications: false,
      showNotifications: false,
    };
  }

  componentDidMount() {
    UserSession.on('retrieve-limitedNotifications', ({ data }) => {
      data && data.length > 0
        ? this.setState({ hasNewNotifications: true })
        : this.setState({ hasNewNotifications: false });
    });

    if (EnvInfo.company !== null) {
      UserSession.dispatch({
        action: UserSession.ACTION_LIST_NOTIFICATIONS,
        data: {
          pageSize: DROPDOWN_NOTIFICATIONS_LIMIT,
          visualized: false,
        },
      });

      this.interval = setInterval(() => UserSession.dispatch({
        action: UserSession.ACTION_LIST_NOTIFICATIONS,
        data: {
          pageSize: DROPDOWN_NOTIFICATIONS_LIMIT,
          visualized: false,
        },
      }), checkNotificationsIntervalTime);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    UserSession.off(null, null, null);
  }

  getAppButtonClassName(isActive) {
    return `main-top-bar__app-button ${isActive ? 'main-top-bar__app-button--active' : ''}`;
  }

  swicthFpdi() {
    if (!this.fpdiSelected) {
      this.swicthApp('/home');
    }
  }

  swicthFrisco() {
    if (this.fpdiSelected) {
      this.swicthApp('/forrisco/home');
    }
  }

  swicthApp(targetRoute) {
    const { router } = this.context;
    router.push(targetRoute);
  }

  onHandleRenderLogoutModal = () => {
    const confirmModal = (
      <ConfirmModal
        text={Messages.get('label.logoffConfirmation')}
        onConfirm={this.logout}
      />
    );
    Modal.show(confirmModal, this.fpdiSelected ? 'fpdi' : 'frisco');
  }

  logout = () => {
    UserSession.dispatch({
      action: UserSession.ACTION_LOGOUT,
    });
  }

  renderAppSwitch() {
    return (
      <div className="main-top-bar__app-switch">
        <button
          className={this.getAppButtonClassName(this.fpdiSelected)}
          type="button"
          onClick={() => this.swicthFpdi()}
        >
          <img src={fpdiLogo} alt="Forpdi" />
        </button>
        <button
          className={this.getAppButtonClassName(!this.fpdiSelected)}
          type="button"
          onClick={() => this.swicthFrisco()}
        >
          <img src={friscoLogo} alt="Forrisco" />
        </button>
      </div>
    );
  }

  renderUserData() {
    const { roles } = this.context;

    const accessLevel = AccessLevels.mapped[UserSession.get('accessLevel')];
    const { name } = UserSession.get('user');
    const nameFirstLetter = name.length > 0 ? name[0] : 'U';

    return (
      <div className="main-top-bar__user-container">
        <div className="main-top-bar__avatar">
          {nameFirstLetter}
        </div>
        <div className="main-top-bar__user-info">
          <p className="main-top-bar__user-access-level">{accessLevel}</p>
          <p className="main-top-bar__user-name">{name}</p>
        </div>
        <Menu roles={roles} fpdiSelected={this.fpdiSelected} />
      </div>
    );
  }

  render() {
    const { showNotifications, hasNewNotifications } = this.state;

    return (
      <div>
        <nav className="main-top-bar">
          {
            companyLogo ? (
              <img
                src={companyLogo}
                alt={Messages.get('LogoIFE')}
                className="main-top-bar__company-logo"
              />
            ) : <span />
          }
          <div className="main-top-bar__container">

            {this.renderAppSwitch()}

            <div className="main-top-bar__separator" />

            <div className="main-top-bar__container__right">

              {this.renderUserData()}

              <span
                style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
              >
                <TransparentIconButton
                  icon="bell"
                  iconSize={iconSize}
                  iconColor={iconColor}
                  onClick={() => this.setState({ showNotifications: !showNotifications })}
                  title={Messages.get('label.notification')}
                />
                <NewNotificationBadge
                  className="notification-button"
                  isNewNotification={hasNewNotifications}
                />
              </span>
              <TransparentIconButton
                icon="sign-out-alt"
                iconSize={iconSize}
                iconColor={iconColor}
                onClick={this.onHandleRenderLogoutModal}
                title={Messages.get('label.logoff')}
              />
            </div>
          </div>
        </nav>

        <Notifications show={showNotifications} onClose={() => this.setState({ showNotifications: false })} />
      </div>
    );
  }
}

TopBar.contextTypes = {
  roles: PropTypes.shape({}).isRequired,
  hasViewUsersPermission: PropTypes.bool.isRequired,
  router: PropTypes.shape({}).isRequired,
};

TopBar.propTypes = {
  location: PropTypes.shape({}).isRequired,
};

const Menu = ({ roles, fpdiSelected }) => {
  function renderIcon(icon) {
    return (
      <span style={{ width: 25, textAlign: 'center', marginRight: '0.5rem' }}>
        <Icon icon={icon} size="20px" color={iconColor} />
      </span>
    );
  }

  function renderMenuItem(to, icon, msgKey, hasPermssion, useAnchor) {
    if (hasPermssion !== null && hasPermssion !== undefined && !hasPermssion) {
      return null;
    }

    const label = Messages.get(msgKey);

    return (
      <li>
        {
          useAnchor ? (
            <a href={to} target="_blank" rel="noopener noreferrer">
              {renderIcon(icon)}
              {label}
            </a>
          ) : (
            <Link to={to}>
              {renderIcon(icon)}
              {label}
            </Link>
          )
        }
      </li>
    );
  }

  function getSystemRoute() {
    return roles.SYSADMIN
      ? '/system/companies'
      : `/system/companies/info/${EnvInfo.company.id}`;
  }

  const triggerButton = (
    <TransparentIconButton
      icon="chevron-down"
      iconSize="12px"
      iconColor="#000"
    />
  );

  return (
    <Dropdown triggerButton={triggerButton} style={{ alignSelf: 'flex-end' }}>
      <ul className="main-top-bar__menu">
        {renderMenuItem('/users/profile', 'user', 'label.myProfile')}
        {renderMenuItem('/users', 'users', 'label.users', roles.ADMIN)}
        {renderMenuItem(getSystemRoute(), 'heartbeat', 'label.system', roles.ADMIN)}
        {renderMenuItem('/structures', 'file-alt', 'label.structures', fpdiSelected && roles.SYSADMIN)}
        {renderMenuItem('/system/version', 'history', 'label.versionHistory')}
        {renderMenuItem('/system/communication', 'exclamation', 'label.communication', roles.SYSADMIN)}
        {renderMenuItem('/system/indicators', 'chart-line', 'label.indicators', roles.SYSADMIN)}
        {renderMenuItem('https://www.gov.br/mec/pt-br/plataformafor/pagina-inicial/', 'info-circle', 'label.information', null, true)}
      </ul>
    </Dropdown>
  );
};

Menu.propTypes = {
  roles: PropTypes.shape({}).isRequired,
  fpdiSelected: PropTypes.bool.isRequired,
};


export default TopBar;
