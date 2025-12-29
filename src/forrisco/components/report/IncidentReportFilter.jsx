import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import InputContainer from 'forpdi/src/components/inputs/InputContainer';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import TertiaryButton from 'forpdi/src/components/buttons/TertiaryButton';
import SelectBox from 'forpdi/src/components/inputs/SelectBox';
import TextField from 'forpdi/src/components/inputs/TextField';
import MultiSelectWithSelectAll from 'forpdi/src/components/inputs/MultiSelectWithSelectAll';
import DatePickerRange from 'forpdi/src/components/inputs/DatePickerRange';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import RiskType from 'forpdi/src/forrisco/enums/riskType';

import PolicyStore from 'forpdi/src/forrisco/stores/Policy';
import PlanRiskStore from 'forpdi/src/forrisco/stores/PlanRisk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Messages from 'forpdi/src/Messages';
import { getDateStrAsDateTimeStr } from 'forpdi/src/utils/dateUtil';

const viewAllOption = { name: Messages.get('label.viewAll_'), id: -1 };

// Garante que cada opção tenha {id, name}
function mapToIdOptions(arr) {
  return (arr || []).map((item, idx) => ({
    id: typeof item?.id === 'number' ? item.id : idx,
    name: item?.name ? item.name : String(item),
  }));
}
const incidentTypeOptions = mapToIdOptions(RiskType && RiskType.list);

const initialFilters = {
  incidentText: '',
  typeId: -1, // -1 => "Ver tudo"
  selectedUnits: [],
  selectedSubunits: [],
  startCreation: null,
  endCreation: null,
};

class IncidentReportFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      policies: null,
      planRisks: null,
      units: [],
      subunits: [],

      selectedPolicyId: undefined,
      selectedPlanRiskId: undefined,

      ...initialFilters,
    };
  }

  componentDidMount() {
    PolicyStore.on(
      'list-to-select',
      ({ data: { list } }) => {
        this.setState({ policies: list });
      },
      this,
    );

    PlanRiskStore.on(
      'list-to-select',
      ({ data: { list } }) => {
        this.setState({ planRisks: list });
      },
      this,
    );

    UnitStore.on(
      'listToSelect',
      ({ data: { list } }) => {
        const unitsList = _.filter(list, ({ parentId }) => !parentId);
        const subunitsList = _.filter(list, ({ parentId }) => !!parentId);
        this.setState({
          units: unitsList,
          subunits: subunitsList,
          selectedUnits: unitsList,
          selectedSubunits: subunitsList,
        });
      },
      this,
    );

    PolicyStore.dispatch({ action: PolicyStore.ACTION_LIST_TO_SELECT });
  }

  componentWillUnmount() {
    PolicyStore.off(null, null, this);
    PlanRiskStore.off(null, null, this);
    UnitStore.off(null, null, this);
  }

  onPolicyChange = (event) => {
    const selectedPolicyId = parseInt(event.target.value, 10);
    this.setState({
      selectedPolicyId,
      selectedPlanRiskId: undefined,
      planRisks: null,
      units: [],
      subunits: [],
      selectedUnits: [],
      selectedSubunits: [],
      // limpa filtros dependentes
      typeId: -1,
      incidentText: '',
      startCreation: null,
      endCreation: null,
    });

    PlanRiskStore.dispatch({
      action: PlanRiskStore.ACTION_LIST_TO_SELECT,
      data: { policyId: selectedPolicyId },
    });
  };

  onPlanRiskChange = (event) => {
    const selectedPlanRiskId = parseInt(event.target.value, 10);
    this.setState({
      selectedPlanRiskId,
      selectedUnits: [],
      selectedSubunits: [],
    });

    UnitStore.dispatch({
      action: UnitStore.ACTION_LIST_TO_SELECT,
      data: { planRiskId: selectedPlanRiskId },
    });
  };

  onTextHandler = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  onTypeChange = (event) => {
    // value vem como string; converte para inteiro quando possível
    const valStr = event?.target ? event.target.value : '';
    const parsed = parseInt(String(valStr), 10);
    this.setState({ typeId: Number.isNaN(parsed) ? -1 : parsed });
  };

  onMultiselectChange = (values, name) => {
    this.setState({ [name]: values });
  };

  onCreationDateChange = (startCreation, endCreation) => {
    this.setState({ startCreation, endCreation });
  };

  onClean = () => {
    this.setState(prevState => ({
      ...initialFilters,
      selectedPolicyId: undefined,
      selectedPlanRiskId: undefined,
      policies: prevState.policies,
      planRisks: null,
      units: [],
      subunits: [],
    }));
  };

  hasPlanRiskSelected() {
    const { selectedPlanRiskId } = this.state;
    return !!selectedPlanRiskId;
  }

  onHandleFilter = () => {
    const {
      selectedPlanRiskId,
      units,
      selectedUnits,
      subunits,
      selectedSubunits,
      incidentText,
      typeId,
      startCreation,
      endCreation,
    } = this.state;
    const { onFilter } = this.props;

    const noneSelected = selectedUnits.length === 0 && selectedSubunits.length === 0;

    const collectIds = (items, selectedItems) => (noneSelected
      ? _.map(items, ({ id }) => id)
      : _.map(selectedItems, ({ id }) => id));

    const selectedUnitIds = collectIds(units, selectedUnits);
    const selectedSubunitIds = collectIds(subunits, selectedSubunits);

    const numericType = typeof typeId === 'number' && typeId >= 0 ? typeId : null;

    const filters = {
      incident: incidentText || null,
      type: numericType,
      startCreation: getDateStrAsDateTimeStr(startCreation),
      endCreation: getDateStrAsDateTimeStr(endCreation, false),
    };

    onFilter(selectedPlanRiskId, selectedUnitIds, selectedSubunitIds, filters);
  };

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
      incidentText,
      typeId,
      startCreation,
      endCreation,
    } = this.state;

    return (
      <div>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <TextField
              name="incidentText"
              label="Incidente"
              onChange={this.onTextHandler}
              value={incidentText}
              maxLength={100}
              disabled={!this.hasPlanRiskSelected()}
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              name="typeId"
              options={[viewAllOption, ...incidentTypeOptions]}
              label="Tipo do incidente"
              value={typeId}
              onChange={this.onTypeChange}
              optionValueName="id"
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
        <SystemInfo>
          Selecione uma
          {' '}
          <b>Política</b>
          {' '}
          e um
          {' '}
          <b>Plano de Gestão</b>
          {' '}
          para iniciar,
          em seguida selecione os filtros desejados para montagem do relatório.
        </SystemInfo>

        {this.renderPolicyAndPlanRiskSelects()}

        {this.renderFilterFields()}

        {this.renderButtons()}
      </div>
    );
  }
}

IncidentReportFilter.propTypes = {
  onFilter: PropTypes.func.isRequired,
};

IncidentReportFilter.defaultProps = {};

export default IncidentReportFilter;
