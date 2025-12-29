import React from "react";
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
                <div style={{ padding: '0 25px' }}>
                    <style dangerouslySetInnerHTML={{__html: `
                        .modal-dialog {
                            width: 650px !important;
                            max-width: 95% !important;
                        }
                    `}} />

                    <ToastContainer ref="container" className="toast-top-center" />
                    <VerticalForm
                        onSubmit={this.acceptTerms}
                        hideCanel
                        fields={[{
                            name: "termsAccepted",
                            type: "checkbox",
                            placeholder: "",
                            required: true,
                            label: <p style={{ "textAlign": "left", "marginBottom": "0" }}>
                                Ao me inscrever na Plataforma For, declaro estar ciente das condições relativas ao tratamento dos meus dados pessoais contidas no
                                <a href={privacyWarningPath} target="_blank" style={{ marginLeft: '4px', marginRight: '4px' }}>Aviso de Privacidade</a>,
                                nos termos da LGPD - Lei Geral de Proteção de Dados Pessoais.
                            </p>,
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
    if (!EnvInfo.company) {
      return <h3 className="marginLeft30">{Messages.get('label.noCompanyRegistered')}</h3>;
    }
		return (
			<div className="dashboard-container">
				<h3 className="mb-4" style={{
					color: '#293a59',
					fontWeight: '600',
					fontSize: '22px',
					marginLeft: '30px'
				}}>
					{Messages.getEditable("label.dashboard", "fpdi-nav-label")}
				</h3>

				<div className="d-flex align-items-center flex-wrap gap-3 mb-4">

					<div className="d-flex align-items-center" style={{ marginTop: '0', marginLeft: '30px' }}>
						<span className="fpdi-nav-label me-2">
							{Messages.getEditable("label.title.plan", "fpdi-nav-label")}
						</span>
						<select
							onChange={this.planMacroChange}
							className="form-select form-select-sm dashboard-select-box w-auto"
							ref="selectPlanMacro"
							disabled={!this.state.loaded}
							style={{ minWidth: '150px', paddingLeft: '8px'}}
						>
							<option value={-1} title={Messages.get("label.viewAll")}>
								{Messages.get("label.viewAll")}
							</option>
							{
								this.state.plans.map((attr, idy) => {
									let name = attr.name || attr.get("name");
									return (
										<option
											key={attr.id || attr.get('id')}
											value={idy}
											title={name}
										>
											{name.length > 20 ? name.trim().substring(0, 20) + "..." : name}
										</option>
									);
								})
							}
						</select>
					</div>

					{/* GRUPO 2: Metas/Subplano */}
					<div className="d-flex align-items-center">
						<span className="fpdi-nav-label me-2">
							{Messages.getEditable("label.title.goalsPlan", "fpdi-nav-label")}
						</span>
						<select
							onChange={this.subplanChange}
							ref="selectSubplan"
							className={
								(this.state.selectedPlan < 0)
									?
									"form-select form-select-sm dashboard-select-box dashboard-select-box-disabled w-auto"
									:
									"form-select form-select-sm dashboard-select-box w-auto"
							}
							disabled={this.state.selectedPlan < 0}
							style={{ minWidth: '150px', paddingLeft: '8px' }}
						>
							<option value={-1} title={Messages.get("label.viewAll")}>
								{Messages.get("label.viewAll")}
							</option>
							{
								(this.state.subplans)
									?
									(this.state.subplans.map((attr, idy) => {
										return (
											<option key={attr.id} value={idy} title={attr.name}>
												{attr.name.length > 20 ? attr.name.trim().substring(0, 20) + "..." : attr.name}
											</option>
										);
									}))
									:
									("")
							}
						</select>
					</div>

					{/* GRUPO 3: Botão */}
					<div>
						<button
							type="button"
							className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center"
							onClick={this.cleanFilters}
							style={{
								height: '35px',
								paddingTop: 0,
								paddingBottom: 0,
								paddingLeft: '12px',
								paddingRight: '12px',
								marginLeft: '5px'
							}}
						>
							<span className="mdi mdi-filter-off me-1" />
							{Messages.getEditable("label.filterClean", "fpdi-nav-label")}
						</button>
					</div>
				</div>

				{this.showTerms()}
				{this.renderDashboard()}
			</div>
		);
	}
});
