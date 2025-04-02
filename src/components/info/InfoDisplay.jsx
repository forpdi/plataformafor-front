import React from 'react';
import PropTypes from 'prop-types';

import IconButton from 'forpdi/src/components/buttons/IconButton';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import Text from 'forpdi/src/components/typography/Text';

const InfoDisplay = ({
  label,
  info,
  button,
  className,
  containerStyle,
  required,
}) => (
  <InputContainer style={{
    ...containerStyle,
    wordWrap: 'break-word',
    wordBreak: 'break-word',
  }}
  >
    <Label required={required} className="label-vertical">
      {label}
    </Label>
    <Text className={className}>
      {info}
      {button && <IconButton icon={button} style={{ marginLeft: '20px' }} />}
    </Text>
  </InputContainer>
);

InfoDisplay.propTypes = {
  label: PropTypes.string,
  info: PropTypes.string,
  button: PropTypes.string,
  className: PropTypes.string,
  containerStyle: PropTypes.shape({}),
  required: PropTypes.bool,
};

InfoDisplay.defaultProps = {
  label: '',
  info: '',
  button: '',
  className: '',
  containerStyle: {},
  required: false,
};

export default InfoDisplay;
