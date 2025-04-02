import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';

class PlanRiskDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planRiskData: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { planRiskId } = params;
    const { toastr, router } = this.context;

    PlanRiskStore.on('retrivedplanrisk', ({ data }) => {
      this.setState({
        planRiskData: data,
      });
    }, this);

    PlanRiskStore.on('deletePlanRisk', () => {
      toastr.addAlertSuccess(Messages.get('label.success.planDeleted'));
      router.push('forrisco/plan-risk');
    }, this);

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_RETRIEVE_PLANRISK,
      data: planRiskId,
    });
  }

  componentWillUnmount() {
    PlanRiskStore.off(null, null, this);
  }

  goBack = () => {
    const { router } = this.context;
    router.push('/forrisco/plan-risk');
  }

  deletePlan(planId) {
    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_DELETE_PLANRISK,
      data: planId,
    });
  }

  onHandleRenderDeleteModal = () => {
    const { planRiskData } = this.state;

    const modalText = Messages.get('label.deletePlanRiskConfirmation');
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deletePlan(planRiskData.id)}
      />
    );
    Modal.show(confirmModal);
  };

  onHandleClonePlan = () => {
    const { router } = this.context;
    const { planRiskData } = this.state;
    router.push(`forrisco/plan-risk/clone/${planRiskData.id}`);
  };

  renderTopContent() {
    const { hasForriscoManagePlanRiskPermission } = this.context;
    const { planRiskData } = this.state;
    const { name } = planRiskData;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePlanRiskPermission && (
              <span style={{
                display: 'flex',
                gap: '10px',
                marginRight: '10px',
              }}
              >
                <SecondaryIconButton
                  title={Messages.get('label.duplicatePlan')}
                  icon="clone"
                  onClick={this.onHandleClonePlan}
                />
                <SecondaryIconButton
                  title={Messages.get('label.deletePlan')}
                  icon="trash"
                  onClick={this.onHandleRenderDeleteModal}
                />
              </span>
            )
          }
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const { children, params } = this.props;
    const { planRiskId } = params;
    const { planRiskData } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.generalInfo'), to: `/forrisco/plan-risk/${planRiskId}/info` },
            { label: Messages.get('label.items'), to: `/forrisco/plan-risk/${planRiskId}/itens` },
            { label: Messages.get('label.units'), to: `/forrisco/plan-risk/${planRiskId}/units` }]}
        >
          {React.cloneElement(children, { planRiskData })}
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { planRiskData } = this.state;

    return planRiskData ? (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    ) : <LoadingGauge />;
  }
}

PlanRiskDetail.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePlanRiskPermission: PropTypes.bool.isRequired,
};

PlanRiskDetail.propTypes = {
  params: PropTypes.shape({
    planRiskId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

PlanRiskDetail.defaultProps = {
  children: null,
};

export default PlanRiskDetail;
