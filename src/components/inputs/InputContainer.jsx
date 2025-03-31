import React from 'react';
import PropTypes from 'prop-types';

const InputContainer = ({ className, style, children }) => (
  <div className={`input-container ${className}`} style={style}>
    {children}
  </div>
);
InputContainer.displayName = 'InputContainer';

InputContainer.propTypes = {
  className: PropTypes.string,
  style: PropTypes.shape({}),
  children: PropTypes.node,
};


InputContainer.defaultProps = {
  className: '',
  style: {},
  children: null,
};

export default InputContainer;
