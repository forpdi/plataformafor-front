import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import ProcessStore from 'forpdi/src/forrisco/stores/Process';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Text from 'forpdi/src/components/typography/Text';
import ProcessInformation from 'forpdi/src/forrisco/views/process/ProcessInformation';

class ProcessDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      process: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { processId } = params;
    const { router, toastr } = this.context;

    ProcessStore.on('processRetrieved', ({ data }) => {
      this.setState({
        process: data,
      });
    }, this);

    UnitStore.on('unitDeleted', () => {
      toastr.addAlertSuccess(Messages.get('notification.unit.delete'));
      router.push('/forrisco/unit');
    }, this);

    UnitStore.on('subunitDeleted', () => {
      const { process } = this.state;
      const { unitCreator } = process;
      const { parent } = unitCreator;
      toastr.addAlertSuccess(Messages.get('notification.subunit.delete'));
      router.push(`/forrisco/unit/${parent.id}/subunits`);
    }, this);

    ProcessStore.dispatch({
      action: ProcessStore.ACTION_RETRIEVE_PROCESS,
      data: processId,
    });
  }

  componentWillUnmount() {
    ProcessStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  renderRelatedUnits(unit) {
    const { id, name } = unit;
    return (
      <Text key={id}>
        { name }
        <br />
      </Text>
    );
  }

  deleteUnit() {
    const { process } = this.state;
    const { unitCreator } = process;
    const { id } = unitCreator;

    UnitStore.dispatch({
      action: this.isSubUnitDetails()
        ? UnitStore.ACTION_DELETE_SUBUNIT
        : UnitStore.ACTION_DELETE_UNIT,
      data: { id },
    });
  }

  onEdit() {
    const { router } = this.context;
    const { process } = this.state;
    const { unitCreator } = process;
    const { id } = unitCreator;
    router.push(`/forrisco/unit/edit/${id}`);
  }

  isSubUnitDetails() {
    const { process } = this.state;
    const { unitCreator } = process;
    const { parent } = unitCreator;
    return !!parent;
  }

  goBack = () => {
    const { router } = this.context;
    router.goBack();
  }

  renderTopContent() {
    const { hasForriscoManageUnitPermission } = this.context;
    const { process } = this.state;
    const { unitCreator } = process;
    const { name } = unitCreator;

    const onHandleRenderDeleteModal = () => {
      const modalText = Messages.get('label.deleteUnitConfirmation');
      const confirmModal = (
        <ConfirmModal
          text={modalText}
          onConfirm={() => this.deleteUnit()}
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
              <span style={{
                display: 'flex',
                gap: '10px',
                marginRight: '10px',
              }}
              >
                <SecondaryIconButton
                  title={Messages.get('label.editUnit')}
                  icon="pen"
                  onClick={() => this.onEdit()}
                />
                <SecondaryIconButton
                  title={Messages.get('label.deleteUnit')}
                  icon="trash"
                  onClick={onHandleRenderDeleteModal}
                />
              </span>
            )
          }
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  render() {
    const { process } = this.state;

    return (
      process ? (
        <AppContainer.Content>
          {this.renderTopContent()}
          <AppContainer.MainContent>
            <TabbedPanel tabs={[{ label: Messages.get('label.processes') }]}>
              <ProcessInformation process={process} renderRelatedUnits={this.renderRelatedUnits} />
            </TabbedPanel>
          </AppContainer.MainContent>
        </AppContainer.Content>
      )
        : <LoadingGauge />
    );
  }
}

ProcessDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManageUnitPermission: PropTypes.bool.isRequired,
};

ProcessDetails.propTypes = {
  params: PropTypes.shape({
    processId: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProcessDetails;
