import React from "react";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import DashboardStore from "forpdi/src/forpdi/dashboard/store/Dashboard.jsx";
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import Messages from "forpdi/src/Messages.jsx";

import Table from "forpdi/src/components/Table";
import Pagination from "forpdi/src/components/Pagination";

import { cutPhrase } from "forpdi/src/utils/stringUtil";
import { MED_PAGE_SIZE } from "forpdi/src/consts.js";

import _ from 'underscore';
import { parseDate } from 'forpdi/src/utils/dateUtil';

export default React.createClass({
	getInitialState() {
		return {
			hide: false,
			plan: this.props.plan,
			subPlan: this.props.subPlan,
			levelInstance: this.props.levelInstance,
			goalsInformation: null,
			page: 1,
			pageSize: MED_PAGE_SIZE,
		};
	},

	getInfos(page, pageSize, opt) {
		opt = opt || this.props;
		DashboardStore.dispatch({
			action: DashboardStore.ACTION_GET_COMMUNITY_INFO_TABLE,
			data: {
				macro: opt.plan == -1 ? null : opt.plan.id,
				plan: opt.subPLan == -1 ? null : opt.subPlan.id,
				levelInstance:
					opt.levelInstance == -1 ? null : opt.levelInstance.id,
				page: page,
				pageSize: pageSize,
			},
		});
		this.setState({ page: page, pageSize: pageSize });
	},

	componentWillReceiveProps(newProps) {
		this.setState({
			plan: newProps.plan,
			subPlan: newProps.subPlan,
			levelInstance: newProps.levelInstance,
		});
		this.getInfos(1, MED_PAGE_SIZE, newProps);
	},

	componentDidMount() {
		var me = this;
		this.getInfos(1, MED_PAGE_SIZE, this.state);

		DashboardStore.on("communityinfotableretrivied", (store) => {
			me.setState({
				goalsInformation: store.data,
				tamGoalsInformation: store.total,
			});
		});
	},

	componentWillUnmount() {
		DashboardStore.off(null, null, this);
		StructureStore.off(null, null, this);
		PlanMacroStore.off(null, null, this);
	},

	hideFields() {
		this.setState({
			hide: !this.state.hide,
		});
	},

	renderPlanName(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.planName, 100)}
			</span>
		);
	},

	renderStrategicAxisName(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.strategicAxisName, 100)}
			</span>
		);
	},

	renderObjectiveName(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.objectiveName, 100)}
			</span>
		);
	},

	renderIndicatorName(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.indicatorName, 100)}
			</span>
		);
	},

	renderGoalName(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.goalName, 100)}
			</span>
		);
	},

	renderFinishDate(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{data.finishDate}
			</span>
		);
	},

	renderExpected(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.expected, 100)}
			</span>
		);
	},

	renderReached(data) {
		return (
			<span style={{ wordBreak: "break-all" }}>
				{cutPhrase(data.reached, 100)}
			</span>
		);
	},

	render() {
		var dashboardTitle = "";
		if (this.state.levelInstance == -1 && this.state.subPlan == -1)
			dashboardTitle = " - Todos os " + Messages.get("label.goalsPlan");
		else if (this.state.levelInstance == -1)
			dashboardTitle = " - " + this.state.subPlan.name;
		else if (this.state.levelInstance.parent == null)
			dashboardTitle = " - " + this.state.levelInstance.name;
		else if (this.state.levelInstance.level.objective)
			dashboardTitle = " - " + this.state.levelInstance.name;
		else if (this.state.levelInstance.level.indicator)
			dashboardTitle = " - " + this.state.levelInstance.name;

		const columns = [
			{
				name: Messages.get("label.planAction"),
				field: "planName",
				render: this.renderPlanName,
				width: "14%",
				sort: true,
			},
			{
				name: Messages.get("label.thematicAxis"),
				field: "strategicAxisName",
				render: this.renderStrategicAxisName,
				width: "14%",
				sort: true,
			},
			{
				name: Messages.get("label.objective"),
				field: "objectiveName",
				render: this.renderObjectiveName,
				width: "22%",
				sort: true,
			},
			{
				name: Messages.get("label.indicator"),
				field: "indicatorName",
				render: this.renderIndicatorName,
				width: "14%",
				sort: true,
			},
			{
				name: Messages.get("label.goalSing"),
				field: "goalName",
				render: this.renderGoalName,
				width: "14%",
				sort: true,
			},
			{
				name: Messages.get("label.maturity"),
				field: "finishDate",
				render: this.renderFinishDate,
				width: "10%",
				sort: Table.getDateSortBy("finishDate"),
			},
			{
				name: Messages.get("label.goals.expected"),
				field: "expected",
				render: this.renderExpected,
				width: "6%",
				sort: true,
			},
			{
				name: Messages.get("label.titleReached"),
				field: "reached",
				render: this.renderReached,
				width: "6%",
				sort: true,
			},
		];

		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					<b className="budget-graphic-title">
						{" "}
						<span
							className="fpdi-nav-label"
							title={
								(
									Messages.get("label.goalsTable") +
									dashboardTitle
								).length > 70
									? Messages.get("label.goalsTable") +
									dashboardTitle
									: ""
							}
						>
							{" "}
							{dashboardTitle.length <= 70
								? Messages.get("label.goalsTable") +
								dashboardTitle
								: (
									Messages.get("label.goalsTable") +
									dashboardTitle
								)
									.split("", 70)
									.concat(" ...")}{" "}
						</span>{" "}
					</b>
					<div className="performance-strategic-btns floatRight">
						<span
							className={
								this.state.hide
									? "mdi mdi-chevron-right marginLeft15"
									: "mdi mdi-chevron-down marginLeft15"
							}
							onClick={this.hideFields}
						/>
					</div>
				</div>
				{!this.state.hide && this.state.goalsInformation != null ? (
					<div>
						<Table
							data={this.state.goalsInformation}
							columns={columns}
						/>

						<Pagination
							total={this.state.tamGoalsInformation}
							onChange={this.getInfos}
							page={this.state.page}
							pageSize={this.state.pageSize}
							options={[
								{
									value: 10,
									label: Messages.get("label.tenItems"),
								},
								{
									value: 50,
									label: Messages.get(
										"label.fiftyItems"
									),
								},
								{
									value: 100,
									label: Messages.get(
										"label.oneHundredItems"
									),
								},
							]}
						/>
					</div>
				) : (
					""
				)}
			</div>
		);
	},

});
