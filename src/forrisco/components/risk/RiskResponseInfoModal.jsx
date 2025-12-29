/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable max-len */
import React from 'react';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Text from 'forpdi/src/components/typography/Text';

import Messages from 'forpdi/src/Messages';

const infoContent = [
  {
    responseName: 'Aceitar',
    info: 'Indica que não necessita de ações para o determinado risco.',
  },
  {
    responseName: 'Mitigar',
    info: 'Indica que terá tratamento como previsto atualmente no sistema. Consiste na adoção de ações para reduzir a probabilidade ou o impacto negativo do risco.',
  },
  {
    responseName: 'Evitar',
    info: 'Indica que terá tratamento como previsto atualmente no sistema. Implica na alteração do plano, atividade ou processo, de forma que o risco deixe de existir ou seja completamente eliminado.',
  },
  {
    responseName: 'Transferir',
    info: 'Permite transferir total ou parcialmente a responsabilidade pela resposta ao risco para uma terceira parte, mantendo o acompanhamento do risco.',
  },
  {
    responseName: 'Explorar',
    info: 'Consiste em adotar ações para garantir que uma oportunidade se concretize, maximizando sua probabilidade de ocorrência e seu impacto positivo.',
  },
  {
    responseName: 'Melhorar',
    info: 'Ações aplicadas com o objetivo de aumentar a probabilidade e/ou o impacto de uma oportunidade identificada, tornando mais provável que ela aconteça.',
  },
  {
    responseName: 'Compartilhar',
    info: 'Permite que haja a seleção de outra unidade ou subunidade, para que seja vinculada ao risco em edição, indicando que ambas as unidades têm atuação nele.',
  },
];

const RiskResponseInfoModal = () => {
  function renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.riskResponse')}
          </SecondaryTitle>
        </div>
        <Modal.Line />
      </div>
    );
  }

  function renderContent() {
    return (
      <div>
        <SecondaryTitle style={{ fontSize: '14px' }}><b>O QUE É A RESPOSTA AO RISCO</b></SecondaryTitle>
        <Text>
          <span className="frisco-primary-color">
            Resposta ao risco é o processo de desenvolvimento de estratégias e definição de ações para lidar com eventos incertos que possam impactar os objetivos de um projeto.
          </span>
        </Text>
        <Text>
          <span className="frisco-primary-color">
            Cada tipo de risco (ameaça ou oportunidade) possui um conjunto específico de respostas adequadas, alinhadas à sua natureza.
          </span>
        </Text>
        <Modal.Line />
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {
            _.map(infoContent, ({ responseName, info }, idx) => (
              <li key={idx}>
                <Text><b>{responseName}</b></Text>
                <Text style={{ margin: '10px' }}>
                  &#x2022; {info}
                </Text>
              </li>
            ))
          }
        </ul>
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

RiskResponseInfoModal.propTypes = {
};

RiskResponseInfoModal.defaultProps = {
  defaultCheckedValues: [],
};

export default RiskResponseInfoModal;
