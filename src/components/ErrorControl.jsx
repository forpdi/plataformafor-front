import React from 'react';
import PropTypes from 'prop-types';

const ErrorControl = ({
  children, errorMsg, showErrorMsg, style,
}) => (
  <div style={{ position: 'relative' }}>
    <div
      style={style}
      className={`error-control ${errorMsg ? 'error-control--active' : ''}`}
    >
      {children}
    </div>
    {
      errorMsg && showErrorMsg && <p style={{ position: 'absolute' }} className="error-color">{errorMsg}</p>
    }
  </div>
);

ErrorControl.getElement = () => document.getElementsByClassName('error-control--active')[0];

ErrorControl.propTypes = {
  children: PropTypes.node,
  errorMsg: PropTypes.oneOfType([
    PropTypes.string, PropTypes.node,
  ]),
  showErrorMsg: PropTypes.bool,
  style: PropTypes.shape({}),
};

ErrorControl.defaultProps = {
  children: null,
  errorMsg: '',
  showErrorMsg: true,
  style: {},
};
export default ErrorControl;
