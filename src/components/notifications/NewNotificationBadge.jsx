import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';

const NewNotificationBadge = ({ isNewNotification }) => (
  <span style={{ pointerEvents: 'none', position: 'absolute' }}>
    {
      isNewNotification
        ? <Icon icon="circle" className="new-notification error-color" />
        : <div style={{ width: '19px' }} />
    }
  </span>
);

NewNotificationBadge.propTypes = {
  isNewNotification: PropTypes.bool,
};

NewNotificationBadge.defaultProps = {
  isNewNotification: false,
};

export default NewNotificationBadge;
