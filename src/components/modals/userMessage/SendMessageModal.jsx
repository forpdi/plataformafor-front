import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';

import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import TextField from 'forpdi/src/components/inputs/TextField';
import Modal from 'forpdi/src/components/modals/Modal';
import Icon from 'forpdi/src/components/Icon';
import Label from 'forpdi/src/components/typography/Label';
import ErrorControl from 'forpdi/src/components/ErrorControl';

import Messages from 'forpdi/src/Messages';
import UserSession from 'forpdi/src/forpdi/core/store/UserSession';
import validationReplyMessage from 'forpdi/src/validations/validationReplyMessage';

class SendMessageModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subject: '',
      message: '',
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    UserSession.on('sendMessage', () => {
      const { notificationId, toastr } = this.props;

      if (notificationId) {
        UserSession.dispatch({
          action: UserSession.ACTION_SET_NOTIFICATION_RESPONDED,
          data: notificationId,
        });
      }
      toastr.addAlertSuccess(Messages.get('label.success.sendMessage'));
      Modal.hide();
    }, this);

    UserSession.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    UserSession.off(null, null, this);
  }

  onChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  }

  onChangeFormatted = (e) => {
    const { message } = this.state;
    if ($(e).text().length < 255) {
      this.setState({
        message: e,
      });
    } else {
      this.setState({
        message,
      });
    }
  }

  onClear = () => {
    this.setState({
      subject: '',
      message: '',
    });
  }

  onSubmit = () => {
    const { subject, message } = this.state;
    const { senderId } = this.props;

    const onSuccess = () => (
      UserSession.dispatch({
        action: UserSession.ACTION_SEND_MESSAGE,
        data: {
          subject,
          message,
          userId: senderId,
        },
      })
    );

    validationReplyMessage(this.state, onSuccess, this);
  }

  render() {
    const { subject, message, errors } = this.state;

    return (
      <Modal>
        <div className="modal-header" style={{ display: 'flex', padding: '20px' }}>
          <Icon
            icon="envelope"
            style={{ marginTop: '7px' }}
          />
          <SecondaryTitle
            style={{
              fontWeight: '600',
              marginLeft: '5px',
              wordBreak: 'break-all',
              textTransform: 'none',
            }}
          >
            {Messages.get('label.sendMenssage')}
          </SecondaryTitle>
        </div>

        <div style={{ maxWidth: '580px', padding: '20px 20px 50px 20px' }}>
          <TextField
            id="subject"
            name="subject"
            label={Messages.get('label.subject')}
            onChange={this.onChange}
            value={subject}
            maxLength={70}
            errorMsg={errors.subject}
            required
          />
          <div>
            <Label className="label-vertical" required style={{ marginTop: '30px' }}>
              {Messages.get('label.msg')}
            </Label>
            <ErrorControl errorMsg={errors.message}>
              <ReactQuill
                name="replyMessage"
                id="replyMessage"
                onChange={this.onChangeFormatted}
                ref="formatted-text"
                value={message}
                style={{ maxHeight: '200px', overflowY: 'auto' }}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                  ],
                }}
                formats={['bold', 'italic', 'underline']}
              />
            </ErrorControl>
          </div>
        </div>

        <div
          className="modal-footer fpdi-modal-footer"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <SecondaryButton
            title="Limpar"
            text="Limpar"
            onClick={() => {
              this.onClear();
            }}
          />
          <PrimaryButton
            title="Enviar"
            text="Enviar"
            onClick={() => {
              this.onSubmit();
            }}
          />
        </div>
      </Modal>
    );
  }
}

SendMessageModal.propTypes = {
  notificationId: PropTypes.string,
  senderId: PropTypes.number.isRequired,
  toastr: PropTypes.shape({}).isRequired,
  style: PropTypes.shape({}),
};

SendMessageModal.defaultProps = {
  notificationId: null,
  style: {},
};

export default SendMessageModal;
