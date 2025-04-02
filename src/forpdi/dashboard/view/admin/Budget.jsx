import React from "react";
import ForPDIChart from "forpdi/src/forpdi/core/widget/ForPDIChart.jsx"
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import DashboardStore from "forpdi/src/forpdi/dashboard/store/Dashboard.jsx";
import BudgetStore from "forpdi/src/forpdi/planning/store/Budget.jsx";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import string from 'string';
import Messages from "forpdi/src/Messages.jsx";

export default React.createClass({

	getInitialState() {
		return {
			hide: false,
			objectives: [],
			actionBudgets: [],
			selectedactionBudget: -1,
			selectedObjectives: -1,
			loading: true,
			profile: this.props.profile,
			plan: this.props.plan,
			subPlan: this.props.subPlan,
			options: {
				//title: Messages.getEditable("label.generalBudget","fpdi-nav-label"),
				hAxis: { title: '', minValue: 0, maxValue: 15 },
				vAxis: { title: 'Valor (R$)', minValue: 0, maxValue: 15, format: '#,##0' },
				legend: 'none',
				bar: { groupWidth: '50%' }
			}
		};
	},

	componentWillReceiveProps(newProps) {
		this.cleanFilters();
		if (this.props.plan.id != newProps.plan.id || this.props.subPlan.id != newProps.subPlan.id) {
			this.setState({ loading: true });
			StructureStore.dispatch({
				action: StructureStore.ACTION_GET_OBJECTIVES,
				data: {
					macroId: newProps.plan.id,
					planId: newProps.subPlan.id
				}
			});
		}

		if (this.props.plan != newProps.plan || this.props.subPlan != newProps.subPlan) {
			this.setState({ loading: true });
			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
				data: {
					macro: (newProps.plan != -1) ? (newProps.plan.id) : (null),
					plan: (newProps.subPlan != -1) ? (newProps.subPlan.id) : (null)
				}
			});
		}
	},

	componentDidMount() {
		var me = this;

		if (EnvInfo && EnvInfo.company == null) {
			me.setState({
				loading: false
			});
		}

		StructureStore.on("objectivesretrivied", (model) => {
			me.setState({
				objectives: model.data
			});
		}, me);

		BudgetStore.on("find", (model, raw, opts) => {
			me.setState({
				actionBudgets: raw,
				loading: false
			});
			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
				data: {
					macro: this.props.plan.id,
					plan: (this.state.subPlan != -1) ? (this.state.subPlan.id) : (null),
					objective: this.state.selectedObjectives.id
				}
			});

		}, me);


		DashboardStore.on("generalbudgetsretrivied", (store) => {
			var plannedTooltipText = "R$ " + this.formatBR(this.formatEUA(store.data.planned));
			var conductedTooltipText = "R$ " + this.formatBR(this.formatEUA(store.data.conducted));
			var committedTooltipText = "R$ " + this.formatBR(this.formatEUA(store.data.committed));
			this.setState({
				data: [
					['Element', 'Verba', { role: 'style' }, { role: 'tooltip' }],
					[Messages.get("label.budget.planned"), store.data.planned, '#A7E2D2', plannedTooltipText],
					[Messages.get("label.budget.committed"), store.data.committed, '#3AB795', committedTooltipText],
					[Messages.get("label.budget.conducted"), store.data.conducted, '#76D3BA', conductedTooltipText]
				],
				loading: false
			});
		}, me);
		this.setState({
			options: {
				title: Messages.get("label.generalBudget"),
				hAxis: { title: '', minValue: 0, maxValue: 15 },
				vAxis: { title: 'Valor (R$)', minValue: 0, maxValue: 15, format: '#,##0' },
				legend: 'none',
				bar: { groupWidth: '50%' }
			},
			data: [
				['Element', 'Verba', { role: 'style' }, { role: 'tooltip' }],
				[Messages.get("label.budget.planned"), 0, '#A7E2D2', "R$ " + this.formatBR(this.formatEUA(0))],
				[Messages.get("label.budget.committed"), 0, '#3AB795', "R$ " + this.formatBR(this.formatEUA(0))],
				[Messages.get("label.budget.conducted"), 0, '#76D3BA', "R$ " + this.formatBR(this.formatEUA(0))]
			]
		});

		DashboardStore.dispatch({
			action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
			data: {
				macro: (this.props.plan != -1) ? (this.props.plan.id) : (null),
				plan: (this.props.subPlan != -1) ? (this.props.subPlan.id) : (null)
			}
		});

		this.refreshComponent(this.props.plan.id, this.props.subPlan.id);
	},

	refreshComponent(planId, subPlanId) {
		StructureStore.dispatch({
			action: StructureStore.ACTION_GET_OBJECTIVES,
			data: {
				macroId: planId,
				planId: subPlanId
			}
		});
	},

	componentWillUnmount() {
		DashboardStore.off(null, null, this);
		BudgetStore.off(null, null, this);
		StructureStore.off(null, null, this);
	},

	hideFields() {
		this.setState({
			hide: !this.state.hide
		})
	},

	cleanFilters() {
		
		this.refs.selectObjectives.value = -1;
		this.refs.selectSubAction.value = -1;
		this.setState({
			selectedObjectives: -1,
			selectedactionBudget: -1,
		});
		this.objectiveChange();
	},

	objectiveChange(data) {
		//Verifica se a opção dos planos macro selecionada é a de todos os planos
		if (this.refs.selectObjectives.value == -1) {
			this.setState({
				selectedObjectives: -1,
				actionBudgets: [],
				loading: true
			});
			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
				data: {
					macro: this.props.plan.id,
					plan: (this.state.subPlan != -1) ? (this.state.subPlan.id) : (null)
				}
			});
		} else {
			this.setState({
				selectedObjectives: this.state.objectives[this.refs.selectObjectives.value],
				loading: true
			});
			BudgetStore.dispatch({
				action: BudgetStore.ACTION_FIND,
				data: {
					levelId: this.state.objectives[this.refs.selectObjectives.value].id
				}
			});
		}
	},

	subActionChange() {
		if (this.refs.selectSubAction.value == -1) {
			this.setState({
				selectedactionBudget: -1,
				loading: true
			});
			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
				data: {
					macro: this.props.plan.id,
					plan: (this.state.subPlan != -1) ? (this.state.subPlan.id) : (null),
					objective: this.state.selectedObjectives.id
				}
			});
		} else {
			this.setState({
				selectedactionBudget: this.state.actionBudgets[this.refs.selectSubAction.value],
				loading: true
			});

			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GENERAL_BUDGETS,
				data: {
					subAction: this.state.actionBudgets[this.refs.selectSubAction.value].subAction,
					objective: this.state.selectedObjectives.id
				}
			});
		}
	},

	formatEUA(num) {
		const USDollar = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
		});
	
		const n = num.toFixed(2).toString();
		return USDollar.format(n);
	},

	formatBR(str) {

		var x = str.split('.')[0];
		x = this.replaceAll(x, ",", ".");
		var decimal = str.split('.')[1];
		if (decimal == undefined) {
			decimal = '00';
		}
		return x + "," + decimal;
	},

	replaceAll(str, needle, replacement) {
		var i = 0;
		while ((i = str.indexOf(needle, i)) != -1) {
			str = str.replace(needle, replacement);
		}
		return str;
	},


	render() {
		return (
			<div id={!this.state.hide ? "budgetSection" : ""} className="panel panel-default">
				<div className="panel-heading dashboard-panel-title">
					<div className="performance-strategic-btns floatRight">
						<span className={(this.state.hide) ? ("mdi mdi-chevron-right marginLeft15") : ("mdi mdi-chevron-down marginLeft15")} onClick={this.hideFields} />
					</div>
					<div>
						<b className="budget-graphic-title"> {Messages.getEditable("label.budget", "fpdi-nav-label")} </b>
						<select onChange={this.objectiveChange} className="form-control dashboard-select-box-graphs marginLeft10" ref="selectObjectives">
							<option value={-1} data-placement="right" title={Messages.get("label.allObjectives")}>{Messages.get("label.allObjectives")} </option>
							{this.state.objectives ?
								this.state.objectives.map((attr, idy) => {
									return (<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
										{(attr.name.length > 20) ? (string(attr.name).trim().substr(0, 15).concat("...").toString()) : (attr.name)}
									</option>);
								}) : ""
							}
						</select>
						<select onChange={this.subActionChange} ref="selectSubAction" className="form-control dashboard-select-box-graphs marginLeft10"
							disabled={(this.state.selectedObjectives < 0) ? ("disabled") : ("")}>
							<option value={-1} data-placement="right" title="Todas as sub-ações">{Messages.get("label.allSubActions")}</option>
							{(this.state.actionBudgets) ? (this.state.actionBudgets.map((attr, idy) => {
								return (<option key={attr.id} value={idy} data-placement="right" title={attr.subAction}>{attr.subAction}</option>);
							})) : ("")
							}
						</select>
					</div>

				</div>
				{!this.state.hide ?
					<div className={this.state.profile.ADMIN ? 'paddingTopBottom30' : 'paddingBottom95'}>
						{this.state.loading ? <LoadingGauge /> :
							<ForPDIChart
								chartType="ColumnChart"
								data={this.state.data}
								options={this.state.options}
								graph_id="ColumnChart-Budget"
								width={"100%"}
								height={"300px"}
								legend_toggle={true} />
						}
					</div>
					: ""}
			</div>);
	}
});
