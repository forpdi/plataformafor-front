import React from 'react';
import PropTypes from 'prop-types';

import TextField from 'forpdi/src/components/inputs/TextField';

const PasswordField = ({
  id,
  name,
  label,
  onChange,
  value,
  errorMsg,
  required,
}) => (
  <TextField
    id={id}
    name={name}
    label={label}
    onChange={onChange}
    value={value}
    required={required}
    type="password"
    errorMsg={errorMsg}
    autoComplete
  />
);

PasswordField.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  errorMsg: PropTypes.string,
  required: PropTypes.bool,
};

PasswordField.defaultProps = {
  value: '',
  name: '',
  id: '',
  label: null,
  errorMsg: '',
  required: false,
};

export default PasswordField;
