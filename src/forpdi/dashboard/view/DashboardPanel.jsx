import React from "react";
import string from 'string';
import Messages from "forpdi/src/Messages.jsx";

import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import PlanStore from "forpdi/src/forpdi/planning/store/Plan.jsx";
import DashboardAdminView from "forpdi/src/forpdi/dashboard/view/DashboardAdminView.jsx";
import DashboardColaboratorView from "forpdi/src/forpdi/dashboard/view/DashboardColaboratorView.jsx";
import DashboardManagerView from "forpdi/src/forpdi/dashboard/view/DashboardManagerView.jsx";

import { ToastContainer } from 'react-toastr';
import { toastrConfig, privacyWarningPath } from "forpdi/src/consts";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import Form from "forpdi/src/forpdi/core/widget/form/Form.jsx";
var VerticalForm = Form.VerticalForm;
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
var Validate = Validation.validate;

export default React.createClass({
	contextTypes: {
		router: React.PropTypes.object,
		accessLevel: React.PropTypes.number.isRequired,
		accessLevels: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
		needAcceptTerms: React.PropTypes.bool,
		roles: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			plans: [],
			selectedPlan: -1,
			subplans: [],
			selectedSubplan: -1,
			loaded: false,
			needAcceptTerms: !UserSession.get("termsAcceptance"),
		};
	},

	componentDidMount() {
		var me = this;

		// Listener que aguarda uma listagem de planos macros
		PlanMacroStore.on("find", (store) => {
			me.setState({
				plans: store.models.filter(model => !model.get('archived')),
				loaded: true,
			});
			me.forceUpdate();
		}, me);

		// Listener que aguarda uma listagem de planos de metas de um plano macro
		PlanStore.on("find", (store, raw, opts) => {
			me.setState({
				subplans: raw,
			});
			me.forceUpdate();
		}, me);

		// Dispatcher para obter os planos macros
		if (EnvInfo.company !== null) {
			PlanMacroStore.dispatch({ action: PlanMacroStore.ACTION_FIND });
		}
	},

	componentWillUnmount() {
		PlanStore.off(null, null, this);
		PlanMacroStore.off(null, null, this);
	},
	addAlertError(msg) {
		this.refs.container.clear();
		this.refs.container.error(
			msg, null, toastrConfig);
	},
	addAlertSuccess(msg) {
		this.refs.container.clear();
		this.refs.container.success(
			msg, null, toastrConfig);
	},
	showTerms() {
		if (this.state.needAcceptTerms) {
			Modal.acceptTerms(
				'Aviso de Privacidade',
				<div>
					<ToastContainer ref="container" className="toast-top-center" />
					<VerticalForm 
						onSubmit={this.acceptTerms}
						hideCanel
						fields={[{
							name: "termsAccepted",
							type: "checkbox",
							placeholder: "",
							required: true,
							label: <p style={{"text-align": "left" /*"textTransform": 'none'*/}}>Ao me inscrever na Plataforma For, declaro estar ciente das condições relativas ao tratamento dos meus dados pessoais contidas no 
								<a href={privacyWarningPath} target="_blank">Aviso de Privacidade</a>, 
								nos termos da LGPD - Lei Geral de Proteção de Dados Pessoais.</p>,
							value: false,
							fieldLabel: "Aviso de privacidade",
						}]}
					/>
				</div>);
		}
	},
	acceptTerms(data) {
		if (!data.termsAccepted) {
			this.addAlertError(Messages.get("label.error.form"));
			return;
		}

		Modal.hide();

		UserSession.dispatch({
			action: UserSession.ACTION_REGISTER_TERMS,
			data: UserSession.get("user"),
		});

		this.setState({
			needAcceptTerms: false,
		});
	},
	planMacroChange(data) {
		// Verifica se a opção dos planos macro selecionada é a de todos os planos
		if (this.refs.selectPlanMacro.value == -1 && EnvInfo.company != null) {
			PlanMacroStore.dispatch({
				action: PlanMacroStore.ACTION_FIND
			});
			this.setState({
				selectedPlan: -1,
				selectedSubplan: -1,
				subplans: []
			});
		} else {
			this.setState({
				selectedPlan: this.state.plans[this.refs.selectPlanMacro.value],
				selectedSubplan: -1,
				subplans: []
			});
			PlanStore.dispatch({
				action: PlanStore.ACTION_FIND,
				data: {
					parentId: this.state.plans[this.refs.selectPlanMacro.value].get("id"),
				},
				opts: {
					wait: true
				}
			});
		}
	},

	subplanChange() {
		this.setState({
			selectedSubplan: (this.refs.selectSubplan.value == -1 ? -1 : this.state.subplans[this.refs.selectSubplan.value])
		});
		PlanStore.dispatch({
			action: PlanStore.ACTION_FIND,
			data: {
				parentId: this.state.plans[this.refs.selectPlanMacro.value].id,
			},
		});
	},

	cleanFilters() {
		
		this.refs.selectSubplan.value = -1;
		this.refs.selectPlanMacro.value = -1;

		this.setState({
			selectedPlan: -1,
			selectedSubplan: -1,
		});
	},

	renderDashboard() {
		if (this.context.roles.ADMIN) {
			return (<DashboardAdminView plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} />);
		} else if (this.context.roles.MANAGER) {
			return (<DashboardManagerView plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} />);
		} else if (this.context.roles.COLABORATOR) {
			return (<DashboardColaboratorView plan={this.state.selectedPlan} subPlan={this.state.selectedSubplan} />);
		}
	},

	render() {
		return (
			<div className="dashboard-container">
				<h1 className="marginLeft30">{Messages.getEditable("label.dashboard", "fpdi-nav-label")}</h1>
				<div className="marginLeft30">
					<span className="marginRight20 marginBottom10">
						<span className="fpdi-nav-label">
							{Messages.getEditable("label.title.plan", "fpdi-nav-label")}&nbsp;
						</span>
						<select
							onChange={this.planMacroChange}
							className="form-control dashboard-select-box"
							ref="selectPlanMacro"
							disabled={!this.state.loaded}
						>
							<option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>
								{Messages.get("label.viewAll")}
							</option>
							{
								this.state.plans.map((attr, idy) => {
									let name = attr.name || attr.get("name");
									return (
										<option
											key={attr.id || attr.get('id')}
											value={idy}
											data-placement="right"
											title={name}
										>
											{
												(name.length > 20)
													?
													(string(name).trim().substr(0, 20).concat("...").toString())
													:
													(name)
											}
										</option>
									);
								})
							}
						</select>
					</span>
					<span>
						<span className="fpdi-nav-label">
							{Messages.getEditable("label.title.goalsPlan", "fpdi-nav-label")}&nbsp;
						</span>
						<select
							onChange={this.subplanChange}
							ref="selectSubplan"
							className={
								(this.state.selectedPlan < 0)
									?
									"form-control dashboard-select-box dashboard-select-box-disabled"
									:
									"form-control dashboard-select-box"
							}
							disabled={
								(this.state.selectedPlan < 0)
									?
									("disabled")
									:
									("")
							}
						>
							<option value={-1} data-placement="right" title={Messages.get("label.viewAll")}>
								{Messages.get("label.viewAll")}
							</option>
							{
								(this.state.subplans)
									?
									(this.state.subplans.map((attr, idy) => {
										return (
											<option key={attr.id} value={idy} data-placement="right" title={attr.name}>
												{
													(attr.name.length > 20)
														?
														(string(attr.name).trim().substr(0, 20).concat("...").toString())
														:
														(attr.name)
												}
											</option>
										);
									}))
									:
									("")
							}
						</select>
					</span>
					<span className="marginLeft20">
						<a className="btn btn-sm btn-primary" onClick={this.cleanFilters}>
							<span
							/> {Messages.getEditable("label.filterClean", "fpdi-nav-label")}
						</a>
					</span>
				</div>
				{this.showTerms()}
				{this.renderDashboard()}
			</div>
		);
	}
});
