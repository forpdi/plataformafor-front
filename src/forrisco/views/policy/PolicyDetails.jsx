import React from 'react';
import PropTypes from 'prop-types';

import PageHeader from 'forpdi/src/components/PageHeader';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import SecondaryIconButton from 'forpdi/src/components/buttons/SecondaryIconButton';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import Messages from 'forpdi/src/Messages';
import ItemStore from 'forpdi/src/forrisco/stores/Item';
import { exportItemsReport } from 'forpdi/src/forrisco/helpers/exportReportHelper';

class PolicyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policyData: null,
      riskLevels: null,
      items: null,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { policyId } = params;
    const { toastr, router } = this.context;

    PolicyStore.on('retrieverisklevel', ({ data: riskLevels }) => {
      this.setState({
        riskLevels,
      });
    }, this);

    PolicyStore.on('findpolicy', (response) => {
      const { data } = response;
      this.setState({
        policyData: data,
      });
    }, this);

    PolicyStore.on('policyDeleted', () => {
      toastr.addAlertSuccess(Messages.get('label.notification.policy.delete'));
      router.push('forrisco/policy');
    }, this);

    ItemStore.on('retrieveItems', ({ data }) => {
      this.setState({
        items: data,
      });
    }, this);

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_FIND_POLICY,
      data: policyId,
    });

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_RETRIEVE_RISK_LEVEL,
      data: policyId,
    });

    ItemStore.dispatch({
      action: ItemStore.ACTION_RETRIEVE_ITEMS,
      data: policyId,
    });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
    ItemStore.off(null, null, this);
  }

  goBack = () => {
    const { router } = this.context;
    router.push('/forrisco/policy');
  }

  deletePolicy(policyId) {
    PolicyStore.dispatch({
      action: PolicyStore.ACTION_DELETE,
      data: policyId,
    });
  }

  onItemsChange = (items) => {
    this.setState({ items });
  }

  onHandleRenderDeleteModal = () => {
    const { policyData } = this.state;
    const { id } = policyData;

    const modalText = Messages.get('label.deletePolicyConfirmation');
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={() => this.deletePolicy(id)}
      />
    );
    Modal.show(confirmModal);
  };

  onHandleEdit = () => {
    const { router } = this.context;
    const { policyData } = this.state;
    const { id } = policyData;
    router.push(`forrisco/policy/edit/${id}`);
  };

  showExportReportModal = () => {
    const { params } = this.props;
    const { policyId } = params;
    const { items } = this.state;

    exportItemsReport(items, `${PolicyStore.url}/exportReport?policyId=${policyId}`);
  }

  renderTopContent() {
    const { hasForriscoManagePolicyPermission } = this.context;
    const { policyData } = this.state;
    const { name, hasLinkedPlans } = policyData;
    return (
      <AppContainer.TopContent>
        <PageHeader pageTitle={name} goBack={this.goBack} />
        <AppContainer.Column>
          {
            hasForriscoManagePolicyPermission && (
              <span>
                { !hasLinkedPlans
                  && (
                    <SecondaryIconButton
                      title={Messages.get('label.editPolicy')}
                      icon="pen"
                      style={{ marginRight: '10px' }}
                      onClick={this.onHandleEdit}
                    />
                  )
                }
                <SecondaryIconButton
                  title={Messages.get('label.deletePolicy')}
                  icon="trash"
                  style={{ marginRight: '10px' }}
                  onClick={this.onHandleRenderDeleteModal}
                />
              </span>

            )
          }
          <PrimaryButton
            title={Messages.get('label.exportReport')}
            text={Messages.get('label.exportReport')}
            onClick={this.showExportReportModal}
          />
        </AppContainer.Column>
      </AppContainer.TopContent>
    );
  }

  renderMainContent() {
    const { children, params } = this.props;
    const { policyId } = params;
    const { policyData, riskLevels, items } = this.state;

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[
            { label: Messages.get('label.generalInfo'), to: `/forrisco/policy/${policyId}/info` },
            { label: Messages.get('label.structure'), to: `/forrisco/policy/${policyId}/item/overview` },
          ]}
        >
          {
            React.cloneElement(
              children,
              {
                policyData,
                riskLevels,
                items,
                onItemsChange: this.onItemsChange,
              },
            )
          }
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const { policyData, riskLevels } = this.state;

    return policyData && riskLevels ? (
      <AppContainer.Content>
        {this.renderTopContent()}
        {this.renderMainContent()}
      </AppContainer.Content>
    ) : <LoadingGauge />;
  }
}

PolicyDetails.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
  hasForriscoManagePolicyPermission: PropTypes.bool.isRequired,
};

PolicyDetails.propTypes = {
  params: PropTypes.shape({
    policyId: PropTypes.string.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

PolicyDetails.defaultProps = {
  children: null,
};

export default PolicyDetails;
