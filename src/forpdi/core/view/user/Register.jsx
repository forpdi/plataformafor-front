
import React from "react";
import { ToastContainer } from 'react-toastr';

import Form from "forpdi/src/forpdi/core/widget/form/Form.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';

import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";

import Messages from "forpdi/src/Messages.jsx";

import AppFORLogo from "forpdi/img/plataforma-for-logo.svg";

import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import { toastrConfig, useTermsPath, privacyWarningPath } from "forpdi/src/consts";
//import Toastr from 'toastr';

var Validate = Validation.validate;

var VerticalForm = Form.VerticalForm;



export default React.createClass({
	contextTypes: {
		router: React.PropTypes.object,
	},
	getInitialState() {
		return {
			fields: [{
				name: "name",
				type: "text",
				placeholder: "",
				required: true,
				maxLength:255,
				label: Messages.getEditable("label.name","fpdi-nav-label")
			},{
				name: "cpf",
				type: "cpf",
				placeholder: "",
				required: true,
				label: Messages.getEditable("label.cpf","fpdi-nav-label")
			},
			// {
			// 	name: "birthdate",
			// 	type: "date",
			// 	placeholder: "",
			// 	required: true,
			// 	onChange:this.onBirthDateChange,
			// 	label: Messages.getEditable("label.birthdate","fpdi-nav-label")
			// },
			{
				name: "cellphone",
				type: "tel",
				placeholder: "",
				required: true,
				label: Messages.getEditable("label.cellphone","fpdi-nav-label")
			},{
				name: "phone",
				type: "tel",
				placeholder: "",
				label: Messages.getEditable("label.phone","fpdi-nav-label")
			},{
				name: "department",
				type: "text",
				placeholder: "",
				maxLength:255,
				label: Messages.getEditable("label.department","fpdi-nav-label")
			},{
				name: "password",
				type: "password",
				placeholder: "",
				required: true,
				maxLength:255,
				label: Messages.getEditable("label.password","fpdi-nav-label")
			},{
				name: "passwordconfirm",
				type: "password",
				placeholder: "",
				required: true,
				maxLength:255,
				label: Messages.getEditable("label.passwordConfirm","fpdi-nav-label")
			},{
				name: "termsAccepted",
				type: "checkbox",
				placeholder: "",
				required:true,
				label: <p style={{ textTransform: 'none' }}>Ao me inscrever na Plataforma For, declaro estar ciente das condições relativas ao tratamento dos meus dados pessoais contidas no <a href={privacyWarningPath} target="_blank">Aviso de Privacidade</a> e <a href={useTermsPath} target="_blank">Termo de Uso</a>, nos termos da LGPD - Lei Geral de Proteção de Dados Pessoais.</p>,
				value: false,
				fieldLabel: "Aviso de Privacidade e Termo de Uso",
			}],
			loading: true,
			valid: false
		};
	},
	componentDidMount() {
		if (!!UserSession.get("logged") && false) {
			location.assign("#/home");
		} else {
			this.setState({loaded: true});
		}
		var me = this;
		UserSession.on("register", model => {
			me.addAlertSuccess(Messages.get("label.sucess.registrationCompleted"));
			me.setState({
				valid: false,
				confirmed: true
			})
			//location.assign("#/");
		}, me);

		UserSession.on("registertoken", (valid) => {
			me.setState({
				valid: valid,
				loading: false
			});
		}, me);

		UserSession.dispatch({
			action: UserSession.ACTION_CHECK_REGISTER_TOKEN,
			data: this.props.params.token
		});
	},
	componentWillUnmount() {
		UserSession.off(null, null, this);
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

	onBirthDateChange(data){
		var model = this.state.model;
		this.setState({
			model:model,
		});

		// FIXME Por que não colocou isso no VerticalInput?
		if(data != null){
			this.refs.registerForm.refs.birthdate.props.fieldDef.value = data.format('DD/MM/YYYY');
		}else{
			this.refs.registerForm.refs.birthdate.props.fieldDef.value = "";
		}
	},


	onSubmit(data) {
		data.token = this.props.params.token;

		// data.birthdate = this.refs.registerForm.refs.birthdate.props.fieldDef.value;
		// var birthdate = moment(data.birthdate,"DD/MM/YYYY");
		// var actualDate = moment();
		var errorField = Validate.validationProfileUser(data, this.refs.registerForm);

		if(errorField){
			this.addAlertError(Messages.get("label.error.form"));
			return;
		}

		UserSession.dispatch({
			action: UserSession.ACTION_REGISTER_USER,
			data: data
		});
		return true;
	},

	render() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		return (

			<div className="container-fluid">
				<ToastContainer ref="container" className="toast-top-center" />
				<div className="row">
					<div className="col-xs-12 text-center">
						<div className="fpdi-login-header">
							<img className="fpdi-login-brand" src={AppFORLogo} alt={Messages.get("label.forRiscoLogo")} />
							<center ><h3 className="frisco-login-subtitle">{Messages.get("label.login.titlePlatformComplement")}<br/>
							{/*Messages.getEditable("label.login.title","fpdi-nav-label")*/}</h3></center>
						</div>
					</div>
				</div>

				<div className="row">
					{this.state.valid ?
							<div className="col-md-4 col-md-offset-4">
								<div className="fpdi-card-login">
									<div className="panel panel-default">
									  <div className="panel-heading"><p className="fpdi-login-title">{Messages.getEditable("label.completeRegistration","fpdi-nav-label")}</p></div>
									  	<div className="panel-body">
									  		  <p className="fpdi-recover-password-title">{Messages.getEditable("label.dataCompleteRegistration","fpdi-nav-label")}</p>
												<div className="fpdi-login-body">
														<VerticalForm
															ref="registerForm"
															onSubmit={this.onSubmit}
															fields={this.state.fields}
															store={UserSession}
															submitLabel={Messages.get("label.submit.finishRegistration")}
															blockButtons={true}
														/>
												</div>
										</div>
									</div>
								</div>
							</div>
						:
						<div className="col-md-4 col-md-offset-4">
							<div className="fpdi-login-header">
								<h1>{this.state.confirmed ? Messages.getEditable("label.registrationSuccessfullyCompleted","fpdi-nav-label")  :
								 Messages.getEditable("label.pageNotAvailable","fpdi-nav-label")}</h1>
								<p><a className="btn btn-sm btn-primary" href="/">{Messages.getEditable("label.returnToHomePage","fpdi-nav-label")}</a></p>
							</div>
						</div>
					}
				</div>

			</div>
		);
	}
});
