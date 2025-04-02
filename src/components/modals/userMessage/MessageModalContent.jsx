import React from 'react';
import PropTypes from 'prop-types';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import Text from 'forpdi/src/components/typography/Text';
import Icon from 'forpdi/src/components/Icon';
import InfoDisplayHtml from 'forpdi/src/components/info/InfoDisplayHtml';

const MessageModalContent = ({ messageData }) => {
  const {
    userSender,
    userReceiver,
    subject,
    message,
  } = messageData;

  return (
    <div>
      <div className="modal-header" style={{ display: 'flex', alignItems: 'center', padding: '10px 30px 0px 18px' }}>
        <Icon icon="envelope" size="2rem" />
        <MainTitle
          className="message-modal-subject hiphened-message"
          label={subject}
        />
      </div>
      <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      <div className="message-sender">
        <Icon icon="user-circle" size="2rem" />
        <div>
          <Text style={{ margin: '0px 0px 0px 5px' }} fontSize="14px">
            <b>{userSender.name}</b>
          </Text>
          <Text style={{ margin: '0px 0px 5px 5px' }} fontSize="11px">
            {`para: ${userReceiver.name}`}
          </Text>
        </div>
      </div>

      <InfoDisplayHtml className="message-modal-text" htmlInfo={message} />
    </div>
  );
};

MessageModalContent.propTypes = {
  messageData: PropTypes.shape({
    userSender: PropTypes.shape({}),
    userReceiver: PropTypes.shape({}),
    subject: PropTypes.string,
    message: PropTypes.string,
  }).isRequired,
};

MessageModalContent.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default MessageModalContent;
