import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import CheckBox from 'forpdi/src/components/inputs/CheckBox';
import CommunicationStore from 'forpdi/src/forpdi/core/store/Communication';
import Text from 'forpdi/src/components/typography/Text';
import Icon from 'forpdi/src/components/Icon';

class CommunicationModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: false,
    };
  }

  onChangeCheckbox(e) {
    const { communication } = this.props;
    const { checked } = e.target;

    this.setState({
      checked,
    });
    if (checked) {
      CommunicationStore.setLastVisualizedCommunication(communication);
    } else {
      CommunicationStore.clearLastVisualizedCommunication();
    }
  }

  renderHeader() {
    const { communication } = this.props;
    const { title } = communication;

    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px', justifyContent: 'center' }}>
          <SecondaryTitle>
            <b>{title}</b>
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  render() {
    const { checked } = this.state;
    const { communication } = this.props;
    const { message, responsible } = communication;

      return(
        <Modal width="600px" height="auto">
          {this.renderHeader()}
          <div style={{ marginLeft: '1rem' }}>
        <div>

        <Text className="message-modal-text">
          {message}
        </Text>
        </div>
          <div style={{ marginLeft: '10rem', marginTop: '1rem' }}>
            <CheckBox
              name="showCommunication"
              key="showCommunication"
              checked={checked}
              onChange={e => this.onChangeCheckbox(e)}
              label="Não apresentar novamente"
            />
          </div>
        </div>
        </Modal>
      );
  }
}

CommunicationModal.propTypes = {
  communicationId: PropTypes.shape({}),
};

export default CommunicationModal;