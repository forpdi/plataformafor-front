
import React from "react";
import { Link } from "react-router";
import { ToastContainer } from 'react-toastr';

import Form from "forpdi/src/forpdi/core/widget/form/Form.jsx";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import Messages from "forpdi/src/Messages.jsx";
import AppLogo from "forpdi/img/plataforma-for-logo.svg";
import LoginComunidades from "forpdi/img/login-comunidades.png";
import SeloGovImage from "forpdi/img/selo_gov_sem_fundo.png";
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import { toastrConfig, privacyWarningPath } from "forpdi/src/consts";
import LogoFPDI from "forpdi/img/logo.png";
import LogoFRISCO from "forpdi/img/forrisco-logo.png";

var Validate = Validation.validate;

var VerticalForm = Form.VerticalForm;

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			loaded: !UserSession.get("loading"),
			fields: [{
				name: "email",
				type: "email",
				placeholder: "Informe seu e-mail",
				required:true,
				label: Messages.getEditable("label.email","fpdi-nav-label")
			},{
				name: "password",
				type: "password",
				placeholder: "Informe sua senha",
				required:true,
				label: Messages.getEditable("label.password","fpdi-nav-label"),
				visible: false,
			}],
		};
	},

	onChangeVisibility() {
		const newFields = this.state.fields;
		newFields[1].visible = !newFields[1].visible;
		this.setState({ fields: newFields });
	},

	onSubmit(data) {
		const { captchaToken } = this;
		if (process.env.REACT_APP_RECAPTCHA_DISABLED !== 'true' && !captchaToken) {
			this.addAlertError(Messages.get("label.error.captchaIsRequired"));
			return;
		}
		Validate.validationLogin(this.refs["login"]);

		UserSession.dispatch({
			action: UserSession.ACTION_LOGIN,
			data: { data, captchaToken },
		});
	},

	setCaptchaToken(token) {
		this.captchaToken = token;
	},

	addAlertError(msg) {
		this.refs.container.clear();
		this.refs.container.error(
			msg, null, toastrConfig);
	},

	componentWillMount() {
		var me = this;
		UserSession.on("login", model => {
			var url = window.location.href.split("#");
			var path = url[1].split("?");
			if (path[0] == "/login")
				if (EnvInfo.company && EnvInfo.company.enableForrisco) {
					location.assign("#/app-select");
				} else {
					location.assign("#/home");
				}
		}, me);
		UserSession.on("loaded", () => {
			me.setState({ loaded: true });
		}, me);

	},

	componentDidMount() {
		if (!!UserSession.get("logged")) {
			if (EnvInfo.company && EnvInfo.company.enableForrisco) {
				location.assign("#/app-select");
			} else {
				location.assign("#/home");
			}
		} else {
			this.setState({ loaded: true });
		}
	},

	componentWillUnmount() {
		UserSession.off(null, null, this);
	},

	// renderResetPasswordAlert() {
	// 	const passwordReset = localStorage.getItem("password-reset")
	// 	if (passwordReset) {
	// 		return null;
	// 	}
	// 	return (
	// 		<div style={{
	// 			height: '70px',
	// 			background: '#ffe49a',
	// 			color: '#6a5521',
	// 			position: 'fixed',
	// 			top: 0,
	// 			left: 0,
	// 			width: '100%',
	// 			padding: '10px 15px',
	// 			display: 'flex',
	// 			justifyContent: 'space-around',
	// 			alignItems: 'center',
	// 			zIndex: 900
	// 		}}>
	// 			<p style={{ margin: 0 }}>
	// 				Informamos que foram realizadas atualizações de segurança na Plataforma For. Por medida de precaução, solicitamos a todos que procedam com a recuperação de senha. Após esse processo, será necessário efetuar o login utilizando a nova senha gerada.
	// 				Agradecemos pela compreensão e colaboração.
	// 			</p>
	// 			<Link
	// 				to="/recover-password"
	// 				style={{
	// 					width: '200px',
	// 					textAlign: 'center',
	// 					marginLeft: '30px'
	// 				}}
	// 			>
	// 				Recuperar senha
	// 			</Link>
	// 		</div>
	// 	);
	// },

	render() {
		if (!this.state.loaded) {
			return <LoadingGauge />;
		}

		return (
			<div className="container-fluid">
				{/* {this.renderResetPasswordAlert()} */}
				<ToastContainer ref="container" className="toast-top-center" />
				<div className="row">
					<div className="col-xs-12 text-center">
						<div className="fpdi-login-header">
							<img
								className="fpdi-login-brand"
								src={AppLogo}
								alt={Messages.getEditable("label.forRiscoLogo","fpdi-nav-label")}
							/>
							<img
								className="fpdi-login-brand"
								style={{ maxHeight: '140px' }}
								src={SeloGovImage}
								alt="Selo de modernidade da Política Nacional de Modernização do Estado"
							/>
							<center>
								<h3 className="frisco-login-subtitle">
									{Messages.get("label.login.titlePlatformComplement")}<br/>
									{/* Messages.getEditable("label.login.title","fpdi-nav-label") */}
								</h3>
							</center>
						</div>
					</div>
				</div>
		    <div className="fpdi-login-community">
					<div className="fpdi-login">
						<div className="fpdi-card-login">
							<div className="panel panel-default">
							  <div className="panel-heading" style={{display: 'flex'}}>
									<p className="fpdi-login-title">
										{Messages.getEditable("label.login","fpdi-nav-label")}
										<span>&nbsp;</span>
									</p>
									<p className="fpdi-login-title" style={{fontWeight: '300'}}>
										{Messages.getEditable("label.forPlataformaForLogo","fpdi-nav-label")}
									</p>
								</div>
							  <div className="panel-body">
									<div>
										<p className="fpdi-login-description">
											{Messages.getEditable("label.loginDescription","fpdi-nav-label")}
										</p>
									</div>
									<div className="fpdi-login-body">
										<VerticalForm
											ref="login"
											onSubmit={this.onSubmit}
											fields={this.state.fields}
											store={UserSession}
											hideCanel={true}
											submitLabel={Messages.get("label.LogIn")}
											blockButtons={true}
											confirmKey={13}
											setCaptchaToken={this.setCaptchaToken}
											id="login-form"
											buttonUppercase
											onChangeVisibility={this.onChangeVisibility}
										/>
									</div>

									<div className="fpdi-login-footer">
										<div style={{display: 'flex', justifyContent: 'space-between'}}>
											<div>
												<Link to="/recover-password">{Messages.getEditable("label.recoverPassword","fpdi-nav-label")}</Link>
											</div>
											<div className="marginBottom5">
												<a href={privacyWarningPath} target="_blank">Aviso de Privacidade</a>
											</div>
										</div>
									</div>
							  </div>
							</div>
						</div>

						<div className="fpdi-browsers-info">
							{Messages.getEditable("label.infoBrowsers","fpdi-nav-label")}<br/>
							<i>{Messages.getEditable("label.browsers","fpdi-nav-label")}</i>
						</div>
					</div>
					<div className="fpdi-community">
						<p className="fpdi-login-title" style={{padding: '0px 0px 10px 0px', marginTop: '-0.77px'}}>
							{Messages.getEditable("label.community","fpdi-nav-label")}
						</p>
						<p className="fpdi-community-description">
							{Messages.getEditable("label.communityDashboard","fpdi-nav-label")}
							<b> {Messages.getEditable("label.communityDescriptionBold","fpdi-nav-label")} </b>
							{Messages.getEditable("label.communityDescription","fpdi-nav-label")}
						</p>
            {
              EnvInfo.company ? (
                <div>
                  <b>Acessar comunidade</b>
                  <div className="fpdi-community-access" style={{ display: 'flex', marginTop: '10px' }}>
                    <Link to="/comunidade/forpdi">
                        <img src={LogoFPDI} alt="ForPDI" className="for-community-logo"/>
                      <button className="fpdi-community-button">
                      </button>
                    </Link>
                    <Link to="/comunidade/forrisco">
                      <button className="forrisco-community-button">
                        <img src={LogoFRISCO} alt="ForRisco" className="for-community-logo"/>
                      </button>
                    </Link>
                  </div>
                </div>
              ) : <p className="fpdi-community-access">Cadastre uma instituição no sistema para acessar a comunidade.</p>
            }
						<img
							className="fpdi-login-community-image"
							style={{ marginTop: '15px'}}
							src={LoginComunidades}
							alt={Messages.getEditable("label.forRiscoLogo","fpdi-nav-label")}
						/>
					</div>
				</div>
			</div>
		);
	}
});
