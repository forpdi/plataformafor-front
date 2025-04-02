import React from 'react';
import PropTypes from 'prop-types';

const AppStyledButton = ({
  onClick,
  text,
  style,
  className,
  title,
  appName,
  disabled,
}) => {
  const switchButtonHoverClass = disabled || `${appName}-hover-2-bg`;
  const classByApp = disabled
    ? `${`${appName}-secondary-bg`} ${appName}-primary-color ${switchButtonHoverClass} ${className} ${appName}-secondary-border-color`
    : `${appName}-primary-bg ${appName}-secondary-color ${appName}-hover-1-bg`;
  return (
    <button
      title={title}
      type="button"
      style={{
        padding: '8px 30px',
        borderRadius: '8px',
        borderWidth: disabled ? '1px' : '',
        border: disabled ? '' : 'none',
        ...style,
      }}
      disabled={disabled}
      className={classByApp}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

AppStyledButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  appName: PropTypes.string.isRequired,
  text: PropTypes.string,
  style: PropTypes.shape({}),
  className: PropTypes.string,
  title: PropTypes.string,
  disabled: PropTypes.bool,
};

AppStyledButton.defaultProps = {
  text: '',
  style: {},
  className: '',
  title: '',
  disabled: false,
};

AppStyledButton.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default AppStyledButton;
