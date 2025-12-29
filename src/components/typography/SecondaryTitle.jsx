import React from 'react';
import PropTypes from 'prop-types';

const SecondaryTitle = ({
  children,
  style = null,
  className = '',
  title = '',
}, { theme }) => (
  <h2
    className={`${className} secondary-title ${theme}-text-color`}
    style={style}
    title={title || children}
  >
    {children}
  </h2>
);

SecondaryTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({}),
  title: PropTypes.string,
};

SecondaryTitle.contextTypes = {
  theme: PropTypes.string,
};

export default SecondaryTitle;
