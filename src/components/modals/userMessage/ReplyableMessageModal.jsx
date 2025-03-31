import React from 'react';
import PropTypes from 'prop-types';

import MessageModalContent from 'forpdi/src/components/modals/userMessage/MessageModalContent';
import SendMessageModal from 'forpdi/src/components/modals/userMessage/SendMessageModal';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Modal from 'forpdi/src/components/modals/Modal';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import UserSession from 'forpdi/src/forpdi/core/store/UserSession';

class ReplyableMessageModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messageData: null,
    };
  }

  componentDidMount() {
    const { notificationId } = this.props;

    UserSession.on('retrieve-message-by-notificationID', ({ data }) => {
      this.setState({ messageData: data });
    }, this);

    UserSession.dispatch({
      action: UserSession.ACTION_GET_MESSAGE_BY_NOTIFICATION_ID,
      data: notificationId,
    });
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  renderMessage() {
    const { toastr } = this.props;

    const { messageData } = this.state;
    const {
      userSender,
      notificationId,
    } = messageData;

    const { theme } = this.context;

    return (
      <div>
        <MessageModalContent messageData={messageData} />

        <div className="modal-footer fpdi-modal-footer">
          <PrimaryButton
            title="Responder"
            text="Responder"
            onClick={() => {
              Modal.show(
                <SendMessageModal
                  senderId={userSender.id}
                  notificationId={notificationId}
                  toastr={toastr}
                />,
                theme,
              );
            }}
          />
        </div>
      </div>
    );
  }

  render() {
    const { messageData } = this.state;

    return (
      (
        <Modal>
          {
            messageData
              ? this.renderMessage()
              : (
                <div style={{ minHeight: '310px', display: 'flex', alignItems: 'center' }}>
                  <LoadingGauge />
                </div>
              )
          }
        </Modal>
      )
    );
  }
}


ReplyableMessageModal.propTypes = {
  notificationId: PropTypes.number.isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

ReplyableMessageModal.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default ReplyableMessageModal;
