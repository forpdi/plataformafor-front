import React from 'react';
import PropTypes from 'prop-types';

const Label = ({
  htmlFor,
  children,
  style,
  className,
  required,
}, { theme }) => (
  <label
    htmlFor={htmlFor}
    className={`label ${theme}-text-color ${className}`}
    style={style}
  >
    {children}
    {required && <span className="error-color required-field">*</span>}
  </label>
);

Label.propTypes = {
  htmlFor: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.shape({}),
  className: PropTypes.string,
  required: PropTypes.bool,
};

Label.defaultProps = {
  style: null,
  className: '',
  htmlFor: '',
  required: false,
};

Label.contextTypes = {
  theme: PropTypes.string,
};

export default Label;
