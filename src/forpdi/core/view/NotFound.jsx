import React from "react";
import Messages from "forpdi/src/Messages.jsx";
import AppFORLogo from "forpdi/img/plataforma-for-logo.png";

export default React.createClass({
	render() {
		return (<div>
			<div className="fpdi-error-404">
				<div className="row">
					<div className="col-xs-12 text-center">
						<div className="fpdi-login-header">
							<img className="fpdi-login-brand" src={AppFORLogo} alt={Messages.get("label.forRiscoLogo")} />
							<center ><h3 className="frisco-login-subtitle">{Messages.get("label.login.titlePlatformComplement")}<br/>
							{/*Messages.getEditable("label.login.title","fpdi-nav-label")*/}</h3></center>
						</div>
					</div>
				</div>
				<div className="container-fluid text-center">
					<h1>{Messages.getEditable("label.notFound","fpdi-nav-label")}</h1>
					<p>{Messages.getEditable("label.addressNotExist","fpdi-nav-label")}</p>
					<a className="btn btn-primary" href="/">{Messages.getEditable("label.returnToHomePage","fpdi-nav-label")}</a>
				</div>
			</div>
		</div>);
	}
});
