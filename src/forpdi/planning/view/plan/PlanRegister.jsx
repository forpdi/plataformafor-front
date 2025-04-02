import _ from 'underscore';
import moment from 'moment';
import React from "react";
import {Link} from 'react-router';
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";
import VerticalForm from "forpdi/src/forpdi/planning/widget/attributeForm/VerticalForm.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import Messages from "forpdi/src/Messages.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';

var validation = Validation.validate;

export default React.createClass({
	contextTypes: {
		roles: React.PropTypes.object.isRequired,
		router: React.PropTypes.object,
		planMacro: React.PropTypes.object.isRequired,
		tabPanel: React.PropTypes.object,
		toastr: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired
	},
	getInitialState() {
		return {
			loading: true,
			modelId: null,
			model: null,
			fields: null,
			structures: null,
			structureError:false,
			vizualization: true,
			tabPath: this.props.location.pathname,
			undeletable: false,
			dateBegin: null,
			dateEnd: null,
		};
	},
	getFields() {
		var fields = [];
		const showName = !this.state.vizualization;
		if (showName) {
			fields.push({
				name: "name",
				type: "text",
				maxLength:255,
				required: true,
				placeholder: "",
				label: Messages.getEditable("label.name","fpdi-nav-label"),
				value: this.state.model ? this.state.model.get("name"):null
			});
		}
		fields.push({
			name: "begin",
			type: AttributeTypes.DATE_FIELD,
			required: true,
			placeholder: "",
			label: Messages.get("label.dateBegin"),
			onChange:this.onChangeBegin,
			value: this.state.dateBegin,
		},{
			name: "end",
			type: AttributeTypes.DATE_FIELD,
			required: true,
			placeholder: "",
			label: Messages.get("label.dateEnd"),
			onChange:this.onChangeEnd,
			value: this.state.dateEnd,
		});

		let selectedStructure;
		if (this.state.modelId) {
			selectedStructure = this.state.model.get("structure");
		} else {
			const { structures } = this.state;
			selectedStructure = structures && structures.length > 0 ? structures[0] : null;
		}
		fields.push({
			name: 'structureId',
			type: AttributeTypes.SELECT_STRUCTURE,
			required: this.state.modelId ? false : true,
			disabled: this.state.modelId ? true : false,
			placeholder: Messages.get("label.select.structurePlan"),
			label: Messages.get("label.structurePlan"),
			value: selectedStructure && selectedStructure.id,
			valueLabel: selectedStructure && selectedStructure.name,
			options: this.state.structures,
		});

		const description = this.state.model ? this.state.model.get("description") : null;
		fields.push({
			name: "description",
			type: AttributeTypes.TEXT_AREA_FIELD,
			placeholder: "",
			maxLength: 9000,
			label: Messages.getEditable("label.descriptionPlan","fpdi-nav-label"),
			value: description || Messages.get("label.descriptionNotInformed"),
		});

		return fields;
	},
	onChangeBegin(date){
		this.setState({
			dateBegin: date.format('DD/MM/YYYY'),
		});
	},
	onChangeEnd(date){
		this.setState({
			dateEnd: date.format('DD/MM/YYYY'),
		});
	},
	updateLoadingState(showName) {
		this.setState({
			fields: this.getFields(showName),
			loading:
				!this.state.structures
				|| (this.props.params.modelId && !this.state.model)
		});
	},
	componentDidMount() {
		var me = this;

		PlanStore.on("sync", (model) => {
			if (me.context.tabPanel) {
				me.context.tabPanel.removeTabByPath(me.props.location.pathname);
			}
			me.context.router.push("/plan/"+this.props.params.id+"/details/subplan/"+model.get("id"));
		}, me);

		PlanStore.on("retrieve", (model) => {
			if(!model.attributes.deleted){
				me.setState({
					dateBegin: model.get("begin").split(" ")[0],
					dateEnd: model.get("end").split(" ")[0],
				}, () => {
					me.setState({
						model: model,
						modelId: model.get("id"),
						title: model.get("name"),
						vizualization: true,
						undeletable: model.attributes.haveSons,
						fields: this.getFields(false),
					});
				})
				me.forceUpdate();
				_.defer(() => {this.context.tabPanel.addTab(this.props.location.pathname, model.get("name"));});
			}else{
				me.setState({
					model: null,
					modelId: null,
					title: null,
					vizualization: true
				});
				me.context.tabPanel.removeTabByPath(me.state.tabPath);
				me.context.router.push("/plan/"+this.props.params.id+"/details/overview");
			}
			me.updateLoadingState(false);
		}, me);

		PlanStore.on("planUpdated", (model) => {
			var mod = this.state.model;
			mod.attributes.name = model.data.name;
			mod.attributes.begin = model.data.begin;
			mod.attributes.end = model.data.end;
			mod.attributes.structure = model.data.structure;
			mod.attributes.description = model.data.description;
			me.setState({
				model: mod,
				title: model.data.name,
				vizualization: true,
				fields: me.getFields(true)
			});
			me.context.toastr.addAlertSuccess(Messages.get("label.successUpdatedGoalPlan"));
		}, me);

		StructureStore.on("find", (store) => {
			me.setState({
				structures: store.models
			});
			if(!store.models || store.models.length <=0){
				me.setState({
					structureError:true
				});
				if(me.context.roles.SYSADMIN) {
					me.context.toastr.addAlertError(Messages.get("label.msg.beforeGoalPlan"));
				} else {
					me.context.toastr.addAlertError(Messages.get("label.msg.beforeGoalPlanAdmin"));
				}
			}
			me.updateLoadingState(true);
		}, me);

		PlanStore.on('delete', store => {
			me.context.tabPanel.removeTabByPath(me.state.tabPath);
			me.context.router.push("/plan/"+this.props.params.id+"/details/overview");
			me.context.toastr.addAlertSuccess(store.attributes.name + " " + Messages.get("label.successDeleted"));
		}, me);

		me.refreshData(me.props, me.context);
	},
	componentWillUnmount() {
		PlanStore.off(null, null, this);
		StructureStore.off(null, null, this);
	},

	componentWillReceiveProps(newProps, newContext) {
		if (newProps.params.subplanId != this.props.params.subplanId) {
			this.setState({
				loading: true,
				modelId: null,
				model: null,
				fields: null,
				structureError:false,
				dateBegin: null,
				dateEnd: null,
			});
			this.refreshData(newProps, newContext);
		}
	},

	refreshData(props, context) {
		if (!this.state.structures) {
			StructureStore.dispatch({
				action: StructureStore.ACTION_FIND,
				data: null
			});
		}

		if (props.params.subplanId) {
			PlanStore.dispatch({
				action: PlanStore.ACTION_RETRIEVE_PLAN,
				data: props.params.subplanId
			});
		} else {
			this.setState({
				title: Messages.getEditable("label.newGoalPlan","fpdi-nav-label"),
				vizualization: false
			});
			if (this.state.structures) {
				_.defer(() => {this.updateLoadingState(true);});
			}
			_.defer(() => {context.tabPanel.addTab(props.location.pathname, Messages.get("label.newGoalPlan"));});
		}
	},

	refreshCancel () {
		Modal.hide();
	},

	onSubmit(formData) {
		var me = this;
		const { dateBegin, dateEnd } = this.state;

		if(this.state.structureError){
			this.context.toastr.addAlertError(Messages.get("label.msg.beforeGoalPlan"));
			return;
		}

		var validate = validation.validationPlanRegister(formData, this.refs.planRegisterForm, this.context.planMacro, dateBegin, dateEnd);
		if(validate.boolMsg){
			this.context.toastr.addAlertError(validate.msg);
			return;
		}

		const data = {
			...formData,
			parent: {
				id: me.props.params.id,
			},
			structure: {
				id: formData.structureId,
			},
			begin: dateBegin,
			end: dateEnd,
		};

		if (this.state.modelId) {
			var oldBeginDate = moment(me.state.model.attributes.begin,"DD/MM/YYYY").toDate(); // data início que estava no banco
			var oldEndDate = moment(me.state.model.attributes.end,"DD/MM/YYYY").toDate(); // data fim que estava no banco

			var newBeginDate = moment(data.begin,"D/M/YYYY").toDate(); // data início nova
			var newEndDate = moment(data.end,"D/M/YYYY").toDate(); // data fim nova
			var msg = "";
			if(oldEndDate > newEndDate || oldEndDate < newEndDate || oldBeginDate > newBeginDate || oldBeginDate < newBeginDate){ // se houver alguma alteração de datas
				msg = Messages.get("label.modifyDate");
			}else{
				msg = Messages.get("label.msgUpdate");
			}
			Modal.confirmCustom(() => {
				me.state.model.set(data);
				Modal.hide();
				
				PlanStore.dispatch({
					action: PlanStore.ACTION_CUSTOM_UPDATE,
					data: {
						...data,
						id: this.state.modelId,
					},
				});
				
			},msg,this.refreshCancel);
		} else {
			PlanStore.dispatch({
				action: PlanStore.ACTION_CREATE,
				data,
			});
		}
	},

	onCancel() {
		if (this.state.modelId) {
			this.setState({
				vizualization: true,
				fields: this.getFields(false)
			});
		} else {
			this.context.tabPanel.removeTabByPath(this.props.location.pathname);
		}
	},

	changeVizualization() {
		this.setState({
			vizualization: false,
			fields: this.getFields(true)
		});
	},

	deletePlan() {
		var me = this;
		if (me.state.model != null) {
			var msg = Messages.get("label.deleteConfirmation") + " " +me.state.model.attributes.name+"?";
			Modal.confirmCancelCustom(() => {
				Modal.hide();
				PlanStore.dispatch({
					action: PlanStore.ACTION_DELETE_PLAN,
					data: me.state.model
				});
			},msg,this.refreshCancel);
		}
	},

	renderArchivePlanMacro() {
		return (
			<ul className="dropdown-menu">
				<li>
					<a onClick={this.deleteLevelAttribute}>
						<span className="mdi mdi-pencil disabledIcon" title={Messages.get("label.title.unableArchivedPlan")}>
							<span id="menu-levels">	{Messages.getEditable("label.title.unableArchivedPlan","fpdi-nav-label")} </span>
						</span>
					</a>
				</li>
			</ul>
		);

	},

	renderUnarchivePlanMacro() {
		return (
			<ul id="level-menu" className="dropdown-menu">
				<li>
					<Link
						to={"/plan/"+this.state.model.get("parent").id+"/details/subplan/"+this.state.model.get("id")}
						onClick={this.changeVizualization}>
						<span className="mdi mdi-pencil cursorPointer" title={Messages.get("label.title.editInformation")}>
							<span id="menu-levels"> {Messages.getEditable("label.title.editInformation","fpdi-nav-label")} </span>
						</span>
					</Link>
		         </li>
		         {this.state.undeletable ?
		         <li>
					<Link
						to={"/plan/"+this.state.model.get("parent").id+"/details/subplan/"+this.state.model.get("id")}>
						<span className="mdi mdi-delete disabledIcon cursorPointer" title={Messages.get("label.notDeletedHasChild")}>
							<span id="menu-levels"> {Messages.getEditable("label.deletePlanGoals","fpdi-nav-label")}</span>
						</span>
					</Link>
		         </li>
		         :
		         <li>
					<Link
						to={"/plan/"+this.state.model.get("parent").id+"/details/subplan/"+this.state.model.get("id")}
						onClick={this.deletePlan}>
						<span className="mdi mdi-delete cursorPointer" title={Messages.get("label.deletePlanGoals")}>
							<span id="menu-levels"> {Messages.getEditable("label.deletePlanGoals","fpdi-nav-label")} </span>
						</span>
					</Link>
		         </li>
		     	}

			</ul>
		);
	},

	renderBreadcrumb() {
		return(
			<div>
				<span>
					<Link className="fpdi-breadcrumb fpdi-breadcrumbDivisor"
						to={'/plan/'+this.context.planMacro.attributes.id+'/details/'}
						title={this.context.planMacro.attributes.name}>{this.context.planMacro.attributes.name.length > 15 ? this.context.planMacro.attributes.name.substring(0, 15)+"..." : this.context.planMacro.attributes.name.substring(0, 15)
					}</Link>
					<span className="mdi mdi-chevron-right fpdi-breadcrumbDivisor"></span>
				</span>
				<span className="fpdi-breadcrumb fpdi-selectedOnBreadcrumb">
					{this.state.title > 15 ? this.state.title.substring(0, 15)+"..." : this.state.title.substring(0, 15)}
				</span>
			</div>
		);
	},

	render() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		return <div>
			{this.state.model ? this.renderBreadcrumb() : ""}

			<div className="fpdi-card fpdi-card-full floatLeft">

			<h1>
				{(this.state.title)}
				{this.state.model && (this.context.roles.ADMIN || _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION))  ?
					(<span className="dropdown">
						<a
							className="dropdown-toggle"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="true"
							title={Messages.get("label.actions")}
						>
							<span className="sr-only">{Messages.getEditable("label.actions","fpdi-nav-label")}</span>
							<span className="mdi mdi-chevron-down" />
						</a>

						{this.context.planMacro.attributes.archived ? this.renderArchivePlanMacro() : this.renderUnarchivePlanMacro()}

					</span>
				):""}
			</h1>
			<VerticalForm
				vizualization={this.state.vizualization}
				ref='planRegisterForm'
				onCancel={this.onCancel}
				onSubmit={this.onSubmit}
				fields={this.getFields()}
				store={PlanStore}
				submitLabel={Messages.get("label.submitLabel")}
				dateBegin={this.state.dateBegin}
				dateEnd={this.state.dateEnd}
			/>
		</div>
		</div>;
	}
});
