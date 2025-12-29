import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import FormPageTop from 'forpdi/src/components/FormPageTop';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import RiskForm from 'forpdi/src/forrisco/components/risk/RiskForm';
import AppContainer from 'forpdi/src/components/AppContainer';
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import InfoDisplay from 'forpdi/src/components/info/InfoDisplay';
import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import Modal from 'forpdi/src/components/modals/Modal';
import ConfirmModal from 'forpdi/src/components/modals/ConfirmModal';

import Messages from 'forpdi/src/Messages';
import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import validationMoveRisk from 'forpdi/src/forrisco/validations/validationMoveRisk';
import { riskToData, dataToRisk } from 'forpdi/src/forrisco/helpers/riskHelper';
import { cutPhrase } from 'forpdi/src/utils/stringUtil';

class MoveRisk extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policy: null,
      planRisks: null,
      selectedPlanRisk: undefined,
      units: null,
      selectedUnit: undefined,
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

    RiskStore.on('findRisk', ({ data }) => {
      const { unit } = data;
      const { planRisk } = unit;
      const { policy } = planRisk;

      this.setState({
        risk: {
          ...dataToRisk(data),
          checkedStrategies: [],
          checkedAxes: [],
          checkedIndicators: [],
          checkedGoals: [],
          checkedActivities: [],
          checkedObjectives: [],
        },
        unit,
        policy,
      });

      this.findPlanRisks();
    }, this);

    RiskStore.on('riskUpdated', () => {
      const { selectedUnit } = this.state;

      toastr.addAlertSuccess(Messages.get('label.movedSuccess'));
      router.push(`/forrisco/unit/${selectedUnit}/risks`);
    }, this);

    PlanRiskStore.on('list-to-select', ({ data }) => {
      this.setState({ planRisks: data.list });
    }, this);

    UnitStore.on('allunitsbyplan', ({ data }) => {
      this.setState({ units: data });
    }, this);

    RiskStore.on('fail', () => this.setState({ waitingSubmit: false }), this);

    RiskStore.dispatch({
      action: RiskStore.ACTION_FIND_RISK,
      data: riskId,
    });
  }

  componentWillUnmount() {
    UnitStore.off(null, null, this);
    RiskStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
    PolicyStore.off(null, null, this);
  }

  findPlanRisks() {
    const { policy } = this.state;
    const { id } = policy;

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
      data: { policyId: id },
    });
  }

  onPlanRiskChange = (e) => {
    const { planRisks } = this.state;
    const { value } = e.target;
    const selectedPlanRisk = _.find(planRisks, ({ id }) => id === parseInt(value, 10));
    this.setState({
      selectedPlanRisk,
      selectedUnit: null,
      units: null,
    });
    UnitStore.dispatch({
      action: UnitStore.ACTION_FIND_ALL_BY_PLAN,
      data: value,
    });
  }

  onUnitChange = (e) => {
    const { value } = e.target;
    this.setState({
      selectedUnit: value,
    });
  }

  onChangeHandler = (risk) => {
    this.setState({ risk });
  }

  onSubmit = () => {
    const {
      risk,
      selectedPlanRisk,
      selectedUnit,
    } = this.state;

    const onSuccess = this.showConfirmModal;

    validationMoveRisk({
      risk,
      selectedPlanRisk,
      selectedUnit,
    }, onSuccess, this);
  }

  showConfirmModal = () => {
    const {
      waitingSubmit,
      risk,
      selectedUnit,
      units,
    } = this.state;

    const { name } = risk;
    const unit = _.find(units, ({ id }) => id === parseInt(selectedUnit, 10));
    const { name: unitName } = unit;

    const modalText = `O risco ${name} será replicado para a seguinte unidade: ${cutPhrase(unitName, 500)}. Para que o cadastro fique completo, será necessário atualizar os dados de vinculação pontualmente no risco replicado.`;
    this.setState({ waitingSubmit: false });
    const onConfirm = () => {
      if (!waitingSubmit) {
        this.setState({ waitingSubmit: true }, this.move);
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

  move = () => {
    const { risk, selectedUnit } = this.state;
    RiskStore.dispatch({
      action: RiskStore.ACTION_CUSTOM_UPDATE,
      data: {
        ...riskToData(risk),
        unit: { id: selectedUnit },
      },
    });
  }

  renderTopContent() {
    const { waitingSubmit } = this.state;

    return (
      <FormPageTop
        label={Messages.get('label.moveRisk')}
        onSubmit={this.onSubmit}
        waitingSubmit={waitingSubmit}
      />
    );
  }

  renderPlanRisks() {
    const {
      planRisks,
      selectedPlanRisk,
      errors,
    } = this.state;

    return (
      <SelectBox
        options={planRisks}
        label={Messages.get('label.newPlanRisco')}
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
      selectedUnit,
      errors,
    } = this.state;

    if (!selectedPlanRisk) {
      return null;
    }
    return units ? (
      <SelectBox
        options={units}
        label={Messages.get('label.moveRiskUnits')}
        value={selectedUnit || undefined}
        errorMsg={errors.selectedUnit}
        onChange={this.onUnitChange}
        showChooseOption
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
      policy,
    } = this.state;

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
                <InfoDisplay label={Messages.get('label.risk.policy')} info={policy.name} />
              </div>
              <div className="col col-sm-6">
                {this.renderPlanRisks()}
              </div>
            </InputContainer>
            <InputContainer className="row input-container__with-margin-bottom">
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

MoveRisk.contextTypes = {
  router: PropTypes.shape({}).isRequired,
  toastr: PropTypes.shape({}).isRequired,
};

MoveRisk.propTypes = {
  params: PropTypes.shape({
    parentId: PropTypes.string,
  }),
  location: PropTypes.shape({}).isRequired,
};

MoveRisk.defaultProps = {
  params: {},
};

export default MoveRisk;
