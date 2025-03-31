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
  confirmText,
  declineText,
  onConfirm,
  onCancel,
  title,
}, { theme }) => (
  <Modal>
    <div className="modal-header">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Icon icon="check-circle" />
        <SecondaryTitle
          style={{ textTransform: 'capitalize', fontWeight: '600', marginLeft: '5px' }}
        >
          {title}
        </SecondaryTitle>
      </div>
    </div>

    <div className="modal-body fpdi-modal-body-close-goal">
      <p id>{text}</p>
    </div>

    <div className="modal-footer fpdi-modal-footer">
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
        onClick={() => onCancel()}
        hoverClass={`${theme}-hover-3-bg`}
        backgroundClassName={`${theme}-primary`}
        style={{ marginLeft: '10px' }}
      />
    </div>
  </Modal>
);

ConfirmModal.contextTypes = {
  theme: PropTypes.string.isRequired,
};

ConfirmModal.propTypes = {
  style: PropTypes.shape({}),
  confirmText: PropTypes.string,
  declineText: PropTypes.string,
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  title: PropTypes.string,
};

ConfirmModal.defaultProps = {
  style: {},
  confirmText: Messages.get('label.yes'),
  declineText: Messages.get('label.no'),
  onCancel: Modal.hide,
  title: Messages.get('label.confirmation'),
};

ConfirmModal.contextTypes = {
  theme: PropTypes.string.isRequired,
};

export default ConfirmModal;
