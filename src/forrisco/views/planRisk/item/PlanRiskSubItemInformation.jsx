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
import PlanRiskItemStore from 'forpdi/src/forrisco/stores/PlanRiskItem';

class PlanRiskSubItemInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subitemData: null,
    };
  }

  componentDidMount() {
    const { toastr, router } = this.context;
    const { params } = this.props;
    const { subItemId, planRiskId, itemId } = params;

    PlanRiskItemStore.on('detailSubItem', ({ data }) => {
      this.setState({ subitemData: data });
    }, this);

    PlanRiskItemStore.on('deletePlanRiskSubItem', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.subitem.delete'));
      router.push(`forrisco/plan-risk/${planRiskId}/item/${itemId}/subitems`);
    }, this);

    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DETAIL_SUBITEM,
      data: { id: subItemId },
    });
  }

  componentWillUnmount() {
    PlanRiskItemStore.off(null, null, this);
  }

  deleteSubItem = (subItemId) => {
    PlanRiskItemStore.dispatch({
      action: PlanRiskItemStore.ACTION_DELETE_SUBITEM,
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

    router.push(`/forrisco/plan-risk/subitem/${itemId}/edit`);
  };

  renderTopContent() {
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { subitemData } = this.state;
    const { name: itemName } = subitemData;

    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={itemName} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePlanRiskPermission && (
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
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { subitemData } = this.state;
    const { name, fields } = subitemData;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.subitem') }]}
        >
          <ItemInformation
            itemName={name}
            fields={fields}
            onEdit={this.onEdit}
            hasPermission={hasForriscoManagePlanRiskPermission}
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

PlanRiskSubItemInformation.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskSubItemInformation.propTypes = {
  params: PropTypes.shape({}).isRequired,
};

export default PlanRiskSubItemInformation;
