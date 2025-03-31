import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';

const CheckCircle = ({
  checked,
  id,
  name,
  label,
  circleColor,
  style,
  onClick,
}, { theme }) => (
  <div className="check-circle" style={style}>
    <Label htmlFor={id} className="check-box-label" style={{ fontStyle: 'italic' }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        name={name}
        onChange={onClick}
        style={{ marginRight: '5px', cursor: 'pointer', outline: 'none' }}
        className={`${theme}-accent-color-primary`}
      />
      <span className="check-circle__label-text">
        {label}
      </span>
      <span className="checkmark" style={{ backgroundColor: circleColor }} />
    </Label>
  </div>
);

CheckCircle.propTypes = {
  checked: PropTypes.bool.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  circleColor: PropTypes.string,
  style: PropTypes.shape({}),
  onClick: PropTypes.func.isRequired,
};

CheckCircle.defaultProps = {
  id: null,
  name: null,
  circleColor: 'blue',
  style: {},
};

CheckCircle.contextTypes = {
  theme: PropTypes.string,
};

export default CheckCircle;
