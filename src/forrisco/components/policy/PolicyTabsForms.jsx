import React from 'react';
import PropTypes from 'prop-types';

import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PolicyForm from 'forpdi/src/forrisco/components/policy/PolicyForm';
import ProbabilityImpactForm from 'forpdi/src/forrisco/components/policy/ProbabilityImpactForm';
import RiskMatrixForm from 'forpdi/src/forrisco/components/policy/RiskMatrixForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import FormPageTop from 'forpdi/src/components/FormPageTop';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';
import Modal from 'forpdi/src/components/modals/Modal';

import Messages from 'forpdi/src/Messages';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import validationPolicy, { validateProbabiltyAndImpacts } from 'forpdi/src/forrisco/validations/validationPolicy';
import {
  getMatrixDimensions,
  matrixToString,
  createMatrix,
  optionsToString,
  getPIdescriptions,
  formatRiskLevels,
} from 'forpdi/src/forrisco/helpers/policyHelper';


const tabs = getTabs();

function getTabs() {
  const policyFormTab = {
    Component: props => <PolicyForm {...props} />,
    buttonTitle: Messages.get('label.next'),
  };
  const probabilityImpactTab = {
    Component: props => <ProbabilityImpactForm {...props} />,
    buttonTitle: Messages.get('label.generateMatrix'),
  };
  const matrixTab = {
    Component: props => <RiskMatrixForm {...props} />,
    buttonTitle: Messages.get('label.save'),
  };

  policyFormTab.nextTab = probabilityImpactTab;
  probabilityImpactTab.nextTab = matrixTab;

  return {
    policyFormTab, probabilityImpactTab, matrixTab,
  };
}

class PolicyTabsForms extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errors: {},
      activeTab: tabs.policyFormTab,
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    PolicyStore.on('fail', this.setState({ waitingSubmit: false }));
  }

  onChangeHandler = (policy) => {
    const { onChange } = this.props;
    onChange(policy);
  }

  onButtonClick = () => {
    const { activeTab } = this.state;

    if (activeTab === tabs.policyFormTab) {
      this.setActiveTab(activeTab.nextTab);
    } else if (activeTab === tabs.probabilityImpactTab) {
      this.generateMatrix();
    } else if (activeTab === tabs.matrixTab) {
      this.submit();
    } else {
      throw Error('Unexpected tab', activeTab);
    }
  }

  setActiveTab = (activeTab) => {
    this.setState({ activeTab });
  }

  generateMatrix() {
    const { policy } = this.props;
    const {
      hasErrors,
      errors,
    } = validateProbabiltyAndImpacts(policy);

    this.setState({ errors });

    if (hasErrors) {
      const { toastr } = this.context;
      toastr.addAlertError(Messages.get('label.msg.errorsForm'));
      this.setActiveTab(tabs.probabilityImpactTab);
      return;
    }

    const { matrix } = policy;
    if (matrix) {
      this.showConfirmMatrixGenerationModal();
    } else {
      this.confirmMatrixGeneration();
    }
  }

  showConfirmMatrixGenerationModal() {
    const confirmModal = (
      <ConfirmModal
        text={Messages.get('label.msg.replaceMatrix')}
        onConfirm={this.confirmMatrixGeneration}
      />
    );
    Modal.show(confirmModal);
  }

  confirmMatrixGeneration = () => {
    const { policy, onChange } = this.props;
    const { probabilities, impacts } = policy;
    const matrix = createMatrix(probabilities, impacts);

    onChange({ ...policy, matrix }, () => this.setActiveTab(tabs.matrixTab));
  }

  submit() {
    const { policy } = this.props;
    const { submit: handleSubmit } = this.props;

    const {
      errors,
      hasNewPolicyFormErrors,
      hasPropbabilityImpactErrors,
      hasMatrixErrors,
    } = validationPolicy(policy);

    const hasErrors = hasNewPolicyFormErrors || hasPropbabilityImpactErrors || hasMatrixErrors;

    this.setState({
      errors,
      waitingSubmit: !hasErrors,
    });

    if (hasNewPolicyFormErrors) {
      this.setActiveTab(tabs.policyFormTab);
    } else if (hasPropbabilityImpactErrors) {
      this.setActiveTab(tabs.probabilityImpactTab);
    } else if (hasMatrixErrors) {
      this.setActiveTab(tabs.matrixTab);
    }

    if (hasErrors) {
      const { toastr } = this.context;
      toastr.addAlertError(Messages.get('label.msg.errorsForm'));
      return;
    }

    const data = this.getData();
    handleSubmit(data);
  }

  getData() {
    const { policy } = this.props;
    const {
      matrix,
      probabilities,
      impacts,
      riskLevels,
    } = policy;
    const { nRows, nCols } = getMatrixDimensions(probabilities, impacts);

    return {
      ...policy,
      matrix: matrixToString(matrix),
      impact: optionsToString(impacts),
      probability: optionsToString(probabilities),
      PIDescriptions: getPIdescriptions(probabilities, impacts),
      nline: nRows,
      ncolumn: nCols,
      risk_level: formatRiskLevels(riskLevels),
    };
  }

  matrixTabIsDisabled() {
    const { policy } = this.props;
    const { matrix } = policy;

    return !matrix;
  }

  renderTabContent() {
    const { policy } = this.props;
    const { activeTab, errors } = this.state;
    const { Component } = activeTab;

    return <Component policy={policy} errors={errors} onChange={this.onChangeHandler} />;
  }

  renderTopContent() {
    const { waitingSubmit, activeTab } = this.state;
    const { buttonTitle } = activeTab;
    const { isEdit } = this.props;

    return (
      <FormPageTop
        label={Messages.get(isEdit ? 'label.editPolicy' : 'label.newPolicy')}
        onSubmit={this.onButtonClick}
        waitingSubmit={waitingSubmit}
        primaryButtonText={buttonTitle}
      />
    );
  }

  renderMainContent() {
    const { isEdit } = this.props;
    const tabbedPanelTabs = [
      this.createTab(isEdit ? 'label.editPolicy' : 'label.newPolicy', tabs.policyFormTab),
      this.createTab('label.probabilityAndImpact', tabs.probabilityImpactTab),
      this.createTab('label.risksMatrix', tabs.matrixTab, this.matrixTabIsDisabled()),
    ];

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={tabbedPanelTabs}
          topContainerContent={{ title: Messages.get('label.generalInfo') }}
        >
          <TabbedPanel.MainContainer>
            {this.renderTabContent()}
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  createTab(messageKey, tab, isDisabled) {
    const { activeTab } = this.state;

    return {
      label: Messages.get(messageKey),
      onClick: () => this.setActiveTab(tab),
      isActive: activeTab === tab,
      isDisabled,
    };
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

PolicyTabsForms.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

PolicyTabsForms.propTypes = {
  policy: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  isEdit: PropTypes.bool,
  submit: PropTypes.func.isRequired,
};

PolicyTabsForms.defaultProps = {
  isEdit: false,
};

export default PolicyTabsForms;
