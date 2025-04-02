import React from 'react';
import PropTypes from 'prop-types';

import Icon from 'forpdi/src/components/Icon';
import Text from 'forpdi/src/components/typography/Text';
import ReplyableMessageModal from 'forpdi/src/components/modals/userMessage/ReplyableMessageModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import { splitDateTime } from 'forpdi/src/utils/dateUtil';

const NotificationMessageItem = ({
  creation,
  description,
  notificationId,
  isNewNotification,
}, { theme, toastr }) => {
  const message = description.split(/<b>|<\/b>|<p>|<\/p>/);
  const sender = message[1].slice(11, -1);
  const subject = message[2].slice(0, -2);

  function respond() {
    const messageModal = (
      <ReplyableMessageModal
        notificationId={notificationId}
        toastr={toastr}
      />
    );
    Modal.show(messageModal, theme);
  }

  return (
    isNewNotification && (
      <button
        type="button"
        onClick={() => respond()}
        className={`${theme}-primary-color notifications-item`}
        title={Messages.get('label.viewMessage')}
      >
        <Icon icon="envelope" />
        <Text className={`notification-text ${theme}-primary-color`}>
          {`De:${sender}`}
          <br />
          {`Assunto:${subject}`}
        </Text>
        <Icon icon="calendar-alt" />
        <Text className={`notification-date ${theme}-primary-color`}>
          {splitDateTime(creation).date}
        </Text>
      </button>
    )
  );
};

NotificationMessageItem.propTypes = {
  creation: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  notificationId: PropTypes.number.isRequired,
  isNewNotification: PropTypes.bool,
};

NotificationMessageItem.defaultProps = {
  isNewNotification: false,
};

NotificationMessageItem.contextTypes = {
  theme: PropTypes.string,
  toastr: PropTypes.shape({}).isRequired,
};

export default NotificationMessageItem;
