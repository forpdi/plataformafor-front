import React from 'react';
import PropTypes from 'prop-types';

const SecondaryTitle = ({
  children,
  style,
  className,
}, { theme }) => (
  <h2
    className={`${className} secondary-title ${theme}-text-color`}
    style={style}
  >
    {children}
  </h2>
);

SecondaryTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({}),
};

SecondaryTitle.defaultProps = {
  className: '',
  style: null,
};

SecondaryTitle.contextTypes = {
  theme: PropTypes.string,
};

export default SecondaryTitle;
