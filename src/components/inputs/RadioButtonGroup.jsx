import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import RadioButton from 'forpdi/src/components/inputs/RadioButton';
import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const RadioButtonGroup = ({
  options,
  checkedValue,
  groupName,
  onChange,
  label,
  errorMsg,
  radioButtonStyle,
  containerStyle,
  className,
  required,
  disabled,
}) => {
  const renderLabel = (
    <Label required={required} className="radio-button-group-label">
      {label}
    </Label>
  );

  const renderRadioButtons = (
    <div
      className={`radio-button-group-options ${className}`}
      style={{ margin: '5px' }}
    >
      {_.map(options, option => (
        <RadioButton
          key={option.value}
          checked={option.value === checkedValue}
          onChange={() => onChange(option.value, groupName)}
          id={`${groupName}-${option.value}`}
          name={groupName}
          label={option.label}
          style={radioButtonStyle}
          disabled={disabled}
        />
      ))}
    </div>
  );

  return (
    <InputContainer className="radio-button-group-container" style={containerStyle}>
      {renderLabel}
      <div style={{ maxWidth: 'min-content' }}>
        <ErrorControl errorMsg={errorMsg}>
          {renderRadioButtons}
        </ErrorControl>
      </div>
    </InputContainer>
  );
};

const valuePropType = PropTypes.oneOfType([
  PropTypes.string, PropTypes.number, PropTypes.bool,
]);

RadioButtonGroup.propTypes = {
  checkedValue: valuePropType,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: valuePropType,
  })).isRequired,
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  groupName: PropTypes.string.isRequired,
  errorMsg: PropTypes.string,
  radioButtonStyle: PropTypes.shape({}),
  className: PropTypes.string,
  containerStyle: PropTypes.shape({}),
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

RadioButtonGroup.defaultProps = {
  checkedValue: null,
  label: '',
  errorMsg: '',
  radioButtonStyle: {},
  className: '',
  containerStyle: {},
  required: false,
  disabled: false,
};

export default RadioButtonGroup;
