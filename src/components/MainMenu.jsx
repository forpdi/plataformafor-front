import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import TransparentIconButton from 'forpdi/src/components/buttons/TransparentIconButton';
import Icon from 'forpdi/src/components/Icon';

import Messages from 'forpdi/src/Messages';

const iconColor = '#FFF';

class MainMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: true,
    };
  }

  setExpanded(expanded) {
    const { onExpandChange } = this.props;

    this.setState({ expanded });

    onExpandChange();
  }

  render() {
    const { children, appLogo } = this.props;
    const { theme } = this.context;
    const { expanded } = this.state;

    const stateClassName = expanded ? 'main-menu--expanded' : 'main-menu--shrunk';

    return (
      <div
        className={`main-menu custom-scrollbar ${stateClassName} ${theme}-primary-bg`}
      >
        <div className="main-menu__top-container">
          <img
            className="main-menu__logo"
            style={{ height: 'inherit' }}
            alt={Messages.get('label.forRiscoLogo')}
            src={appLogo}
          />
          <TransparentIconButton
            icon="bars"
            iconColor={iconColor}
            onClick={() => this.setExpanded(!expanded)}
          />
        </div>

        {children}

        <span className={`main-menu__version ${theme}-secondary-color`}>
          {`${EnvInfo.buildVersion }, ${ process.env.BUILD_VERSION}`}
        </span>
      </div>
    );
  }
}
MainMenu.displayName = 'MainMenu';


MainMenu.MenuItem = ({
  to,
  onClick,
  location,
  label,
  title,
  icon,
}, { theme }) => {
  const isActive = location.pathname.includes(to);
  const itemClassName = `${theme}-secondary-color hover-active-main-menu ${isActive ? 'shadowed-bg' : ''}`;

  function renderContent() {
    return (
      <div className="main-menu__item-content">
        {
          icon && (
            <span className="main-menu__item-icon">
              <Icon icon={icon} color={iconColor} />
            </span>
          )
        }
        <span className="main-menu__item-label">
          {label}
        </span>
      </div>
    );
  }

  function renderLink() {
    return (
      <Link
        to={to}
        className={itemClassName}
        title={title || label}
      >
        {renderContent()}
      </Link>
    );
  }

  function renderButton() {
    return (
      <button
        className={itemClassName}
        onClick={onClick}
        title={label}
        type="button"
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          padding: 0,
        }}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <div className="main-menu__menu-item">
      {to ? renderLink() : renderButton()}
    </div>
  );
};
MainMenu.MenuItem.displayName = `${MainMenu.displayName}.MenuItem`;


MainMenu.MultiMenuItems = ({
  label,
  icon,
  onClick,
  expanded,
  children,
}, { theme }) => {
  const itemClassName = `${theme}-secondary-color hover-active-main-menu`;

  function renderContent() {
    return (
      <div className="main-menu__item-content">
        {
          icon && (
            <span className="main-menu__item-icon">
              <Icon icon={icon} color={iconColor} />
            </span>
          )
        }
        <span className="main-menu__item-label">
          {label}
          <Icon
            icon="sort-down"
            color={iconColor}
            style={{ position: 'absolute', right: '2px', paddingBottom: '5px' }}
          />
        </span>
      </div>
    );
  }

  function renderButton() {
    return (
      <button
        className={itemClassName}
        onClick={onClick}
        title={label}
        type="button"
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          padding: 0,
        }}
      >
        {renderContent()}
      </button>
    );
  }

  return (
    <div>
      <div className="main-menu__menu-item">
        {renderButton()}
      </div>
      {expanded && children}
    </div>
  );
};
MainMenu.MenuItem.displayName = `${MainMenu.displayName}.MultiMenuItems`;


MainMenu.Separator = () => (
  <div className="main-menu__separator" />
);
MainMenu.Separator.displayName = `${MainMenu.displayName}.Separator`;


MainMenu.propTypes = {
  children: PropTypes.node.isRequired,
  appLogo: PropTypes.string.isRequired,
  onExpandChange: PropTypes.func,
};

MainMenu.defaultProps = {
  onExpandChange: () => {},
};

MainMenu.contextTypes = {
  theme: PropTypes.string,
};


MainMenu.MenuItem.propTypes = {
  to: PropTypes.string,
  onClick: PropTypes.func,
  label: PropTypes.string,
  title: PropTypes.string,
  location: PropTypes.shape({}).isRequired,
  icon: PropTypes.string,
};

MainMenu.MenuItem.defaultProps = {
  label: '',
  title: null,
  to: null,
  onClick: null,
  icon: null,
};

MainMenu.MenuItem.contextTypes = {
  theme: PropTypes.string,
};


MainMenu.MultiMenuItems.propTypes = {
  onClick: PropTypes.func.isRequired,
  label: PropTypes.string,
  icon: PropTypes.string,
  expanded: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

MainMenu.MultiMenuItems.defaultProps = {
  label: '',
  icon: null,
  children: null,
};

MainMenu.MultiMenuItems.contextTypes = {
  theme: PropTypes.string,
};

export default MainMenu;
