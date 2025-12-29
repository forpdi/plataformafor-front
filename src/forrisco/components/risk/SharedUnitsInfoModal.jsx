/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import React from 'react';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';

const SharedUnitsInfoModal = () => {
  function renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            Compartilhamento de um Risco
          </SecondaryTitle>
        </div>
        <Modal.Line />
      </div>
    );
  }

  function renderContent() {
    return (
      <div>
        <SecondaryTitle style={{ fontSize: '14px' }}><b>COMO FUNCIONA?</b></SecondaryTitle>
        <Text>
          <span className="frisco-primary-color">
            O Compartilhamento, não cria o vínculo com as Unidades e Subunidades selecionadas é apenas visual na tela do risco marcado com o status “Compartilhado”.
          </span>
        </Text>
        <Modal.Line />
      </div>
    );
  }

  return (
    <Modal width="650px" height="auto">
      {renderHeader()}
      {renderContent()}
    </Modal>
  );
};

SharedUnitsInfoModal.propTypes = {
};

SharedUnitsInfoModal.defaultProps = {
  defaultCheckedValues: [],
};

export default SharedUnitsInfoModal;
