import React from 'react';
import PropTypes from 'prop-types';
import { validateTime } from 'forpdi/src/utils/dateUtil';

import MaskedInput from 'forpdi/src/components/inputs/MaskedInput';

const timePattern = 'HH:mm:ss';

const TimePicker = ({
  onChange,
  value,
  name,
  ...rest
}, { theme }) => {
  function onChangeHandler(e) {
    const { value: timeValue } = e.target;
    onChange(timeValue, name);
  }

  function onBlur() {
    if (!validateTime(value)) {
      onChange('', name);
    }
  }

  return (
    <MaskedInput
      name={name}
      mask="11:11:11"
      className={`date-picker time-picker-${theme} ${theme}-border-color-1`}
      value={value}
      placeholder={timePattern}
      onChange={onChangeHandler}
      onBlur={onBlur}
      {...rest}
    />
  );
};

TimePicker.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

TimePicker.defaultProps = {
  value: '',
  name: '',
};

TimePicker.contextTypes = {
  theme: PropTypes.string,
};

export default TimePicker;
