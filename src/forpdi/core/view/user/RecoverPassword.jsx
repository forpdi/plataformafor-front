
import React from "react";
import Form from "forpdi/src/forpdi/core/widget/form/Form.jsx";
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import Messages from "forpdi/src/Messages.jsx";
import Toastr from 'toastr';

import AppFORLogo from "forpdi/img/plataforma-for-logo.svg";

var VerticalForm = Form.VerticalForm;

var ReactToastr = require("react-toastr");
var { ToastContainer } = ReactToastr;
import { toastrConfig } from "forpdi/src/consts";

export default React.createClass({

	contextTypes: {
		router: React.PropTypes.object,
	},

	getInitialState() {
		return {
			fields: [{
				name: "email",
				type: "email",
				required: true,
				placeholder: "",
				label: Messages.getEditable("label.email", "fpdi-nav-label")
			}]
		};
	},
	onSubmit(data) {
		if (data.email != "") {
			UserSession.dispatch({
				action: UserSession.ACTION_RECOVER_PASSWORD,
				data: data
			});
		} else {
			this.addAlertError(Messages.get("label.error.emptyEmail"));
		}
	},
	onCancel() {
		this.context.router.push("/login")
	},
	componentWillMount() {
		UserSession.on("recoverpassword", model => {
			if (model.success) {
				Modal.confirm(
					Messages.get("label.attention"),
					Messages.get("label.recoveryPasswordRecovery") + " " + model.message + "." + "  " + Messages.get("label.recoveryPasswordRecoverySpam"),
					() => {
						Modal.hide();
						location.assign("#/");
					});
			} else {
				Toastr.error(model.message)
			}
		}, this);
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

	render() {
		return (
			<div className="container-fluid">
				<ToastContainer ref="container"
					className="toast-top-center" />
				<div className="row">
					<div className="col-xs-12 text-center">
						<div className="fpdi-login-header">
							<img className="fpdi-login-brand" src={AppFORLogo} alt={Messages.get("label.forRiscoLogo")} />
							<center ><h3 className="frisco-login-subtitle">{Messages.get("label.login.titlePlatformComplement")}<br />
								{/*Messages.getEditable("label.login.title","fpdi-nav-label")*/}</h3></center>
						</div>
					</div>
				</div>

				<div className="row">
					<div className="col-md-4 col-md-offset-4">
						<div className="fpdi-card-login">
							<div className="panel panel-default">
								<div className="panel-heading"><p className="fpdi-login-title"> {Messages.getEditable("label.title.recoverPassword", "fpdi-nav-label")}</p></div>
								<div className="panel-body">

									<p className="fpdi-recover-password-title">{Messages.getEditable("label.emailRecoveryPassword", "fpdi-nav-label")}</p>
									<div className="fpdi-login-body">
										<VerticalForm
											onSubmit={this.onSubmit}
											fields={this.state.fields}
											store={UserSession}
											submitLabel={Messages.get("label.submit.passwordRecoveryEmail")}
											blockButtons={true}
											onCancel={this.onCancel}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		);
	}
});
