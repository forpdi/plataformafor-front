import React from 'react';
import ReactDatePicker from 'react-datepicker';
import PropTypes from 'prop-types';
import moment from 'moment';

import Label from 'forpdi/src/components/typography/Label';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import ErrorControl from 'forpdi/src/components/ErrorControl';

const datePattern = 'DD/MM/YYYY';

const DatePicker = ({
  value,
  name,
  id,
  className,
  style,
  containerStyle,
  label,
  onChange,
  errorMsg,
  required,
  disabled,
}, { theme }) => {
  function renderLabel() {
    return label && (
      <Label htmlFor={id} required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  function onChangeHandler(dateMoment) {
    const dateStr = dateMoment ? dateMoment.format(datePattern) : '';

    onChange(dateStr, name);
  }

  return (
    <InputContainer className="date-picker-container" style={containerStyle}>
      {renderLabel()}
      <ErrorControl errorMsg={errorMsg}>
        <ReactDatePicker
          id={id}
          name={name}
          style={style}
          className={`date-picker ${theme}-text-color ${theme}-date-picker ${theme}-border-color-1 ${className}`}
          wrapperClassName="date-picker"
          dateFormat={datePattern}
          selected={value ? moment(value, datePattern) : null}
          onChange={onChangeHandler}
          placeholderText="dd/mm/aaaa"
          autoComplete="off"
          fixedHeight
          showYearDropdown
          disabled={disabled}
        />
      </ErrorControl>
    </InputContainer>
  );
};

DatePicker.propTypes = {
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
  errorMsg: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

DatePicker.defaultProps = {
  value: '',
  name: '',
  id: '',
  className: '',
  style: {},
  containerStyle: null,
  label: null,
  errorMsg: '',
  required: false,
  disabled: false,
};

DatePicker.contextTypes = {
  theme: PropTypes.string,
};

export default DatePicker;
