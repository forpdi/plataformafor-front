import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';
import ItemInformation from 'forpdi/src/forrisco/views/ItemInformation';

import Messages from 'forpdi/src/Messages';
import ItemStore from 'forpdi/src/forrisco/stores/Item';

class PolicySubitemInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subitemData: null,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;
    const { subItemId, policyId, itemId } = params;

    ItemStore.on('retrieveSubitem', ({ data }) => {
      this.setState({ subitemData: data });
    }, this);

    ItemStore.on('subitemDeleted', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
      router.push(`forrisco/policy/${policyId}/item/${itemId}/subitems`);
    }, this);

    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_SUBITEM,
      data: subItemId,
    });
  }

  componentWillUnmount() {
    ItemStore.off(null, null, this);
  }

  deleteSubItem = (subItemId) => {
    ItemStore.dispatch({
      action: ItemStore.ACTION_DELETE_SUB,
      data: subItemId,
    });
  }

  onHandleRenderDeleteModal = () => {
    const { params } = this.props;
    const { subItemId } = params;

    const modalText = Messages.get('label.deleteSubitemConfirmation');
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deleteSubItem(subItemId)}
      />
    );
    Modal.show(confirmModal);
  };

  goBack = () => {
    const { router } = this.context;
    router.goBack();
  }

  onEdit = () => {
    const { subitemData } = this.state;
    const { router } = this.context;
    const { id: itemId } = subitemData;

    router.push(`/forrisco/policy/subitem/${itemId}/edit`);
  };

  renderTopContent() {
    const { hasForriscoManagePolicyPermission } = this.context;
    const { subitemData } = this.state;
    const { name: itemName } = subitemData;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={itemName} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePolicyPermission && (
              <SecondaryIconButton
                title={Messages.get('label.deleteSubitem')}
                icon="trash"
                style={{ marginRight: '10px' }}
                onClick={this.onHandleRenderDeleteModal}
              />
            )
          }
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const { subitemData } = this.state;
    const { name, fields } = subitemData;
    const { hasForriscoManagePolicyPermission } = this.context;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.subitem') }]}
        >
          <ItemInformation
            itemName={name}
            fields={fields}
            onEdit={this.onEdit}
            hasPermission={hasForriscoManagePolicyPermission}
          />
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { subitemData } = this.state;


    if (!subitemData) {
      return <LoadingGauge />;
    }

    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    );
  }
}

PolicySubitemInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

PolicySubitemInformation.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default PolicySubitemInformation;
