import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import RiskForm from 'forpdi/src/forrisco/components/risk/RiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import MultiSelectCheckBoxes from 'forpdi/src/components/inputs/MultiSelectCheckBoxes';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import validationReplicateRisk from 'forpdi/src/forrisco/validations/validationReplicateRisk';
import { riskToData } from 'forpdi/src/forrisco/helpers/riskHelper';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

class ReplicateRisk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      planRisks: null,
      selectedPlanRisk: undefined,
      units: null,
      selectedUnits: [],
      risk: null,
      unit: null,
      errors: {},
      waitingSubmit: false,
    };
  }

  componentDidMount() {
    const { params } = this.props;
    const { router, toastr } = this.context;
    const { riskId } = params;

    RiskStore.on('findRisk', (response) => {
      const { data } = response;
      const { unit } = data;

      this.setState({
        risk: {
          ...data,
          userId: undefined,
          managerId: undefined,
          probability: '',
          impact: '',
          periodicity: '',
          type: '',
          checkedTypologies: [],
          otherTypologies: '',
          response: undefined,
          level: undefined,
          sharedUnits: [],
        },
        unit,
      });
    }, this);

    RiskStore.on('riskreplicated', () => {
      const { unit } = this.state;
      const { id } = unit;

      toastr.addAlertSuccess(Messages.get('label.replicationSuccess'));
      router.push(`/forrisco/unit/${id}/risks`);
    }, this);

    PlanRiskStore.on('listedunarchivedplanrisk', ({ data }) => {
      this.setState({ planRisks: data });
    }, this);

    UnitStore.on('unitbyplan', ({ data }) => {
      this.setState({ units: data });
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_RISK,
      data: riskId,
    });

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_FIND_UNARCHIVED,
    });
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
  }

  onPlanRiskChange = (e) => {
    const { planRisks, risk } = this.state;
    const { value } = e.target;
    const selectedPlanRisk = _.find(planRisks, ({ id }) => id === parseInt(value, 10));
    this.setState({
      selectedPlanRisk,
      selectedUnits: [],
      units: null,
      risk: {
        ...risk,
        probability: '',
        impact: '',
      },
    });
    UnitStore.dispatch({
      action: UnitStore.ACTION_FIND_BY_PLAN,
      data: value,
    });
  }

  onUnitsChange = (values) => {
    this.setState({
      selectedUnits: values,
    });
  }

  onChangeHandler = (risk) => {
    this.setState({ risk });
  }

  onSubmit = () => {
    const { risk, selectedPlanRisk, selectedUnits } = this.state;

    const onSuccess = this.showConfirmModal;

    validationReplicateRisk({ risk, selectedPlanRisk, selectedUnits }, onSuccess, this);
  }

  showConfirmModal = () => {
    const { waitingSubmit, risk, selectedUnits } = this.state;
    const { name } = risk;
    const unitNames = _.map(selectedUnits, unit => unit.name).join(', ');

    const modalText = `O risco ${name} será replicado para a(s) seguinte(s) unidade(s): ${cutPhrase(unitNames, 500)}. Para que o cadastro fique completo, será necessário atualizar os dados de vinculação pontualmente no risco replicado.`;
    this.setState({ waitingSubmit: false });
    const onConfirm = () => {
      if (!waitingSubmit) {
        this.setState({ waitingSubmit: true }, this.replicate);
      }
    };
    const confirmModal = (
      <ConfirmModal
        text={modalText}
        onConfirm={onConfirm}
      />
    );
    Modal.show(confirmModal);
  };

  replicate = () => {
    const { risk, selectedUnits } = this.state;
    const targetUnitIds = _.map(selectedUnits, ({ id }) => id);
    RiskStore.dispatch({
      action: RiskStore.ACTION_REPLICATE_RISK,
      data: { risk: riskToData(risk), targetUnitIds },
    });
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.replicateRisk')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
      />
    );
  }

  renderPlanrisks() {
    const { planRisks, selectedPlanRisk, errors } = this.state;

    return (
      <SelectBox
        options={planRisks}
        label={Messages.get('label.selectPlanRisk')}
        value={selectedPlanRisk ? selectedPlanRisk.id : undefined}
        errorMsg={errors.selectedPlanRisk}
        onChange={this.onPlanRiskChange}
        showChooseOption
        required
      />
    );
  }

  renderUnits() {
    const {
      selectedPlanRisk,
      units,
      selectedUnits,
      errors,
    } = this.state;

    if (!selectedPlanRisk) {
      return null;
    }
    return units ? (
      <MultiSelectCheckBoxes
        placeholderButtonLabel={Messages.get('label.selectUniOrSubunit')}
        options={units}
        value={selectedUnits}
        onChange={this.onUnitsChange}
        label={Messages.get('label.planRiskUnits')}
        errorMsg={errors.selectedUnits}
        cutOptions
        required
      />
    ) : <LoadingGauge size="50px" />;
  }

  renderMainContent() {
    const {
      selectedPlanRisk,
      risk,
      errors,
      unit,
    } = this.state;

    const { policy } = selectedPlanRisk || {};

    return (
      <AppContainer.MainContent>
        <TabbedPanel
          tabs={[{ label: Messages.get('label.risk') }]}
          topContainerContent={{
            title: Messages.get('label.risk'),
            tag: `${unit.abbreviation} - ${unit.name}`,
          }}
        >
          <TabbedPanel.MainContainer>
            <InputContainer className="row input-container__with-margin-bottom">
              <div className="col col-sm-6">
                {this.renderPlanrisks()}
              </div>
              <div className="col col-sm-6">
                {this.renderUnits()}
              </div>
            </InputContainer>
            <RiskForm
              errors={errors}
              risk={risk}
              policy={policy || {}}
              planRisk={selectedPlanRisk}
              onChange={this.onChangeHandler}
              linksDisabled
            />
          </TabbedPanel.MainContainer>
        </TabbedPanel>
      </AppContainer.MainContent>
    );
  }

  render() {
    const {
      risk,
    } = this.state;

    if (!risk) {
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

ReplicateRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

ReplicateRisk.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }),
  location: PropTypes.shape({}).isRequired,
};

ReplicateRisk.defaultProps = {
  params: {},
};

export default ReplicateRisk;
