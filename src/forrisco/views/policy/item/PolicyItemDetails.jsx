import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import ItemStore from 'forpdi/src/forrisco/stores/Item';

class PolicyItemDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      itemData: null,
      subitemsData: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { toastr, router } = this.context;
    const { itemId, policyId } = params;

    ItemStore.on('retrieveItem', ({ attributes }) => {
      this.setState({
        itemData: attributes,
      });
    }, this);

    ItemStore.on('itemDeleted', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.item.delete'));
      router.push(`forrisco/policy/${policyId}/item/overview`);
    });

    ItemStore.on('retrieveSubitems', ({ data }) => {
      this.setState({ subitemsData: data });
    }, this);

    ItemStore.on('subitemDeleted', ({ data }) => {
      const { id: deletedSubitemId } = data;
      const { subitemsData } = this.state;
      const updatedSubitems = _.filter(subitemsData, subitem => subitem.id !== deletedSubitemId);

      this.setState({ subitemsData: updatedSubitems });
      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
    }, this);

    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_ITEM,
      data: itemId,
    });

    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_SUBITEMS,
      data: itemId,
    });
  }

  componentWillUnmount() {
    ItemStore.off(null, null, this);
  }

  deleteItem = (itemId) => {
    ItemStore.dispatch({
      action: ItemStore.ACTION_DELETE,
      data: itemId,
    });
  }

  onHandleRenderDeleteModal = () => {
    const { params } = this.props;
    const { itemId } = params;

    const modalText = Messages.get('label.deleteItemConfirmation');
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deleteItem(itemId)}
      />
    );
    Modal.show(confirmModal);
  };

  goBack = () => {
    const { router } = this.context;
    const { params } = this.props;

    const { policyId } = params;
    router.push(`forrisco/policy/${policyId}/item/overview`);
  }

  onEdit = () => {
    const { itemData } = this.state;
    const { router } = this.context;
    const { id: itemId } = itemData;

    router.push(`/forrisco/policy/item/${itemId}/edit`);
  };

  renderTopContent() {
    const { hasForriscoManagePolicyPermission } = this.context;
    const { itemData } = this.state;
    const { name: itemName } = itemData;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={itemName} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePolicyPermission && (
              <SecondaryIconButton
                title={Messages.get('label.deleteItem')}
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
    const { hasForriscoManagePolicyPermission } = this.context;
    const { children, params } = this.props;
    const { itemData, subitemsData } = this.state;
    const { policyId } = params;
    const { id: itemId, fields, name } = itemData;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[
            { label: Messages.get('label.item'), to: `forrisco/policy/${policyId}/item/${itemId}/info` },
            { label: Messages.get('label.subitems'), to: `forrisco/policy/${policyId}/item/${itemId}/subitems` },
          ]}
        >
          {React.cloneElement(
            children,
            {
              onEdit: this.onEdit,
              itemName: name,
              fields,
              subitemsData,
              hasPermission: hasForriscoManagePolicyPermission,
            },
          )}
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { itemData, subitemsData } = this.state;

    if (!itemData || !subitemsData) {
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

PolicyItemDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

PolicyItemDetails.propTypes = {
  params: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
};

PolicyItemDetails.defaultProps = {
  children: null,
};

export default PolicyItemDetails;
