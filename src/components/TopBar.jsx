/* eslint-disable no-nested-ternary */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import TransparentIconButton from 'forpdi/src/components/buttons/TransparentIconButton';
import Dropdown from 'forpdi/src/components/Dropdown';
import Icon from 'forpdi/src/components/Icon';
import Modal from 'forpdi/src/components/modals/Modal'; // O nosso Modal refatorado
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

    if (typeof EnvInfo !== 'undefined' && EnvInfo.company !== null) {
      this.dispatchNotificationCheck();
      this.interval = setInterval(() => this.dispatchNotificationCheck(), checkNotificationsIntervalTime);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    UserSession.off(null, null, null);
  }

  dispatchNotificationCheck() {
    UserSession.dispatch({
      action: UserSession.ACTION_LIST_NOTIFICATIONS,
      data: {
        pageSize: DROPDOWN_NOTIFICATIONS_LIMIT,
        visualized: false,
      },
    });
  }

  isFpdiSelected() {
    const { location } = this.props;
    return location && location.pathname ? !location.pathname.startsWith('/forrisco') : true;
  }

  getAppButtonClassName(isActive) {
    return `main-top-bar__app-button ${isActive ? 'main-top-bar__app-button--active' : ''}`;
  }

  swicthFpdi() {
    if (!this.isFpdiSelected()) {
      this.swicthApp('/home');
    }
  }

  swicthFrisco() {
    if (this.isFpdiSelected()) {
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
    const isFpdi = this.isFpdiSelected();

    return (
      <div className="main-top-bar__app-switch">
        <button
          className={this.getAppButtonClassName(isFpdi)}
          type="button"
          onClick={() => this.swicthFpdi()}
        >
          <img src={fpdiLogo} alt="Forpdi" />
        </button>
        <button
          className={this.getAppButtonClassName(!isFpdi)}
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
    const isFpdi = this.isFpdiSelected();

    const accessLevelId = UserSession.get('accessLevel');
    const user = UserSession.get('user');

    const accessLevel = accessLevelId ? AccessLevels.mapped[accessLevelId] : '';
    const name = user ? user.name : '';
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
        <Menu roles={roles} fpdiSelected={isFpdi} />
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

              {/* BOTÃO DE LOGOFF COM LOGS */}
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
  hasViewUsersPermission: PropTypes.bool,
  router: PropTypes.shape({}).isRequired,
};

TopBar.propTypes = {
  location: PropTypes.shape({}).isRequired,
};

// --- SUB-COMPONENTE MENU ---

const Menu = ({ roles, fpdiSelected }) => {
  function renderIcon(icon) {
    return (
      <span style={{ width: 25, textAlign: 'center', marginRight: '0.5rem' }}>
        <Icon icon={icon} size="20px" color={iconColor} />
      </span>
    );
  }

  function renderMenuItem(to, icon, msgKey, hasPermission, useAnchor) {
    if (hasPermission === false) {
      return null;
    }
    const label = Messages.get(msgKey);
    const content = (
      <>
        {renderIcon(icon)}
        {label}
      </>
    );

    return (
      <li key={to}>
        {
          useAnchor ? (
            <a href={to} target="_blank" rel="noopener noreferrer">
              {content}
            </a>
          ) : (
            <Link to={to}>
              {content}
            </Link>
          )
        }
      </li>
    );
  }

  function getSystemRoute() {
    return roles.SYSADMIN
      ? '/system/companies'
      : (typeof EnvInfo !== 'undefined' && EnvInfo.company ? `/system/companies/info/${EnvInfo.company.id}` : '/system');
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
  fpdiSelected: PropTypes.bool,
};

export default TopBar;
