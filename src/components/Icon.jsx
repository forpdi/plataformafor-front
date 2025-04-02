import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Icon = ({
  icon,
  type = 'fas',
  size = '1.15rem',
  color,
  className,
  style,
  ...rest
}, { theme }) => {
  const iconClassName = color ? className : `${className} ${theme}-primary-color`;

  return (
    <FontAwesomeIcon
      style={{ fontSize: size, ...style }}
      color={color}
      icon={[type, icon]}
      className={iconClassName}
      {...rest}
    />
  );
};

Icon.propTypes = {
  icon: PropTypes.string,
  type: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

Icon.defaultProps = {
  icon: '',
  type: 'fas',
  size: '1.15rem',
  color: '',
  className: '',
  style: {},
};

Icon.contextTypes = {
  theme: PropTypes.string,
};

export default Icon;
