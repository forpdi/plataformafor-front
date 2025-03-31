import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const TextField = ({
  value,
  name,
  id,
  className,
  style,
  containerStyle,
  label,
  onChange,
  errorMsg,
  maxLength,
  required,
  placeholder,
  disabled,
  type,
  minValue,
  ...rest
}, { theme }) => {
  function renderLabel() {
    return label && (
      <Label required={required} htmlFor={id} className="label-vertical">
        {label}
      </Label>
    );
  }

  return (
    <InputContainer style={containerStyle}>
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg}>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          style={style}
          className={`text-field ${theme}-text-color ${theme}-secondary-2-bg ${theme}-border-color-1 ${className}`}
          onChange={onChange}
          readOnly={!onChange}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          min={minValue}
          {...rest}
        />
      </ErrorControl>
    </InputContainer>
  );
};

TextField.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  label: PropTypes.string,
  onChange: PropTypes.func,
  errorMsg: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
  minValue: PropTypes.number,
};

TextField.defaultProps = {
  value: '',
  name: '',
  id: '',
  className: '',
  style: {},
  containerStyle: {},
  label: null,
  errorMsg: '',
  onChange: null,
  maxLength: 4000,
  required: false,
  placeholder: '',
  disabled: false,
  type: 'text',
  minValue: null,
};

TextField.contextTypes = {
  theme: PropTypes.string,
};

export default TextField;
