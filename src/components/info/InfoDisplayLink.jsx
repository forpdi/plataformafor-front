import React from 'react';
import PropTypes from 'prop-types';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import Label from 'forpdi/src/components/typography/Label';
import Text from 'forpdi/src/components/typography/Text';

const InfoDisplayLink = ({
  label,
  info,
  className,
  href,
  style,
}) => (
  <InputContainer>
    <Label className="label-vertical">
      {label}
    </Label>
    <Text className={className} style={style}>
      <a href={href}>{info}</a>
    </Text>

  </InputContainer>
);

InfoDisplayLink.propTypes = {
  label: PropTypes.string,
  info: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  href: PropTypes.string.isRequired,
};

InfoDisplayLink.defaultProps = {
  label: '',
  info: '',
  className: '',
  style: {},
};

export default InfoDisplayLink;
