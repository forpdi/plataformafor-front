import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import PageHeader from 'forpdi/src/components/PageHeader';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';

const FormPageTop = ({
  label,
  onSubmit,
  waitingSubmit,
  message,
  primaryButtonText,
  goBackTo,
}, { router, theme }) => {
  const buttonsStyle = { minWidth: '130px', paddingRight: 0, paddingLeft: 0 };
  function onHandleRenderModal(modalText) {
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => (goBackTo ? goBackTo() : router.goBack())}
        theme={theme}
      />
    );
    Modal.show(confirmModal, theme);
  }

  return (
    <AppContainer.TopContent>
      <PageHeader pageTitle={label} goBack={() => onHandleRenderModal(message)} />
      <div>
        <SecondaryButton
          title={Messages.get('label.cancel')}
          text={Messages.get('label.cancel')}
          onClick={() => onHandleRenderModal(message)}
          style={{ marginRight: '15px', ...buttonsStyle }}
        />
        <PrimaryButton
          title={primaryButtonText}
          text={primaryButtonText}
          onClick={onSubmit}
          loading={waitingSubmit}
          style={buttonsStyle}
        />
      </div>

    </AppContainer.TopContent>
  );
};

FormPageTop.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  theme: PropTypes.string,
};

FormPageTop.propTypes = {
  label: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  goBackTo: PropTypes.func,
  waitingSubmit: PropTypes.bool,
  message: PropTypes.string,
  primaryButtonText: PropTypes.string,
};

FormPageTop.defaultProps = {
  label: '',
  waitingSubmit: false,
  goBackTo: null,
  message: Messages.get('label.msg.cancelChange'),
  primaryButtonText: Messages.get('label.submitLabel'),
};

export default FormPageTop;
