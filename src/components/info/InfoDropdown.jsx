import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';
import Dropdown from 'forpdi/src/components/Dropdown';

import Messages from 'forpdi/src/Messages';

const InfoDropdown = ({ infoMessage, style }) => (
  <Dropdown
    modalClass="dropdown__content--info"
    style={style}
    triggerButton={(
      <Icon
        icon="info-circle"
        style={{ cursor: 'pointer', marginLeft: '3px' }}
        title={Messages.get('label.information')}
      />
    )}
  >
    {infoMessage}
  </Dropdown>
);

InfoDropdown.propTypes = {
  infoMessage: PropTypes.string,
  style: PropTypes.shape({}),
};

InfoDropdown.defaultProps = {
  infoMessage: '',
  style: {},
};

export default InfoDropdown;
