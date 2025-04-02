import React from "react";
import PropTypes from "prop-types";

import InputContainer from "forpdi/src/components/inputs/InputContainer";
import PrimaryButton from "forpdi/src/components/buttons/PrimaryButton";
import TertiaryButton from "forpdi/src/components/buttons/TertiaryButton";
import SelectBox from "forpdi/src/components/inputs/SelectBox";
import SystemInfo from "forpdi/src/components/SystemInfo";
import DatePickerRange from "forpdi/src/components/inputs/DatePickerRange";

import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure";
import Messages from "forpdi/src/Messages";

import { getDateStrAsDateTimeStr, nowDate , dateStrIsAfter} from 'forpdi/src/utils/dateUtil';


const viewAllOption = { id: -1, name: Messages.get("label.viewAll") };

const goalStatusOptions = [
  { id: -1, name: Messages.get("label.viewAll") },
  { id: false, name: "Aberta" },
  { id: true, name: "Concluída" },
];

const goalProgressStatusOptions = [
  { id: -1, name: Messages.get("label.viewAll") },
  { id: 1, name: "Abaixo do mínimo" },
  { id: 2, name: "Abaixo do esperado" },
  { id: 3, name: "Suficiente" },
  { id: 4, name: "Acima do máximo" },
  { id: 5, name: "Não iniciado" },
  { id: 6, name: "Não preenchido" },
];

class PDIReportFilter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      plans: [],
      selectedPlanId: undefined,
      subplans: [],
      selectedSubplanId: undefined,
      strategicAxis: [],
      selectedStrategicAxisId: undefined,
      objectives: [],
      selectedObjectivesId: undefined,
      indicators: [],
      selectedIndicatorId: undefined,
      goals: [viewAllOption], 
      selectedGoalId: viewAllOption.id, 
      goalInfo: null,
      startDate: null,
      endDate: null,
      selectedGoalStatus: -1,
      selectedGoalProgressStatus: -1,
      loaded: false,
      errors:{},
    };
  }

  componentDidMount() {
    PlanMacroStore.on("unarchivedplanmacrolisted", this.handlePlanMacroFind, this);
    PlanStore.on("find", this.handlePlanFind, this);
    StructureStore.on("levelSonsFilterRetrivied", this.handleStructureFind, this);
    StructureStore.on("levelAttributeRetrieved", this.handleLevelAttributesRetrieved, this);

    PlanMacroStore.dispatch({
      action: PlanMacroStore.ACTION_FIND_UNARCHIVED,
    });
  }

  componentWillUnmount() {
    PlanMacroStore.off("unarchivedplanmacrolisted", this.handlePlanMacroFind);
    PlanStore.off("find", this.handlePlanFind);
    StructureStore.off("levelAttributeRetrieved", this.handleLevelAttributesRetrieved);
    StructureStore.off("levelSonsFilterRetrivied", this.handleStructureFind);
  }

  handlePlanMacroFind = (store) => {
    if (!store || !store.data || store.data.length === 0) {
      return;
    }

    const mappedPlans = store.data.map((plan) => ({
      id: plan.id,
      name: plan.name,
    }));

    this.setState({
      plans: mappedPlans,
      subplans: [],
      strategicAxis: [],
      objectives: [],
      indicators: [],
      goals: [viewAllOption],
      selectedObjectivesId: undefined,
      selectedPlanId: undefined,
      selectedSubplanId: undefined,
      selectedStrategicAxisId: undefined,
      selectedIndicatorId: undefined,
      selectedGoalId: viewAllOption.id,
    });
  };

  handlePlanFind = (store) => {
    if (!store || !store.models || store.models.length === 0) {
      this.setState({
        subplans: [],
        selectedSubplanId: undefined,
      });
      return;
    }

    const mappedSubplans = store.models.map((subplan) => {
      const parentId = subplan.attributes.parent
        ? subplan.attributes.parent.id
        : null;
      return {
        id: subplan.id,
        name: subplan.attributes.name,
        parentId: parentId,
      };
    });

    this.setState((prevState) => {
      const currentPlanId = prevState.selectedPlanId;

      if (!currentPlanId) {
        return {
          subplans: [],
          selectedSubplanId: undefined,
        };
      }

      const filteredSubplans = mappedSubplans.filter(
        (subplan) => subplan.parentId === currentPlanId
      );

      return {
        subplans: filteredSubplans,
        selectedSubplanId: undefined,
      };
    });
  };

  handleStructureFind = (store) => {
    if (store.data && store.data.length > 0) {
      const level = store.data[0].level;

      if (level && level.objective) {
        const mappedObjectives = store.data.map((objective) => ({
          id: objective.id,
          name: objective.name,
        }));
        this.setState({
          objectives: [viewAllOption, ...mappedObjectives],
        });
      } else if (level && level.indicator) {
        const mappedIndicators = store.data.map((indicator) => ({
          id: indicator.id,
          name: indicator.name,
        }));
        this.setState({
          indicators: [viewAllOption, ...mappedIndicators],
        });
      } else if (level && level.goal) {
        const { startDate, endDate, selectedGoalStatus } = this.state;

        let mappedGoals = store.data.map((goal) => ({
          id: goal.id,
          name: goal.name,
          creationDate: goal.creation,
          closed: goal.closed,
        }));

        if (startDate && endDate) {
          const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
          const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

          mappedGoals = mappedGoals.filter((goal) => {
            const [day, month, yearAndTime] = goal.creationDate.split('/');
            const [year, time] = yearAndTime.split(' ');
            const creationDateString = `${month}/${day}/${year} ${time}`;
            const creationDate = new Date(creationDateString).getTime();

            return creationDate >= startTimestamp && creationDate <= endTimestamp;
          });
        }

        if (selectedGoalStatus !== -1) {
          mappedGoals = mappedGoals.filter(
            (goal) => goal.closed === selectedGoalStatus
          );
        }
        const goalsWithViewAll = [viewAllOption, ...mappedGoals];

        this.setState({
          goals: goalsWithViewAll,
          selectedGoalId: viewAllOption.id,
        });
      } else {
        const mappedStrategicAxis = store.data.map((axis) => ({
          id: axis.id,
          name: axis.name,
        }));
        this.setState({ strategicAxis: mappedStrategicAxis });
      }
    }
  };

  handleLevelAttributesRetrieved = (store) => {
    if (store.data) {
      this.setState({ goalInfo: store.data });
    } else {
      console.warn("No goal attributes received");
    }
  };

  onPlanChange = (e) => {
    const selectedPlanId = parseInt(e.target.value, 10);

    this.setState(
      {
        selectedPlanId,
        selectedSubplanId: undefined,
        selectedStrategicAxisId: undefined,
        subplans: [],
        strategicAxis: [],
        objectives: [],
        indicators: [],
        goals: [viewAllOption],
        selectedGoalId: viewAllOption.id,
      },
      () => {
        if (selectedPlanId) {
          PlanStore.dispatch({
            action: PlanStore.ACTION_FIND,
            data: { parentId: selectedPlanId },
          });
        }
      }
    );
  };

  onSubplanChange = (e) => {
    const selectedSubplanId = parseInt(e.target.value, 10);

    this.setState(
      {
        selectedSubplanId,
        selectedStrategicAxisId: undefined,
        strategicAxis: [],
        objectives: [],
        indicators: [],
        goals: [viewAllOption],
        selectedGoalId: viewAllOption.id,
      },
      () => {
        if (selectedSubplanId) {
          StructureStore.dispatch({
            action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
            data: { planId: selectedSubplanId, parent: null },
          });
        }
      }
    );
  };

  onStrategicAxisChange = (e) => {
    const selectedStrategicAxisId = parseInt(e.target.value, 10);
    this.setState(
      {
        selectedStrategicAxisId,
        selectedObjectivesId: -1,
        selectedIndicatorId: -1,
        objectives: [viewAllOption],
        indicators: [viewAllOption],
        goals: [viewAllOption],
        selectedGoalId: viewAllOption.id,
      },
      () => {
        if (selectedStrategicAxisId) {
          StructureStore.dispatch({
            action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
            data: { parent: selectedStrategicAxisId },
          });
        }
      }
    );
  };

  onObjectiveChange = (e) => {
    const selectedObjectivesId = parseInt(e.target.value, 10);

    if (selectedObjectivesId === -1) {
      this.setState({
        selectedObjectivesId,
        selectedIndicatorId: -1,
        selectedGoalId: -1,
        indicators: [viewAllOption],
        goals: [viewAllOption],
        selectedGoalId: viewAllOption.id,
      });
    } else {
      this.setState(
        {
          selectedObjectivesId,
          selectedIndicatorId: undefined,
          selectedGoalId: undefined,
          indicators: [viewAllOption],
          goals: [viewAllOption],
        },
        () => {
          if (selectedObjectivesId) {
            StructureStore.dispatch({
              action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
              data: { parent: selectedObjectivesId },
            });
          }
        }
      );
    }
  };

  onIndicatorChange = (e) => {
    const value = parseInt(e.target.value, 10);

    this.setState(
      {
        selectedIndicatorId: value,
        goals: [viewAllOption],
        selectedGoalId: viewAllOption.id,
      },
      () => {
        if (value !== -1) {
          StructureStore.dispatch({
            action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
            data: { parent: value },
          });
        } else {
          this.setState({ goalInfo: null });
        }
      }
    );
  };

  onGoalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    this.setState({ selectedGoalId: value }, () => {
      if (value !== -1) {
        StructureStore.dispatch({
          action: StructureStore.ACTION_RETRIEVE_LEVELATTRIBUTES,
          data: { id: value },
        });
      } else {
        this.setState({ goalInfo: null });
      }
    });
  };

  onGoalStatusChange = (e) => {
    const value = e.target.value;
    let selectedGoalStatus;

    if (value === "-1") {
      selectedGoalStatus = -1;
    } else if (value === "true") {
      selectedGoalStatus = true;
    } else if (value === "false") {
      selectedGoalStatus = false;
    }

    this.setState({ selectedGoalStatus }, () => {
      this.reloadGoals();
    });
  };

  onGoalProgressChange = (e) =>{
    const value = e.target.value;
    this.setState({selectedGoalProgressStatus: value});
  }

  onClean = () => {
    this.setState({
      selectedPlanId: undefined,
      selectedSubplanId: undefined,
      selectedStrategicAxisId: undefined,
      selectedObjectivesId: undefined,
      selectedIndicatorId: undefined,
      selectedGoalId: viewAllOption.id,
      subplans: [],
      strategicAxis: [],
      objectives: [],
      indicators: [],
      goals: [viewAllOption],
      startDate: null,
      endDate: null,
      selectedGoalProgressStatus: -1,
      errors: {},
    });
  };

  reloadGoals = () => {
    const { selectedIndicatorId } = this.state;

    if (selectedIndicatorId && selectedIndicatorId !== -1) {
      StructureStore.dispatch({
        action: StructureStore.ACTION_GET_LEVELSONS_FILTER,
        data: { parent: selectedIndicatorId },
      });
    } else {
      this.setState({ goals: [viewAllOption], selectedGoalId: viewAllOption.id });
    }
  };

  validateDates = (startDate, endDate) => {
    let { errors } = this.state;
    const actualDate = nowDate();
    let validDates = true;

    if(dateStrIsAfter(startDate, actualDate) && startDate){
      errors.beginDate = "A data inicial deve ser menor que a atual.";
      validDates = false;
    }else{
      errors.beginDate = null;
    }

    if(dateStrIsAfter(endDate, actualDate) && endDate){
      errors.endDate = "A data final deve ser menor que a atual.";
      validDates = false;
    }else{
      errors.endDate = null;
    }

    this.setState({
      errors,
    });
    return validDates;
  };

  onCreationDateChange = (startDate, endDate) => {
    if(!this.validateDates(startDate, endDate))
      return;

    this.setState({
      startDate,
      endDate,
    });
  };

  onHandleFilter = () => {
    const { startDate, endDate } = this.state;
    if (this.state.selectedPlanId) {
      this.props.onFilter({
        ...this.state,
        startDate: getDateStrAsDateTimeStr(startDate),
        endDate: getDateStrAsDateTimeStr(endDate, false),
      });
    } else {
      alert(Messages.get('message.selectPlanFirst'));
    }
  };

  renderPlanAndSubplanSelects() {
    const { plans, selectedPlanId, subplans, selectedSubplanId } = this.state;

    return (
      <InputContainer className="row">
        <div className="col col-sm-6">
          <SelectBox
            options={plans || []}
            label={"Plano de Desenvolvimento"}
            value={selectedPlanId}
            onChange={this.onPlanChange}
            optionValueName="id"
            optionLabelName="name"
            showChooseOption
            required
          />
        </div>
        <div className="col col-sm-6">
          <SelectBox
            options={subplans || []}
            label={Messages.get("label.goalsPlan")}
            value={selectedSubplanId}
            onChange={this.onSubplanChange}
            optionValueName="id"
            optionLabelName="name"
            showChooseOption
            required
            disabled={!selectedPlanId}
          />
        </div>
      </InputContainer>
    );
  }

  renderStrategicAxisSelect() {
    const {
      strategicAxis,
      selectedStrategicAxisId,
      objectives,
      selectedObjectivesId,
      indicators,
      selectedIndicatorId,
      selectedSubplanId,
      goals,
      startDate,
      endDate,
      selectedGoalId,
      errors,
    } = this.state;

    return (
      <div>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={strategicAxis || []}
              label={Messages.get("label.thematicAxis")}
              value={selectedStrategicAxisId}
              onChange={this.onStrategicAxisChange}
              optionValueName="id"
              optionLabelName="name"
              showChooseOption
              required
              disabled={!selectedSubplanId}
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              options={objectives || []}
              label={Messages.get("label.objectives")}
              value={selectedObjectivesId}
              onChange={this.onObjectiveChange}
              optionValueName="id"
              optionLabelName="name"
              showChooseOption
              disabled={!selectedStrategicAxisId}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={indicators || []}
              label={Messages.get("label.indicators")}
              value={selectedIndicatorId}
              onChange={this.onIndicatorChange}
              optionValueName="id"
              optionLabelName="name"
              showChooseOption
              disabled={!selectedObjectivesId}
            />
          </div>
          <div className="col col-sm-6">
            <DatePickerRange
              beginValue={startDate}
              endValue={endDate}
              label={Messages.get("label.creationDate")}
              onChange={this.onCreationDateChange}
              disabled={!selectedIndicatorId}
              beginErrorMsg={errors.beginDate}
              endErrorMsg={errors.endDate}
            />
          </div>
        </InputContainer>
        <InputContainer className="row">
          <div className="col col-sm-6">
            <SelectBox
              options={goalStatusOptions}
              label={"Status da Meta"}
              value={this.state.selectedGoalStatus}
              onChange={this.onGoalStatusChange}
              optionValueName="id"
              optionLabelName="name"
              disabled={!selectedIndicatorId}
            />
          </div>
          <div className="col col-sm-6">
            <SelectBox
              options={goalProgressStatusOptions}
              label={"Progresso da Meta"}
              value={this.state.selectedGoalProgressStatus}
              onChange={this.onGoalProgressChange}
              optionValueName="id"
              optionLabelName="name"
              showChooseOption
              disabled={!selectedStrategicAxisId}
            />
          </div>
          {/*
          <div className="col col-sm-6">
            <SelectBox
              options={goals || []}
              label={Messages.get("label.goals")}
              value={selectedGoalId}
              onChange={this.onGoalChange}
              optionValueName="id"
              optionLabelName="name"
              showChooseOption
              disabled={
                selectedIndicatorId === undefined ||
                selectedIndicatorId === null
              }
            />
          </div> 
          */}
        </InputContainer>
      </div>
    );
  }

  renderButtons() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "3rem",
        }}
      >
        <TertiaryButton
          title={Messages.get("label.clean")}
          text={Messages.get("label.clean")}
          onClick={this.onClean}
          style={{ marginRight: "1rem", width: "134px" }}
        />
        <PrimaryButton
          title={Messages.get("label.search")}
          text={Messages.get("label.search")}
          onClick={this.onHandleFilter}
          disabled={
            !(
              this.state.selectedPlanId &&
              this.state.selectedSubplanId &&
              this.state.selectedStrategicAxisId
            )
          }
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        <SystemInfo style={{ paddingTop: "1rem" }}>
          Selecione um Plano de desenvolvimento para iniciar, em
          seguida selecione os filtros desejados para montagem do
          relatório.
        </SystemInfo>

        {this.renderPlanAndSubplanSelects()}

        {this.renderStrategicAxisSelect()}

        {this.renderButtons()}
      </div>
    );
  }
}

PDIReportFilter.propTypes = {
  onFilter: PropTypes.func.isRequired,
};

export default PDIReportFilter;
