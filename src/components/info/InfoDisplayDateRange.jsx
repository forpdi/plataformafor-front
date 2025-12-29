import React from 'react';
import PropTypes from 'prop-types';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import Text from 'forpdi/src/components/typography/Text';

const InfoDisplayDateRange = ({
  label, beginDate, endDate, className,
}) => (
  <InputContainer>
    <Label className="label-vertical">
      {label}
    </Label>
    <Text className={className}>
      {beginDate.split(' ')[0]}
      <span style={{ margin: '0 10px' }}>à</span>
      {endDate.split(' ')[0]}
    </Text>
  </InputContainer>
);

InfoDisplayDateRange.propTypes = {
  label: PropTypes.string,
  beginDate: PropTypes.string,
  endDate: PropTypes.string,
  className: PropTypes.string,
};

InfoDisplayDateRange.defaultProps = {
  label: '',
  beginDate: '',
  endDate: '',
  className: '',
};

export default InfoDisplayDateRange;
