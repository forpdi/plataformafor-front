import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import InfoDisplayListWithActionButton from 'forpdi/src/components/info/InfoDisplayListWithActionButton';
import InfoDisplayList from 'forpdi/src/components/info/InfoDisplayList';
import Text from 'forpdi/src/components/typography/Text';
import Messages from 'forpdi/src/Messages';

const PreventiveActionsModal = ({
  preventiveActionsData,
  heading,
  hideEye,
  onClick,
}) => {
  function onClickHandler(item) {
    Modal.hide();
    onClick(item);
  }

  function renderHeader() {
    return (
      <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', padding: '10px 30px 0px 20px' }}>
        <SecondaryTitle>
          {heading}
        </SecondaryTitle>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  function renderPreventiveActions() {
    return (
      <div
        className="custom-scrollbar"
        style={{ overflowY: 'auto', height: '270px', padding: '0 35px' }}
      >
        { _.map(preventiveActionsData, (item, idx) => (
          <div key={idx}>
            <Text style={{ margin: '0 0 5px 0' }} fontSize="11px">
              {Messages.get('label.risk.name')}
            </Text>

            <Text style={{ margin: '0 0 10px 20px' }}>
              <b>{item.risk}</b>
            </Text>

            <Text fontSize="11px">
              {Messages.get('label.preventiveActions')}
            </Text>
            <div style={{ margin: '10px 20px 10px 20px' }}>
              {hideEye ? (
                <InfoDisplayList
                  infoList={_.map(item.preventiveActions, itemAction => itemAction.action)}
                />
              ) : (
                <InfoDisplayListWithActionButton
                  infoList={item.preventiveActions}
                  getItemText={risk => risk.action}
                  textMaxLength={65}
                  style={{ width: '100%' }}
                  onClick={action => onClickHandler(action)}
                />
              )}
            </div>
            <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
          </div>
        ))
        }
      </div>
    );
  }

  return (
    <Modal width="600px" height="auto">
      {renderHeader()}
      {renderPreventiveActions()}
    </Modal>
  );
};

PreventiveActionsModal.propTypes = {
  preventiveActionsData: PropTypes.oneOfType([
    PropTypes.shape({}), PropTypes.array,
  ]),
  style: PropTypes.shape({}),
  heading: PropTypes.string.isRequired,
  hideEye: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

PreventiveActionsModal.defaultProps = {
  style: {},
  preventiveActionsData: [],
  hideEye: false,
};

export default PreventiveActionsModal;
