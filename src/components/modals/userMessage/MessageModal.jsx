import React from 'react';
import PropTypes from 'prop-types';

import MessageModalContent from 'forpdi/src/components/modals/userMessage/MessageModalContent';
import Modal from 'forpdi/src/components/modals/Modal';


const MessageModal = ({ messageData }) => (
  (
    <Modal>
      <MessageModalContent messageData={messageData} />
    </Modal>
  )
);

MessageModal.propTypes = {
  messageData: PropTypes.shape({}).isRequired,
};

export default MessageModal;
