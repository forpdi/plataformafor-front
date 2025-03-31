import React from 'react';
import PropTypes from 'prop-types';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import validationCommunication from 'forpdi/src/for/validations/validationCommunication';
import CommunicationForm from 'forpdi/src/for/components/system/CommunicationForm';
import CommunicationStore from 'forpdi/src/forpdi/core/store/Communication';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import { parseDate, nowDate } from 'forpdi/src/utils/dateUtil';

import Messages from 'forpdi/src/Messages';

class NewCommunication extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      communication: {
        title: '',
        message: '',
        responsible: null,
        validityBegin: '',
        validityEnd: '',
      },
      oldCommunication: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;

    CommunicationStore.on('communicationCreated', () => {
      toastr.addAlertSuccess(Messages.get('label.newCommunication'));
      router.push('/system/communication');
    }, this);

    CommunicationStore.on('communicationValidityVerified', (response) => {
      this.setState({ oldCommunication: response.data });
      this.onHandleRenderConfirmModal();
    }, this);

    CommunicationStore.on('fail', () => this.setState({ waitingSubmit: false }), this);
  }

  componentWillUnmount() {
    CommunicationStore.off(null, null, this);
  }

  onChangeHandler = (communication) => {
    this.setState({ communication });
  }

  onSubmit = () => {
    const { communication } = this.state;
    const { validityBegin } = communication;

    const onSuccess = () => (
      CommunicationStore.dispatch({
        action: CommunicationStore.ACTION_COMPARE_VALIDATION,
        data: { validityBegin: parseDate(validityBegin) },
      })
    );

    validationCommunication(communication, onSuccess, this);
  }

  extractDate = dateTime => (dateTime ? dateTime.split(' ')[0] : '');

  onHandleRenderConfirmModal = () => {
    const { theme } = this.context;
    const { oldCommunication } = this.state;

    const confirmModalCommunication = () => {
      const { title, validityBegin, validityEnd } = oldCommunication;
      const validityBeginFormatted = this.extractDate(validityBegin);
      const validityEndFormatted = this.extractDate(validityEnd);

      const modalText = `Já existe um comunicado configurado neste mesmo período (${title}: ${validityBeginFormatted} - ${validityEndFormatted}).
       Ao prosseguir com a configuração, este novo comunicado substituirá automaticamente o anterior. Deseja continuar?`;
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.onConfirmNewCommunication()}
          onCancel={() => this.onCancelNewCommunication()}
        />
      );
      Modal.show(confirmModal, theme);
    };

    oldCommunication != null ? confirmModalCommunication() : this.onConfirmNewCommunication();
  };

  onCancelNewCommunication = () => {
    this.setState({ waitingSubmit: false });
    Modal.hide();
  }

  onConfirmNewCommunication = () => {
    const { communication, oldCommunication } = this.state;
    const {
      title, message, validityBegin, validityEnd,
    } = communication;

    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_NEW_COMMUNICATION,
      data: {
        title,
        message,
        validityBegin,
        validityEnd,
      },
    });

    if (!oldCommunication) return;

    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_UPDATE_COMMUNICATION,
      data: { ...oldCommunication, validityEnd: nowDate(), showPopup: false },
    });
  };

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.settingsCommunication')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
        message={Messages.get('label.msg.cancelChange')}
      />
    );
  }

  renderMainContent() {
    const { communication, errors } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.configCommunication') }]}
          topContainerContent={{ title: Messages.get('label.configCommunication') }}
        >
          <TabbedPanel.MainContainer>
            <CommunicationForm
              errors={errors}
              communication={communication}
              onChange={this.onChangeHandler}
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

NewCommunication.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

export default NewCommunication;
