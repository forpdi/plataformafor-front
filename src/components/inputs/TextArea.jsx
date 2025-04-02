import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const TextArea = ({
  value,
  name,
  id,
  rows,
  placeholder,
  className,
  style,
  label,
  onChange,
  onPaste,
  maxLength,
  errorMsg,
  required,
}, { theme }) => {
  function renderLabel() {
    return label && (
      <Label htmlFor={id} required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  return (
    <InputContainer>
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg} style={{ display: 'flex' }}>
        <textarea
          id={id}
          name={name}
          rows={rows || '8'}
          placeholder={placeholder}
          value={value}
          style={style}
          className={`text-field ${theme}-text-color ${theme}-secondary-2-bg ${theme}-border-color-1 ${className}`}
          onChange={onChange}
          onPaste={onPaste}
          maxLength={maxLength}
          required={required}
        />
      </ErrorControl>
    </InputContainer>
  );
};

TextArea.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  name: PropTypes.string,
  id: PropTypes.string,
  rows: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onPaste: PropTypes.func,
  maxLength: PropTypes.number,
  errorMsg: PropTypes.string,
  required: PropTypes.bool,
};

TextArea.defaultProps = {
  value: '',
  name: '',
  id: '',
  rows: '',
  placeholder: '',
  className: '',
  style: {},
  label: null,
  onPaste: null,
  maxLength: 4000,
  errorMsg: '',
  required: false,
};

TextArea.contextTypes = {
  theme: PropTypes.string,
};

export default TextArea;
