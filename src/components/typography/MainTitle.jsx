import React from 'react';
import PropTypes from 'prop-types';

const MainTitle = ({
  label,
  style,
  className,
}, { theme }) => (
  <h1
    className={`main-title ${theme}-text-color ${className}`}
    style={style}
  >
    {label}
  </h1>
);

MainTitle.propTypes = {
  label: PropTypes.string.isRequired,
  style: PropTypes.shape({}),
  className: PropTypes.string,
};

MainTitle.defaultProps = {
  style: null,
  className: '',
};

MainTitle.contextTypes = {
  theme: PropTypes.string,
};

export default MainTitle;
