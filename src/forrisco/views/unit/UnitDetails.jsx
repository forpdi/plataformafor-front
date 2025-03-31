import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';

class UnitDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      unitData: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { unitId } = params;
    const { toastr, router } = this.context;

    UnitStore.on('unitRetrieved', ({ data }) => {
      this.setState({
        unitData: data,
      });
    }, this);

    UnitStore.on('unitDeleted', () => {
      toastr.addAlertSuccess(Messages.get('notification.unit.delete'));
      router.push('/forrisco/unit');
    }, this);

    UnitStore.on('subunitDeleted', () => {
      const { unitData } = this.state;
      const { parent } = unitData;
      toastr.addAlertSuccess(Messages.get('notification.subunit.delete'));
      router.push(`/forrisco/unit/${parent.id}/subunits`);
    }, this);

    UnitStore.dispatch({
      action: UnitStore.ACTION_RETRIEVE_UNIT,
      data: unitId,
    });
  }

  goBack = () => {
    const { router } = this.context;

    if (this.isSubUnitDetails()) {
      const { unitData } = this.state;
      const { parent } = unitData;

      router.push(`/forrisco/unit/${parent.id}/subunits`);
    } else {
      router.push('/forrisco/unit');
    }
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
  }

  isSubUnitDetails() {
    const { unitData } = this.state;
    const { parent } = unitData;
    return !!parent;
  }

  deleteUnit = () => {
    const { unitData } = this.state;
    const { id } = unitData;

    UnitStore.dispatch({
      action: this.isSubUnitDetails()
        ? UnitStore.ACTION_DELETE_SUBUNIT
        : UnitStore.ACTION_DELETE_UNIT,
      data: { id },
    });
  }

  renderTopContent() {
    const { hasForriscoManageUnitPermission } = this.context;
    const { unitData } = this.state;
    const { name } = unitData;

    const onHandleRenderDeleteModal = (data) => {
      const modalText = this.isSubUnitDetails()
        ? Messages.get('label.deleteSubunitConfirmation')
        : Messages.get('label.deleteUnitConfirmation');

      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.deleteUnit(data)}
        />
      );
      Modal.show(confirmModal);
    };

    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManageUnitPermission && (
              <SecondaryIconButton
                title={this.isSubUnitDetails() ? Messages.get('label.deleteSubunit') : Messages.get('label.deleteUnit')}
                icon="trash"
                style={{ marginRight: '10px' }}
                onClick={onHandleRenderDeleteModal}
              />
            )
          }
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const { children, params } = this.props;
    const { unitData } = this.state;
    const { unitId } = params;

    const unitTabs = [
      { label: Messages.get('label.generalInfo'), to: `/forrisco/unit/${unitId}/info` },
      { label: Messages.get('label.subunitys'), to: `/forrisco/unit/${unitId}/subunits` },
      { label: Messages.get('label.processes'), to: `/forrisco/unit/${unitId}/processes` },
      { label: Messages.get('label.risks'), to: `/forrisco/unit/${unitId}/risks` },
    ];

    const subunitTabs = [
      { label: Messages.get('label.generalInfo'), to: `/forrisco/subunit/${unitId}/info` },
      { label: Messages.get('label.risks'), to: `/forrisco/subunit/${unitId}/risks` },
      { label: Messages.get('label.processes'), to: `/forrisco/subunit/${unitId}/processes` },
    ];

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={this.isSubUnitDetails() ? subunitTabs : unitTabs}
        >
          {React.cloneElement(children, { unitData })}
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { unitData } = this.state;

    return unitData ? (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    ) : <LoadingGauge />;
  }
}

UnitDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
};

UnitDetails.propTypes = {
  params: PropTypes.shape({
    unitId: PropTypes.string,
  }).isRequired,
  children: PropTypes.node,
};

UnitDetails.defaultProps = {
  children: null,
};

export default UnitDetails;
