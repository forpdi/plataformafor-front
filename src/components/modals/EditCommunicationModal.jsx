import React from 'react';
import PropTypes from 'prop-types';

import Modal from 'forpdi/src/components/modals/Modal';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryButton from 'forpdi/src/components/buttons/SecondaryButton';
import DatePicker from 'forpdi/src/components/inputs/DatePicker';
import { validateUpdateCommunication } from 'forpdi/src/for/validations/validationCommunication';
import CommunicationStore from 'forpdi/src/forpdi/core/store/Communication';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

import Messages from 'forpdi/src/Messages';

class EditCommunicationModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      communication: null,
      errors: {},
    };
  }

  componentDidMount() {
    const { communicationId } = this.props;

    CommunicationStore.on('retrieve', ({ attributes }) => {
      this.setState({
        communication: { ...attributes },
        oldCommunication: { ...attributes },
      });
    }, this);

    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_RETRIEVE,
      data: communicationId,
    });
  }

  componentWillUnmount() {
    CommunicationStore.off(null, null, this);
  }

  onChange = (validityEnd) => {
    const { communication } = this.state;

    this.setState({ communication: { ...communication, validityEnd } });
  }

  onSubmit = () => {
    const { communication, oldCommunication } = this.state;
    const { validityEnd: newValidityEnd } = communication;
    const { validityBegin, validityEnd } = oldCommunication;

    const onSuccess = () => (
      CommunicationStore.dispatch({
        action: CommunicationStore.ACTION_UPDATE_COMMUNICATION,
        data: { ...communication, showPopup: true },
      })
    );

    validateUpdateCommunication(validityBegin, newValidityEnd, validityEnd, onSuccess, this);
  }

  extractDate = dateTime => (dateTime ? dateTime.split(' ')[0] : '');

  renderHeader() {
    return (
      <div>
        <div className="modal-header" style={{ display: 'flex', padding: '10px 30px 0px 0px' }}>
          <SecondaryTitle>
            {Messages.get('label.extendCommunication')}
          </SecondaryTitle>
        </div>
        <hr style={{ border: '0.15px solid rgba(101,97, 98, 0.1)', margin: '10px 0px' }} />
      </div>
    );
  }

  renderOldValidity() {
    const { oldCommunication } = this.state;
    const { validityBegin, validityEnd } = oldCommunication;

    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: '18px' }}>
          {this.extractDate(validityBegin)}
          <span style={{ margin: '0 10px' }}>à</span>
          {this.extractDate(validityEnd)}
        </span>
      </div>
    );
  }

  renderNewValidity() {
    const { errors, communication } = this.state;
    const { validityEnd } = communication;

    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
        <DatePicker
          id="newValidityEnd"
          label={Messages.get('label.dateEnd')}
          onChange={this.onChange}
          value={validityEnd}
          errorMsg={errors.validityEnd}
        />
      </div>
    );
  }

  renderButtons() {
    return (
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <SecondaryButton
          text={Messages.get('label.cancel')}
          onClick={Modal.hide}
          backgroundClassName="frisco-primary"
        />
        <PrimaryButton
          text={Messages.get('label.submitLabel')}
          onClick={this.onSubmit}
        />
      </div>
    );
  }

  renderContent() {
    return (
      <div>
        {this.renderOldValidity()}
        {this.renderNewValidity()}
        {this.renderButtons()}
      </div>
    );
  }

  render() {
    const { communication } = this.state;

    return (
      <Modal width="300px">
        {this.renderHeader()}
        {communication ? this.renderContent() : <LoadingGauge /> }
      </Modal>
    );
  }
}

EditCommunicationModal.propTypes = {
  communicationId: PropTypes.number.isRequired,
};

export default EditCommunicationModal;
