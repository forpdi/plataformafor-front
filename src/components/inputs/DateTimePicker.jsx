import React from 'react';
import PropTypes from 'prop-types';

import Label from 'forpdi/src/components/typography/Label';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import TimePicker from 'forpdi/src/components/inputs/TimePicker';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';

const DateTimePicker = ({
  date,
  time,
  name,
  id,
  className,
  datePickerClassName,
  datePickerStyle,
  style,
  label,
  onChange,
  dateErrorMsg,
  timeErrorMsg,
  required,
}) => {
  function renderLabel() {
    return label && (
      <Label htmlFor={id} required={required} className="label-vertical">
        {label}
      </Label>
    );
  }

  function onChangeBeginDate(inputDate) {
    onChange(inputDate, time, name);
  }

  function onChangeBeginTime(inputTime) {
    onChange(date, inputTime, name);
  }

  return (
    <InputContainer>
      {renderLabel()}
      <div
        style={{ display: 'flex', ...style }}
        className={className}
      >
        <DatePicker
          name={`${name}Date`}
          id={`${id}Date`}
          value={date}
          onChange={onChangeBeginDate}
          className={datePickerClassName}
          style={datePickerStyle}
          containerStyle={{ margin: 0 }}
          errorMsg={dateErrorMsg}
        />

        <span style={{ margin: '10px 15px 0' }} />
        <TimePicker
          name={`${name}Time`}
          id={`${id}Time`}
          value={time}
          onChange={onChangeBeginTime}
          containerStyle={{ margin: 0 }}
          errorMsg={timeErrorMsg}
        />
      </div>
    </InputContainer>
  );
};

DateTimePicker.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.string, PropTypes.number, PropTypes.array,
  ]),
  time: PropTypes.oneOfType([
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
  dateErrorMsg: PropTypes.string,
  timeErrorMsg: PropTypes.string,
  required: PropTypes.bool,
};

DateTimePicker.defaultProps = {
  date: '',
  time: '',
  name: '',
  id: '',
  className: '',
  datePickerClassName: '',
  datePickerStyle: null,
  style: {},
  label: null,
  dateErrorMsg: '',
  timeErrorMsg: '',
  required: false,
};

export default DateTimePicker;
