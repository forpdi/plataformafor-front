import React from 'react';
import PropTypes from 'prop-types';

import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryTitle from 'forpdi/src/components/typography/SecondaryTitle';
import Table from 'forpdi/src/components/Table';
import CommunicationStore from 'forpdi/src/forpdi/core/store/Communication';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import Pagination from 'forpdi/src/components/Pagination';
import { passedEndDate } from 'forpdi/src/utils/dateUtil';

import Messages from 'forpdi/src/Messages';
import EditCommunicationModal from 'forpdi/src/components/modals/EditCommunicationModal';

class CommunicationDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      historicCommunications: null,
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
    };
  }

  componentDidMount() {
    const { page, pageSize } = this.state;

    CommunicationStore.on('communicationsListed', ({ data, total }) => {
      this.setState({ historicCommunications: data, total });
    }, this);

    CommunicationStore.on('communicationUpdated', () => {
      const { toastr } = this.context;

      toastr.addAlertSuccess(Messages.get('label.updateCommunication'));
      Modal.hide();

      CommunicationStore.dispatch({
        action: CommunicationStore.ACTION_LIST_COMMUNICATIONS,
        data: {
          page,
          pageSize,
        },
      });
    }, this);

    CommunicationStore.on('communicationClosed', () => {
      const { toastr } = this.context;

      toastr.addAlertSuccess(Messages.get('label.updateCommunication'));

      CommunicationStore.dispatch({
        action: CommunicationStore.ACTION_LIST_COMMUNICATIONS,
        data: {
          page,
          pageSize,
        },
      });
    }, this);

    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_LIST_COMMUNICATIONS,
      data: {
        page: 1,
        pageSize: Pagination.defaultPageSize,
      },
    });
  }

  componentWillUnmount() {
    CommunicationStore.off(null, null, this);
  }

  onClick = (version) => {
    const { router } = this.context;
    const { id: versionId } = version;
    router.push(`/system/version/edit/${versionId}`);
  };

  pageChange = (page, pageSize) => {
    this.findCommunications(page, pageSize);
    this.setState({
      page,
      pageSize,
    });
  }

  findCommunications(page, pageSize) {
    this.setState({
      page,
      pageSize,
    });
    CommunicationStore.dispatch({
      action: CommunicationStore.ACTION_LIST_COMMUNICATIONS,
      data: {
        page,
        pageSize,
      },
    });
  }

  goBack = () => {
    const { router } = this.context;
    router.goBack();
  };

  extractDate = dateTime => (dateTime ? dateTime.split(' ')[0] : '');

  isDeactivated = rowData => (rowData.validityEnd
    ? passedEndDate(rowData.validityEnd) || !rowData.showPopup : !rowData.showPopup);

  renderTopContent = () => {
    const { router } = this.context;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={Messages.get('label.communication')} goBack={this.goBack} />
        <PrimaryButton
          text={Messages.get('label.configCommunication')}
          title={Messages.get('label.configCommunication')}
          onClick={() => router.push('/system/communication/new')}
        />
      </AppContainer.TopContent>
    );
  };

  renderTable() {
    const {
      historicCommunications, page, pageSize, total,
    } = this.state;

    const renderValidityCol = ({ validityBegin, validityEnd }) => (
      <span>
        {this.extractDate(validityBegin)}
        <span style={{ margin: '0 10px' }}>à</span>
        {this.extractDate(validityEnd)}
      </span>
    );

    const onHandleRenderEntendModal = (communication) => {
      const { theme } = this.context;
      const modal = (
        <EditCommunicationModal
          communicationId={communication.id}
        />
      );

      Modal.show(modal, theme);
    };

    const endCommunication = (communicationId) => {
      CommunicationStore.dispatch({
        action: CommunicationStore.ACTION_END_COMMUNICATION,
        data: communicationId,
      });
    };

    const onHandleRenderEndModal = (data) => {
      const { theme } = this.context;
      const { id, title, validityEnd } = data;
      const validityEndFormatted = this.extractDate(validityEnd);

      const modalText = `O comunicado ${title} com data final para ${validityEndFormatted}
      será desativado. Deseja continuar?`;
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => endCommunication(id)}
        />
      );
      Modal.show(confirmModal, theme);
    };

    const renderResponsible = ({ responsible }) => <span>{responsible.name}</span>;

    const columns = [
      {
        name: Messages.get('label.title'), field: 'title', width: '15%',
      },
      {
        name: Messages.get('label.msg'), field: 'message', width: '35%',
      },
      {
        name: Messages.get('label.responsibleInformed'), width: '20%', render: renderResponsible,
      },
      {
        name: Messages.get('label.policyValidity'), width: '25%', render: renderValidityCol,
      },
    ];

    const actionColumnItems = [
      {
        icon: 'pen',
        title: Messages.get('label.extendCommunication'),
        action: onHandleRenderEntendModal,
        disabled: rowData => this.isDeactivated(rowData),
      },
      {
        icon: 'trash',
        title: Messages.get('label.endCommunication'),
        action: onHandleRenderEndModal,
        disabled: rowData => this.isDeactivated(rowData),
      },
    ];

    return (
      <div>
        <Table
          data={historicCommunications}
          columns={columns}
          redirect={this.onHandleRedirect}
          actionColumnItems={actionColumnItems}
        />
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
        />
      </div>
    );
  }

  renderMainContent = () => {
    const { historicCommunications } = this.state;
    return (
      <AppContainer.MainContent>
        <TabbedPanel>
          <TabbedPanel.TopContainer>
            <SecondaryTitle>{Messages.get('label.allCommunication')}</SecondaryTitle>
          </TabbedPanel.TopContainer>
          <TabbedPanel.MainContainer>
            {
              historicCommunications ? this.renderTable() : <LoadingGauge />
            }
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        <AppContainer.ScrollableContent>
          {this.renderMainContent()}
        </AppContainer.ScrollableContent>
      </AppContainer.Content>
    );
  }
}

CommunicationDetails.contextTypes = {
  roles: PropTypes.shape({}).isRequired,
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  theme: PropTypes.string.isRequired,
};

CommunicationDetails.propTypes = {
  params: PropTypes.shape({}),
};

CommunicationDetails.defaultProps = {
  params: {},
};

export default CommunicationDetails;
