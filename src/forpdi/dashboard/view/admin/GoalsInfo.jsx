import React from "react";
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';

import DashboardStore from "forpdi/src/forpdi/dashboard/store/Dashboard.jsx";
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import Messages from "forpdi/src/Messages.jsx";

var numeral = require('numeral');

export default React.createClass({

	getInitialState() {
		return {
			info: {
				inDay: 0,
				inDayPercentage: 0.0,
				late: 0,
				latePercentage: 0.0,
				belowMininum: 0,
				belowMinimumPercentage: 0.0,
				belowExpected: 0,
				belowExpectedPercentage: 0.0,
				reached: 0,
				reachedPercentage: 0.0,
				aboveExpected: 0,
				aboveExpectedPercentage: 0.0,
				finished: 0,
				finishedPercentage: 0.0,
				closeToMaturity: 0,
				closeToMaturityPercentage: 0.0,
				notStarted: 0,
				notStartedPercentage: 0.0,
			},
			hide: false,
			plan: -1,
			subPlan: -1,
			loading: true
		};
	},

	componentDidMount() {
		var me = this;
		if (EnvInfo && EnvInfo.company == null) {
			me.setState({
				loading: false
			});
		}

		DashboardStore.on("goalsinfoadminretrivied", (store) => {
			me.setState({
				info: store.data,
				loading: false
			});
		}, this);
		this.refreshComponent(this.props.plan, this.props.subPlan)
	},

	refreshComponent(plan, subPlan) {
		DashboardStore.dispatch({
			action: DashboardStore.ACTION_GET_GOALS_INFO_ADM,
			data: {
				macro: (plan == -1 ? null : plan.get("id")),
				plan: (subPlan == -1 ? null : subPlan)
			}
		});
	},

	componentWillUnmount() {
		DashboardStore.off(null, null, this);
		PlanMacroStore.off(null, null, this);
		PlanStore.off(null, null, this);
	},

	componentWillReceiveProps(newProps) {
		if (this.props.plan != newProps.plan || this.props.macro != newProps.macro) {
			DashboardStore.dispatch({
				action: DashboardStore.ACTION_GET_GOALS_INFO_ADM,
				data: {
					macro: (newProps.plan == -1 ? null : newProps.plan.get("id")),
					plan: (newProps.subPlan == -1 ? null : newProps.subPlan.id)
				}
			});

			this.setState({
				plan: newProps.plan,
				subPlan: newProps.subPlan,
				loading: true
			});
		}
	},

	hide() {
		this.setState({
			hide: !this.state.hide
		});
	},

	render() {
		var title = Messages.get("label.generalGoalInfo") + (this.state.plan != -1 ? " - " + this.state.plan.get("name") +
			(this.state.subPlan != -1 ? " - " + this.state.subPlan.name : "") : "");
		return (
			<div className={this.props.className}>
				<div className="panel panel-default dashboard-goals-info-ctn">
					<div className="panel-heading dashboard-panel-title">
						<b className="budget-graphic-title" title={title}>
							{Messages.get("label.generalGoalInfo") + (this.state.plan != -1 ? " - " + (this.state.plan.get("name").length > 30 ?
								this.state.plan.get("name").substr(0, 30).concat("...") : this.state.plan.get("name")) +
								(this.state.subPlan != -1 ? " - " + (this.state.subPlan.name.length > 30 ?
									this.state.subPlan.name.substr(0, 30).contat("...") : this.state.subPlan.name) : "")
								: "")
							}
						</b>
						<span className={this.state.hide ? "mdi mdi-chevron-right floatRight" : "mdi mdi-chevron-down floatRight"}
							onClick={this.hide} />
					</div>
					{this.state && this.state.info && !this.state.hide ?
						<div className="panel-body dash-board-goals-info-adm text-center">
							{this.state.loading ? <LoadingGauge /> :
								<div>
									<div className="row">
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.inDay}</h1>
											<h4>{"(" + numeral(this.state.info.inDayPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.inDay", "fpdi-nav-label")}</p>
										</div>

										{/*Colocar cálculo correto*/}
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.closeToMaturity}</h1>
											<h4>{"(" + numeral(this.state.info.closeToMaturityPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.closeToMaturity", "fpdi-nav-label")}</p>
										</div>

										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.late}</h1>
											<h4>{"(" + numeral(this.state.info.latePercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.late", "fpdi-nav-label")}</p>
										</div>

										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.notStarted}</h1>
											<h4>{"(" + numeral(this.state.info.notStartedPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.notStarted", "fpdi-nav-label")}</p>
										</div>
									</div>
									<div className="row">
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.belowMininum}</h1>
											<h4>{"(" + numeral(this.state.info.belowMinimumPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.belowMinimum", "fpdi-nav-label")}</p>
										</div>
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.belowExpected}</h1>
											<h4>{"(" + numeral(this.state.info.belowExpectedPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.belowExpected", "fpdi-nav-label")}</p>
										</div>
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.reached}</h1>
											<h4>{"(" + numeral(this.state.info.reachedPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.reached", "fpdi-nav-label")}</p>
										</div>
										<div className="dashboard-goal-info col-sm-2">
											<h1>{this.state.info.aboveExpected}</h1>
											<h4>{"(" + numeral(this.state.info.aboveExpectedPercentage).format('0,0.00') + "%)"}</h4>
											<p>{Messages.getEditable("label.goals.aboveExpected", "fpdi-nav-label")}</p>
										</div>
									</div>
								</div>}
						</div>
						: ""}
				</div>
			</div>
		);
	}
});
