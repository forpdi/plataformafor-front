/* eslint-disable no-unused-vars */
/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';

import Messages from 'forpdi/src/Messages';
import Modal from 'forpdi/src/components/modals/Modal';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Icon from 'forpdi/src/components/Icon';

const ConfirmModal = ({
  text,
  confirmText = Messages.get('label.yes'),
  declineText = Messages.get('label.no'),
  onConfirm,
  onCancel = Modal.hide,
  title = Messages.get('label.confirmation'),
  style = {},
}, { theme }) => (
  <Modal>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <Icon icon="check-circle" />
      <SecondaryTitle
        style={{
          textTransform: 'capitalize',
          fontWeight: '600',
          marginLeft: '5px',
        }}
      >
        {title}
      </SecondaryTitle>
    </div>

    <div
      style={{
        textAlign: 'center',
        marginBottom: '25px',
        color: '#555',
        paddingLeft: '15px',
        paddingRight: '15px',
      }}
    >
      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{text}</p>
    </div>

    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '15px',
      }}
    >
      <PrimaryButton
        title={confirmText}
        text={confirmText}
        onClick={() => {
          Modal.hide();
          onConfirm();
        }}
      />
      <SecondaryButton
        title={declineText}
        text={declineText}
        onClick={() => onCancel && onCancel()}
        hoverClass={`${theme}-hover-3-bg`}
        backgroundClassName={`${theme}-primary`}
        style={{ marginLeft: '10px' }}
      />
    </div>
  </Modal>
);

ConfirmModal.propTypes = {
  style: PropTypes.shape({}),
  confirmText: PropTypes.string,
  declineText: PropTypes.string,
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  title: PropTypes.string,
};

ConfirmModal.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default ConfirmModal;
