/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayListWithActionButton from 'forpdi/src/components/info/InfoDisplayListWithActionButton';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Text from 'forpdi/src/components/typography/Text';

const DashboardItemsModal = ({
  items,
  heading,
  headingDetails,
  subHeading,
  onClick,
  getItemText,
  hideEye,
}) => {
  function onClickHandler(item) {
    Modal.hide();
    onClick(item);
  }

  return (
    <Modal width="600px" height="auto">
      {/* 1. Removida a classe 'modal-header' que causava bugs de espaçamento.
        2. alignItems: 'flex-start' garante alinhamento à esquerda.
        3. Padding top zerado (0px) para o título subir, pois a Modal global já tem um respiro.
      */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start', // Força alinhamento à esquerda
          padding: '0px 30px 0px 20px', // Padding ajustado para subir o título
          marginBottom: '5px',
        }}
      >
        <SecondaryTitle>
          {heading}
        </SecondaryTitle>
        {
          _.map(headingDetails, (headingDetail, index) => (
            <Text
              key={`heading-detail-${index}`}
              fontSize="13px"
              style={{
                marginLeft: '0px', // Removida margem esquerda para alinhar com o título
                marginTop: '5px',
                overflowWrap: 'break-word',
                textAlign: 'left',
              }}
            >
              <b>
                {headingDetail.label}
:
              </b>
              {' '}
              {headingDetail.value}
            </Text>
          ))
        }
      </div>

      <hr style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)', margin: '10px 0px' }} />

      {subHeading && (
        <Text style={{ margin: '0 0 15px 20px', textAlign: 'left' }}>
          {subHeading}
        </Text>
      )}

      <div
        className="custom-scrollbar"
        style={{ overflowY: 'auto', height: '270px', padding: '0 35px' }}
      >
        {hideEye ? (
          <InfoDisplayList
            infoList={_.map(items, item => getItemText(item))}
          />
        ) : (
          <InfoDisplayListWithActionButton
            infoList={items}
            getItemText={getItemText}
            textMaxLength={65}
            style={{ width: '100%' }}
            onClick={item => onClickHandler(item)}
          />
        )}

      </div>
    </Modal>
  );
};

DashboardItemsModal.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})),
  style: PropTypes.shape({}),
  heading: PropTypes.string.isRequired,
  headingDetails: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
  })),
  subHeading: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  getItemText: PropTypes.func,
  hideEye: PropTypes.bool,
};

DashboardItemsModal.defaultProps = {
  style: {},
  headingDetails: [],
  subHeading: null,
  items: [],
  getItemText: ({ description }) => description,
  hideEye: false,
};

export default DashboardItemsModal;
