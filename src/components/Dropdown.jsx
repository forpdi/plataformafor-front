import React from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({
  children,
  triggerButton,
  triggerButtonWrapperStyle,
  isRightPosition,
  modalClass,
  style,
}) => (
  <div className="dropdown" style={style}>
    <span
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="true"
      style={triggerButtonWrapperStyle}
    >
      {triggerButton}
    </span>
    <div
      className={`dropdown__content ${isRightPosition ? 'dropdown__content--right' : ''} ${modalClass}`}
      aria-labelledby="top-bar-notification"
    >
      {children}
    </div>
  </div>
);

Dropdown.propTypes = {
  children: PropTypes.node.isRequired,
  modalClass: PropTypes.string,
  triggerButton: PropTypes.node.isRequired,
  triggerButtonWrapperStyle: PropTypes.shape({}),
  isRightPosition: PropTypes.bool,
  style: PropTypes.shape({}),
};

Dropdown.defaultProps = {
  modalClass: '',
  triggerButtonWrapperStyle: {},
  isRightPosition: false,
  style: {},
};

export default Dropdown;
