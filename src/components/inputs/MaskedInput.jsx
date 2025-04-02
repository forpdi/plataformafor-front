import React from 'react';
import ReactMaskedInput from 'react-maskedinput';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const MaskedInput = ({
  mask,
  value,
  name,
  id,
  className,
  containerStyle,
  style,
  label,
  onChange,
  placeholder,
  errorMsg,
  onBlur,
  required,
  disabled,
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
        <ReactMaskedInput
          name={name}
          id={id}
          mask={mask}
          className={`text-field ${theme}-text-color ${theme}-border-color-1 ${className}`}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          style={style}
          onBlur={onBlur}
          disabled={disabled}
        />
      </ErrorControl>
    </InputContainer>
  );
};

MaskedInput.propTypes = {
  mask: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  containerStyle: PropTypes.shape({}),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  errorMsg: PropTypes.string,
  onBlur: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

MaskedInput.defaultProps = {
  value: '',
  name: '',
  id: '',
  className: '',
  style: {},
  containerStyle: null,
  label: null,
  placeholder: '',
  errorMsg: '',
  onBlur: null,
  required: false,
  disabled: false,
};

MaskedInput.contextTypes = {
  theme: PropTypes.string,
};

export default MaskedInput;
