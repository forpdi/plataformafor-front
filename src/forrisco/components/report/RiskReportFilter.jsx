import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import TertiaryButton from 'forpdi/src/components/buttons/TertiaryButton';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import TextField from 'forpdi/src/components/inputs/TextField';
import MultiSelectCheckBoxes from 'forpdi/src/components/inputs/MultiSelectCheckBoxes';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import SystemInfo from 'forpdi/src/components/SystemInfo';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Messages from 'forpdi/src/Messages';
import riskType from 'forpdi/src/forrisco/enums/riskType';
import typologiesEnum from 'forpdi/src/forrisco/enums/typologies';
import riskResponseEnum from 'forpdi/src/forrisco/enums/riskResponse';
import riskLevel from 'forpdi/src/forrisco/enums/riskLevel';
import { getDateStrAsDateTimeStr } from 'forpdi/src/utils/dateUtil';

const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };
const uninformedOption = { name: Messages.get('label.uninformed'), id: -1 };

const initialFilters = {
  selectedUnits: [],
  selectedSubunits: [],
  nameOrCode: '',
  type: viewAllOption.name,
  typologies: [],
  responses: [],
  levels: [],
  startCreation: null,
  endCreation: null,
};

class RiskReportFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policies: null,
      selectedPolicyId: undefined,
      planRisks: null,
      selectedPlanRiskId: undefined,
      units: [],
      subunits: [],
      ...initialFilters,
    };
  }

  componentDidMount() {
    PolicyStore.on('list-to-select', ({ data }) => {
      this.setState({ policies: data.list });
    }, this);

    PlanRiskStore.on('list-to-select', ({ data }) => {
      this.setState({ planRisks: data.list });
    }, this);

    UnitStore.on('listToSelect', ({ data }) => {
      const units = _.filter(data.list, ({ parentId }) => !parentId);
      const subunits = _.filter(data.list, ({ parentId }) => !!parentId);

      this.setState({
        units,
        subunits,
        selectedUnits: units,
        selectedSubunits: subunits,
      });
    });

    PolicyStore.dispatch({
      action: PolicyStore.ACTION_LIST_TO_SELECT,
    });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  onPolicyChange = (e) => {
    const selectedPolicyId = parseInt(e.target.value, 10);
    this.setState({
      selectedPolicyId,
      selectedPlanRiskId: undefined,
      selectedUnits: [],
      selectedSubunits: [],
    });
    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
      data: { policyId: selectedPolicyId },
    });
  }

  onPlanRiskChange = (e) => {
    const selectedPlanRiskId = parseInt(e.target.value, 10);
    this.setState({
      selectedPlanRiskId,
      selectedUnits: [],
      selectedSubunits: [],
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_TO_SELECT,
      data: { planRiskId: selectedPlanRiskId },
    });
  }

  onTextHandler = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  onSelectChange = (e) => {
    const { value } = e.target;
    this.setState({ type: value });
  }

  onMultiselectChange = (values, name) => {
    this.setState({ [name]: values });
  }

  onCreationDateChange = (startCreation, endCreation) => {
    this.setState({
      startCreation,
      endCreation,
    });
  }

  onClean = () => {
    this.setState({
      ...initialFilters,
      selectedPolicyId: undefined,
      selectedPlanRiskId: undefined,
      units: [],
      subunits: [],
    });
  }

  onHandleFilter = () => {
    const {
      selectedPlanRiskId,
      units,
      selectedUnits,
      subunits,
      selectedSubunits,
      nameOrCode,
      type,
      typologies,
      responses,
      levels,
      startCreation,
      endCreation,
    } = this.state;
    const { onFilter } = this.props;

    const selectedUnitsAndSubunitsIsEmpty = selectedUnits.length === 0 && selectedSubunits.length === 0;

    function getSelectedUnitOrSubunitIds(items, selectedItems) {
      return selectedUnitsAndSubunitsIsEmpty
        ? _.map(items, ({ id }) => id)
        : _.map(selectedItems, ({ id }) => id);
    }

    const selectedUnitIds = getSelectedUnitOrSubunitIds(units, selectedUnits);
    const selectedSubunitIds = getSelectedUnitOrSubunitIds(subunits, selectedSubunits);

    const filters = {
      nameOrCode,
      type: type !== viewAllOption.name ? type : null,
      typologies: _.map(typologies, ({ value }) => value),
      responses: responses.map(response => response.id),
      levels: levels.map(level => level.id),
      startCreation: getDateStrAsDateTimeStr(startCreation),
      endCreation: getDateStrAsDateTimeStr(endCreation, false),
    };

    onFilter(selectedPlanRiskId, selectedUnitIds, selectedSubunitIds, filters);
  }

  hasPlanRiskSelected() {
    const { selectedPlanRiskId } = this.state;

    return !!selectedPlanRiskId;
  }

  renderPolicyAndPlanRiskSelects() {
    const {
      policies,
      selectedPolicyId,
      planRisks,
      selectedPlanRiskId,
    } = this.state;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={policies}
            label={Messages.get('label.linkedPolicy')}
            value={selectedPolicyId}
            onChange={this.onPolicyChange}
            optionValueName="id"
            showChooseOption
            required
          />
        </div>
        <div className="col col-sm-6">
          <SelectBox
            options={planRisks}
            label={Messages.get('label.risk.managementPlan')}
            value={selectedPlanRiskId}
            onChange={this.onPlanRiskChange}
            optionValueName="id"
            showChooseOption
            required
          />
        </div>
      </InputContainer>
    );
  }

  renderFilterFields() {
    const {
      units,
      selectedUnits,
      subunits,
      selectedSubunits,
      nameOrCode,
      type,
      typologies,
      responses,
      levels,
      startCreation,
      endCreation,
    } = this.state;

    return (
      <div>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <TextField
              name="nameOrCode"
              label={Messages.get('label.riskNameOrCode')}
              onChange={this.onTextHandler}
              value={nameOrCode}
              maxLength={100}
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              name="type"
              options={[viewAllOption, ...riskType.list]}
              label={Messages.get('label.riskType')}
              value={type}
              onChange={this.onSelectChange}
              optionValueName="name"
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <MultiSelectCheckBoxes
              name="typologies"
              label={Messages.get('label.typology')}
              placeholderButtonLabel={Messages.get('label.select')}
              options={typologiesEnum.list}
              optionValueName="value"
              optionLabelName="label"
              value={typologies}
              onChange={this.onMultiselectChange}
              hideSearchField
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
          <div className="col col-sm-6">
            <MultiSelectCheckBoxes
              name="responses"
              label={Messages.get('label.riskResponse')}
              placeholderButtonLabel={Messages.get('label.select')}
              options={[uninformedOption, ...riskResponseEnum.list]}
              value={responses}
              onChange={this.onMultiselectChange}
              hideSearchField
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
        </InputContainer>

        <InputContainer className="row">
          <div className="col col-sm-6">
            <MultiSelectWithSelectAll
              name="selectedUnits"
              label={Messages.get('label.unitys')}
              onChange={this.onMultiselectChange}
              options={units}
              placeholderButtonLabel={Messages.get('label.select')}
              selectedOptions={selectedUnits}
              hideSearchField
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
          <div className="col col-sm-6">
            <MultiSelectWithSelectAll
              name="selectedSubunits"
              label={Messages.get('label.subunitys')}
              onChange={this.onMultiselectChange}
              options={subunits}
              placeholderButtonLabel={Messages.get('label.select')}
              selectedOptions={selectedSubunits}
              hideSearchField
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <MultiSelectCheckBoxes
              name="levels"
              label={Messages.get('label.organizationalLevel')}
              placeholderButtonLabel={Messages.get('label.select')}
              options={[uninformedOption, ...riskLevel.list]}
              value={levels}
              onChange={this.onMultiselectChange}
              hideSearchField
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
          <div className="col col-sm-6">
            <DatePickerRange
              beginValue={startCreation}
              endValue={endCreation}
              label={Messages.get('label.creationDate')}
              onChange={this.onCreationDateChange}
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
        </InputContainer>
      </div>
    );
  }

  renderButtons() {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
        <TertiaryButton
          title={Messages.get('label.clean')}
          text={Messages.get('label.clean')}
          onClick={this.onClean}
          style={{ marginRight: '1rem', width: '134px' }}
        />
        <PrimaryButton
          title={Messages.get('label.research')}
          text={Messages.get('label.research')}
          onClick={this.onHandleFilter}
          disabled={!this.hasPlanRiskSelected()}
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <SystemInfo> Selecione uma Política e um Plano de Gestão de Riscos para iniciar, em seguida selecione os filtros desejados para montagem do relatório.</SystemInfo>

        {this.renderPolicyAndPlanRiskSelects()}

        {this.renderFilterFields()}

        {this.renderButtons()}
      </div>
    );
  }
}

RiskReportFilter.propTypes = {
  onFilter: PropTypes.func.isRequired,
};

export default RiskReportFilter;
