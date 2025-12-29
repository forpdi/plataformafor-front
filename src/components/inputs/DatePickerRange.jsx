import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';

const DatePickerRange = ({
  beginValue,
  endValue,
  name,
  id,
  className,
  datePickerClassName,
  datePickerStyle,
  style,
  label,
  onChange,
  beginErrorMsg,
  endErrorMsg,
  required,
  disabled,
}) => {
  function renderLabel() {
    return label && (
      <Label htmlFor={id} required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  function onChangeBeginValue(date) {
    onChange(date, endValue, name);
  }

  function onChangeEndValue(date) {
    onChange(beginValue, date, name);
  }

  return (
    <InputContainer>
      {renderLabel()}
      <div
        style={{ display: 'flex', ...style }}
        className={className}
      >
        <DatePicker
          name={`${name}-begin`}
          id={`${id}-begin`}
          value={beginValue}
          onChange={onChangeBeginValue}
          className={datePickerClassName}
          style={datePickerStyle}
          containerStyle={{ margin: 0 }}
          errorMsg={beginErrorMsg}
          disabled={disabled}
        />

        <span style={{ margin: '10px 15px 0' }}>à</span>
        <DatePicker
          name={`${name}-end`}
          id={`${id}-end`}
          value={endValue}
          onChange={onChangeEndValue}
          className={datePickerClassName}
          style={datePickerStyle}
          containerStyle={{ margin: 0 }}
          errorMsg={endErrorMsg}
          disabled={disabled}
        />
      </div>
    </InputContainer>
  );
};

DatePickerRange.propTypes = {
  beginValue: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  endValue: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  datePickerClassName: PropTypes.string,
  datePickerStyle: PropTypes.shape({}),
  style: PropTypes.shape({}),
  label: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  beginErrorMsg: PropTypes.string,
  endErrorMsg: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

DatePickerRange.defaultProps = {
  beginValue: '',
  endValue: '',
  name: '',
  id: '',
  className: '',
  datePickerClassName: '',
  datePickerStyle: null,
  style: {},
  label: null,
  beginErrorMsg: '',
  endErrorMsg: '',
  required: false,
  disabled: false,
};

export default DatePickerRange;
