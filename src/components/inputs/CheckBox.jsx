import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';

const CheckBox = ({
  checked,
  id,
  name,
  label,
  onChange,
}, { theme }) => (
  <div className="check-box-option">
    <Label htmlFor={id} className="check-box-label">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        name={name}
        onChange={onChange}
        style={{ marginRight: '5px', cursor: 'pointer', outline: 'none' }}
        className={`${theme}-accent-color-primary`}
      />
      {label}
    </Label>
  </div>
);

CheckBox.propTypes = {
  checked: PropTypes.bool.isRequired,
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

CheckBox.defaultProps = {
  id: null,
  name: null,
  label: null,
};

CheckBox.contextTypes = {
  theme: PropTypes.string,
};

export default CheckBox;
