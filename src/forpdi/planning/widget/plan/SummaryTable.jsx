
import _ from 'underscore';
import Numeral from "numeral";
import React from "react";
import {Link} from "react-router";

import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";

import LoadingImage from 'forpdi/img/loading2.gif';
import Messages from "forpdi/src/Messages.jsx";

export default React.createClass({
	contextTypes: {
		roles: React.PropTypes.object.isRequired,
		router: React.PropTypes.object,
		toastr: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
	},
	propTypes: {
		planMacro: React.PropTypes.object.isRequired
	},
	getInitialState() {
		return {
			tree: null
		};
	},
	componentDidMount(){
		var me = this;

		PlanStore.on("retrieve-performance", (raw) => {			
			var tree = raw.map((plan, index) => {
				return {
					label: plan.name,
					expanded: false,
					expandable: true,
					indent: 0,
					key: "subplan-"+plan.id,
					plan: plan,
					performance: plan.performance,
					minimum: plan.minimumAverage,
					maximum: plan.maximumAverage,
					parents: [],
					model: plan.planDetailedList
				};
			});

			me.setState({
				subplans: raw,
				tree: tree
			});
		}, me);

		StructureStore.on("retrieve-level-instance-performance", (models, parent) => {
			if (!models || (models.length <= 0)) {
				parent.expandable = false;
			} else {
				var insertionPoint = 1 + this.state.tree.findIndex((spec) => {
					return (spec.key === parent.key);
				});

	            _.each(models, (level, index) => {
					me.state.tree.splice(insertionPoint, 0, {
						label: level.name,
						expanded: false,
						expandable: !level.level.leaf && !level.aggregate,
						indent: parent.indent+1,
						key: "level-"+level.id,
						plan: parent.plan,
						performance: level.levelValue,
						minimum: level.levelMinimum,
						maximum: level.levelMaximum,
						level: level.id,
						parentKey: parent.key,
						parentLevel: parent.level,
						parents: parent.parents.concat([parent.key]),
						model: level.levelInstanceDetailedList
					});
				});
				parent.expanded = true;
			}
			parent.loading = false;
			me.forceUpdate();
        }, me);

		PlanMacroStore.on("recalculation-scheduled", () => {			
			me.context.toastr.addAlertSuccess(Messages.get("label.recalculationScheduled"));
		}, me);
		
		this.refreshPlans(this.props.planMacro.get("id"));
	},

	componentWillUnmount() {
		PlanStore.off(null, null, this);
		PlanMacroStore.off(null, null, this);
		StructureStore.off(null, null, this);
	},

	componentWillReceiveProps(newProps) {
	    if (this.props.planMacro.get("id") != newProps.planMacro.get("id")) {
	    	this.refreshPlans(newProps.planMacro.get("id"));
	    }
	},

	refreshPlans(planId) {
		PlanStore.dispatch({
			action: PlanStore.ACTION_RETRIEVE_PERFORMANCE,
			data: {
				parentId: planId
			},
			opts: {
				wait: true
			}
		});
	},

	scheduleSummaryCalculation(planId) {
		PlanMacroStore.dispatch({
			action: PlanMacroStore.ACTION_SCHEDULE_RECALCULATION,
			data: this.props.planMacro.get("id"),
			opts: {
				wait: true
			}
		});
	},

	tweakExpansion(spec, event) {
		event && event.preventDefault();
		if (!spec.expanded) {
			spec.loading = true;
			this.forceUpdate();
			StructureStore.dispatch({
                action: StructureStore.ACTION_RETRIEVE_LEVEL_INSTANCE_PERFORMANCE,
                data: {
                    planId: spec.plan.id,
                    parentId: !spec.level ? 0:spec.level
                },
                opts: spec
            });
		} else {
			spec.expanded = false;
			this.setState({
				tree: this.state.tree.filter((row) => {
					return (row.parents.indexOf(spec.key) < 0);
				})
			});
		}
	},

	renderYearCells(rowData) {
		var cells = [];
		for (var month = 0; month < 12; month++) {
			if (rowData && rowData.length>0 && rowData[month] != null) {
				var achieved;
				if (rowData[month].levelValue)
					achieved = Numeral(rowData[month].levelValue);
				else
					achieved = Numeral(rowData[month].performance);
				
				var minimum;
				if (rowData[month].levelMinimum)
					minimum = Numeral(rowData[month].levelMinimum);
				else
					minimum = Numeral(rowData[month].minimumAverage);

				var maximum;
				if (rowData[month].levelMaximum)
					maximum = Numeral(rowData[month].levelMaximum);
				else
					maximum = Numeral(rowData[month].maximumAverage);

				var color = "";
				if (!achieved)
					color = "gray";
				else if (achieved.value() < minimum)
					color = "red";
				else if (achieved.value() < 100.0)
					color = "yellow";
				else if (achieved.value() < maximum || maximum == 100.0)
					color = "green";
				else
					color = "blue";

				if(achieved != 0){
					cells.push(<td key={"month-cell-"+month}>
						<div className={"circle width40 "+color+
							(achieved.format("0,0.00").toString().length > 7 ? " fontSize8" : " fontSize95")}>
							{achieved.format("0,0.00")}%
						</div>
					</td>);
				} else {
					cells.push(<td key={"month-cell-"+month}>
					-
					</td>);					
				}
			} else {
				cells.push(<td key={"month-cell-"+month}>
					-
				</td>);
			}
		}
		return (<table>
			<tbody>
				<tr>
					{cells}
				</tr>
			</tbody>
		</table>);
	},

	renderTableBody() {
		return (<tbody>
			{this.state.tree.map((rowSpec, index) => {
				var achieved = !rowSpec.performance ? null:Numeral(rowSpec.performance);
				var color = "";

				if (!achieved)
					color = "gray";
				else if (achieved.value() < rowSpec.minimum)
					color = "red";
				else if (achieved.value() < 100.0)
					color = "yellow";
				else if (achieved.value() < rowSpec.maximum || rowSpec.maximum == 100.0)
					color = "green";
				else
					color = "blue";
				return (<tr key={"data-row-"+index}>
					<td style={{"paddingLeft": ""+(rowSpec.indent*15 + 5)+"px"}}>
						{rowSpec.loading ? <img src={LoadingImage} style={{"height": "12px"}} />:(rowSpec.expandable ? (
							<a className={rowSpec.expanded ? "mdi mdi-chevron-down":"mdi mdi-chevron-right"}
								onClick={this.tweakExpansion.bind(this, rowSpec)}>&nbsp;</a>
						) : <span className={"mdi mdi-menu-right"}>&nbsp;</span>)}
						<span className="displayInline" title={rowSpec.label}>{rowSpec.label.length>70 ? (rowSpec.label.substring(0, 70)).concat("...") : rowSpec.label}</span>
					</td>
					<td className="text-center">
						{!achieved ? "-":(

							<div className={"circle width50 fontSize10 "+color}>
								{achieved.format("0,0.00")}%
							</div>
						)}
					</td>
					<td className="summary-table-calendar-cell">
						{this.renderYearCells(rowSpec.model)}
					</td>
				</tr>);
			})}
		</tbody>);
	},

	render() {
		if (!this.state.tree) {
			return <div />;
		}
		return (
		<div className="summary-table">
			<div className="summary-table-header">
			{this.context.roles.MANAGER || _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION) ? (
    <div>
        <button onClick={this.scheduleSummaryCalculation} className="btn btn-primary">Recalcular</button>
        {Messages.getEditable("label.summaryTable", "fpdi-nav-label")} - {this.props.planMacro.get("name").length <= 24 ? (
            this.props.planMacro.get("name")
        ) : (
            this.props.planMacro.get("name").split("", 20).concat(" ...")
        )}
    </div>
) : (
    <div>
        {Messages.getEditable("label.summaryTable", "fpdi-nav-label")} - {this.props.planMacro.get("name").length <= 24 ? (
            this.props.planMacro.get("name")
        ) : (
            this.props.planMacro.get("name").split("", 20).concat(" ...")
        )}
    </div>
)}
			</div>
			<table>
				<thead>
					<tr>
						<th></th>
						<th></th>
						<th className="text-center">{Messages.getEditable("label.monthPerformance","fpdi-nav-label")}</th>
					</tr>
					<tr>
						<th>Nível</th>
						<th className="text-center" style={{width: '100px', maxWidth: '100px'}}>{Messages.getEditable("label.profit","fpdi-nav-label")}</th>
						<td className="summary-table-calendar-cell">
							<table>
								<tbody>
									<tr>
										<td>{Messages.getEditable("label.month.abbr.january","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.february","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.march","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.april","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.may","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.june","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.july","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.august","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.september","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.october","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.november","fpdi-nav-label")}</td>
										<td>{Messages.getEditable("label.month.abbr.december","fpdi-nav-label")}</td>
									</tr>
								</tbody>
							</table>
						</td>
					</tr>
				</thead>
				{this.renderTableBody()}
			</table>
		</div>);
	}
});
