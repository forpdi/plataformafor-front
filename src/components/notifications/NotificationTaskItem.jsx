import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

import Icon from 'forpdi/src/components/Icon';
import Text from 'forpdi/src/components/typography/Text';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';
import { parseRoutePathToLink } from 'forpdi/src/utils/urlUtil';
import { htmlStringToSimpleText } from 'forpdi/src/utils/util';

import Messages from 'forpdi/src/Messages';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';

const NotificationTaskItem = ({
  creation,
  url,
  description,
  isNewNotification,
  notificationId,
}, { theme }) => {
  function setResponded() {
    UserSession.dispatch({
      action: UserSession.ACTION_SET_NOTIFICATION_RESPONDED,
      data: notificationId,
    });
  }

  return (
    isNewNotification && (
      <Link
        to={parseRoutePathToLink(url)}
        className={`${theme}-primary-color notifications-item`}
        title={Messages.get('label.viewTask')}
        onClick={() => setResponded()}
      >
        <Icon icon="chart-bar" className={`${theme}-primary-color`} />
        <Text className={`notification-text ${theme}-primary-color`}>
          {htmlStringToSimpleText(description)}
        </Text>
        <Icon icon="calendar-alt" className={`${theme}-primary-color`} />
        <Text className={`notification-date ${theme}-primary-color`}>
          {splitDateTime(creation).date}
        </Text>
      </Link>
    )
  );
};

NotificationTaskItem.propTypes = {
  url: PropTypes.string.isRequired,
  creation: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  notificationId: PropTypes.number.isRequired,
  isNewNotification: PropTypes.bool,
};

NotificationTaskItem.defaultProps = {
  isNewNotification: false,
};

NotificationTaskItem.contextTypes = {
  theme: PropTypes.string,
};

export default NotificationTaskItem;
