import React from "react";
import {Link} from 'react-router';

import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";

import PlanMacroTabPanel from "forpdi/src/forpdi/planning/widget/plan/PlanMacroTabPanel.jsx";
import PlanMacroTree from "forpdi/src/forpdi/planning/widget/plan/PlanMacroTree.jsx";
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import Messages from "forpdi/src/Messages.jsx";
import _ from 'underscore';

export default React.createClass({
	contextTypes: {
		router: React.PropTypes.object,
		permissions: React.PropTypes.array.isRequired,
		roles: React.PropTypes.object.isRequired
	},
	propTypes: {
		location: React.PropTypes.object.isRequired
	},
	getInitialState() {
		return {
			planId: null,
			model: null
		};
	},

	componentDidMount() {
		PlanMacroStore.on("findById", (model) => {
			this.setState({
				model: model,
				planId: model.get("id")
			});
		}, this);
		this.refreshComponent(this.props.params.id)
	},

	refreshComponent(id) {
		PlanMacroStore.dispatch({
			action: PlanMacroStore.ACTION_FIND_BY_ID,
			data: id
		});
	},

	componentWillUnmount() {
		PlanMacroStore.off(null, null, this);
	},

	componentWillReceiveProps(newProps) {
		if (newProps.params.id != this.state.planId) {
			this.setState({
				model: null,
				planId: null
			});
			PlanMacroStore.dispatch({
				action: PlanMacroStore.ACTION_FIND_BY_ID,
				data: newProps.params.id
			});
		}
	},

	render() {
		if (!this.state.model) {
			return <LoadingGauge />;
		}
		if (this.state.model.attributes.deleted) {
			return (<div className="fpdi-plan-details">
				<h1 className="marginLeft30">{Messages.getEditable("label.planUnavailable", "fpdi-nav-label")}</h1>
			</div>);
		}
		if (this.state.model.attributes.archived) {
			if (this.context.roles.ADMIN || _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_MACRO_PERMISSION)) {
				return (
					<div className="fpdi-plan-details">
						<PlanMacroTree plan={this.state.model} ref="tree" treeType={this.props.route.path}/>
						<div className="fpdi-plan-tabs">
							<PlanMacroTabPanel
								{...this.props}
								planMacro={this.state.model}
								ref={"tabpanel-" + this.state.planId}
								key={"tabpanel-" + this.state.planId}/>
						</div>
					</div>
				);
			} else {
				return (<div className="fpdi-plan-details">
					<h1 className="marginLeft30">{Messages.getEditable("label.planFiledNoPermission", "fpdi-nav-label")}</h1>
				</div>);
			}
		} else {
			return (
				<div className="fpdi-plan-details">
					<PlanMacroTree plan={this.state.model} ref="tree" treeType={this.props.route.path}/>
					<div className="fpdi-plan-tabs">
						<PlanMacroTabPanel
							{...this.props}
							planMacro={this.state.model}
							ref={"tabpanel-" + this.state.planId}
							key={"tabpanel-" + this.state.planId}/>
					</div>
				</div>
			)
		}
	}
});
