import React from "react";
import GoalsBoardGroup from "forpdi/src/forpdi/dashboard/view/colaborator/GoalsBoardGroup.jsx";
import GoalPerformance from "forpdi/src/forpdi/dashboard/view/colaborator/GoalPerformance.jsx";
import GoalsInfoTable from "forpdi/src/forpdi/dashboard/view/colaborator/GoalsInfoTableColaborator.jsx";

export default React.createClass({
	getInitialState() {
		return {
			plan: this.props.plan,
			subPlan: this.props.subPlan,
		};
	},

	componentWillReceiveProps(newProps) {
		this.setState({
			plan: newProps.plan,
			subPlan: newProps.subPlan
		});
	},

	componentDidMount(){
		var me = this;
	},

	render() {
		return (
			<div>
				<div className="goals-board-group marginTop20">
					<GoalsBoardGroup plan={this.state.plan} subPlan={this.state.subPlan} />
				</div>
				<div className="col-md-12">
					<GoalPerformance plan={this.state.plan} subPlan={this.state.subPlan} />
				</div>
				<div className="col-md-12">
					<GoalsInfoTable plan={this.state.plan} subPlan={this.state.subPlan} />
				</div>
			</div>
		);
	}
});
