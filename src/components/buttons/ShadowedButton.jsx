import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const ShadowedButton = ({
  icon,
  onClick,
  style,
  hoverClass,
  className,
  size,
  loading,
  title,
}, { theme }) => {
  const secondaryButtonHoverClass = hoverClass === '' ? `${theme}-hover-4-bg ` : hoverClass;

  return (
    <button
      title={title}
      type="button"
      style={style}
      className={`shadowed-button ${theme}-shadowed ${theme}-primary-color ${secondaryButtonHoverClass} ${className}`}
      onClick={onClick}
    >
      {loading ? <span>...</span> : <Icon icon={icon} size={size} />}
    </button>
  );
};

ShadowedButton.propTypes = {
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  style: PropTypes.shape({}),
  hoverClass: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

ShadowedButton.defaultProps = {
  icon: 'chart-line',
  style: {},
  className: '',
  hoverClass: '',
  size: '16px',
  loading: false,
  title: '',
};

ShadowedButton.contextTypes = {
  theme: PropTypes.string,
};

export default ShadowedButton;
