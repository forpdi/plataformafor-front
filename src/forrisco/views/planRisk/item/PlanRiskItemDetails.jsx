import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';

class PlanRiskItemDetails extends React.Component {
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
    const { itemId, planRiskId } = params;

    PlanRiskItemStore.on('detailItem', ({ data }) => {
      this.setState({
        itemData: data,
      });
    }, this);

    PlanRiskItemStore.on('deletePlanRiskItem', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.item.delete'));
      router.push(`forrisco/plan-risk/${planRiskId}/itens`);
    }, this);

    PlanRiskItemStore.on('retrieveSubitems', ({ data }) => {
      this.setState({ subitemsData: data });
    }, this);

    PlanRiskItemStore.on('deletePlanRiskSubItem', ({ data }) => {
      const { id: deletedSubitemId } = data;
      const { subitemsData } = this.state;
      const updatedSubitems = subitemsData.filter(subitem => subitem.id !== deletedSubitemId);

      this.setState({ subitemsData: updatedSubitems });
      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
    }, this);

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DETAIL_ITEM,
      data: { id: itemId },
    });

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_GET_SUBITEMS,
      data: { id: itemId },
    });
  }

  componentWillUnmount() {
    PlanRiskItemStore.off(null, null, this);
  }

  deleteItem = (itemId) => {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DELETE_ITEM,
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

    const { planRiskId } = params;
    router.push(`forrisco/plan-risk/${planRiskId}/itens`);
  }

  onEdit = () => {
    const { itemData } = this.state;
    const { router } = this.context;
    const { id: itemId } = itemData;

    router.push(`/forrisco/plan-risk/item/${itemId}/edit`);
  };

  renderTopContent() {
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { itemData } = this.state;
    const { name: itemName } = itemData;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={itemName} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePlanRiskPermission && (
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
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { children, params } = this.props;
    const { itemData, subitemsData } = this.state;
    const { planRiskId } = params;
    const { id: itemId, fields, name } = itemData;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[
            { label: Messages.get('label.item'), to: `forrisco/plan-risk/${planRiskId}/item/${itemId}/info` },
            { label: Messages.get('label.subitems'), to: `forrisco/plan-risk/${planRiskId}/item/${itemId}/subitems` },
          ]}
        >
          {React.cloneElement(
            children,
            {
              onEdit: this.onEdit,
              itemName: name,
              fields,
              subitemsData,
              hasPermission: hasForriscoManagePlanRiskPermission,
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

PlanRiskItemDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskItemDetails.propTypes = {
  params: PropTypes.shape({}).isRequired,
  children: PropTypes.node,
};

PlanRiskItemDetails.defaultProps = {
  children: null,
};

export default PlanRiskItemDetails;
