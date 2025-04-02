import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

const IconButton = ({
  id,
  icon,
  className,
  hoverClass,
  style,
  onClick,
  loading,
  title,
  size,
  ...rest
}, { theme }) => {
  const iconButtonHoverClass = hoverClass === '' ? `${theme}-hover-3-bg ` : hoverClass;

  return (
    <button
      id={id}
      type="button"
      style={style}
      className={`icon-button ${theme}-primary-color ${iconButtonHoverClass} ${theme}-secondary-2-bg ${className}`}
      onClick={!loading && onClick}
      title={title}
      {...rest}
    >
      {loading ? <LoadingGauge size="20px" /> : <Icon icon={icon} size={size} />}
    </button>
  );
};

IconButton.propTypes = {
  id: PropTypes.string,
  icon: PropTypes.string,
  className: PropTypes.string,
  hoverClass: PropTypes.string,
  size: PropTypes.string,
  style: PropTypes.shape({}),
  onClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  title: PropTypes.string,
};

IconButton.defaultProps = {
  id: null,
  icon: '',
  className: '',
  hoverClass: '',
  size: '1.15rem',
  style: {},
  loading: false,
  title: '',
};

IconButton.contextTypes = {
  theme: PropTypes.string,
};

export default IconButton;
