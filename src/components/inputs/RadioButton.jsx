import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';

const RadioButton = ({
  checked,
  onChange,
  id,
  name,
  label,
  style,
  disabled,
}, { theme }) => {
  let inputHoverClass;
  let labelClass;
  if (disabled) {
    inputHoverClass = `${theme}-radio-color-1 radio-button-input--disable`;
    labelClass = 'radio-button-label--disabled';
  } else {
    inputHoverClass = `${theme}-radio-color-1 ${theme}-hover-1-bg`;
    labelClass = 'radio-button-label';
  }

  return (
    <div className="radio-button" style={style}>
      <input
        type="radio"
        id={id}
        checked={checked}
        onChange={onChange}
        name={name}
        style={{ outline: 'none' }}
        className={` ${inputHoverClass} radio-button-input`}
        disabled={disabled}
      />
      <Label htmlFor={id} className={labelClass} style={{ paddingLeft: '5px' }}>
        {label}
      </Label>
    </div>
  );
};

RadioButton.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string.isRequired,
  style: PropTypes.shape({}),
  disabled: PropTypes.bool,
};

RadioButton.defaultProps = {
  id: null,
  name: null,
  style: {},
  disabled: false,
};

RadioButton.contextTypes = {
  theme: PropTypes.string,
};

export default RadioButton;
