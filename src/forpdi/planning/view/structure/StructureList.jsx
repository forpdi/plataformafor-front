
import _ from 'underscore';
import React from "react";
import {Link} from 'react-router';

import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";

import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import Pagination from "forpdi/src/forpdi/core/widget/Pagination.jsx";
import CompanyStore from "forpdi/src/forpdi/core/store/Company.jsx";
import Messages from "forpdi/src/Messages.jsx";
//import Toastr from 'toastr';

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired
	},
	getInitialState() {
		return {
			loading: true,
		};
	},
	componentDidMount() {
		var me = this;

		if (EnvInfo.company) {
			StructureStore.on('find', store => {
				me.setState({
					loading: false,
					models: store.models
				});
			}, me);
			StructureStore.on("fail", (msg) => {
				this.context.toastr.addAlertError(msg);
			}, me);
			StructureStore.on('destroy', store => {
				me.refs['paginator'].load(0);
				this.context.toastr.addAlertSuccess(Messages.get("notification.structure.delete"));
			}, me);
		}
	},
	componentWillUnmount() {
		StructureStore.off(null, null, this);
	},

	cancelBlockUnblock () {
		Modal.hide();
	},

	deleteRecord(model, event) {
		var msg = Messages.get("label.deleteConfirmation") + " " + model.get("name") + "?";
		event.preventDefault();

		Modal.confirmCancelCustom(() => {
			Modal.hide();
			StructureStore.dispatch({
				action: StructureStore.ACTION_DESTROY,
				data: model
			});
		},msg,this.cancelBlockUnblock);
	},

	importStructure(evt) {
		var me = this;
		evt.preventDefault();
		var formatsBlocked = "(exe*)";


		Modal.uploadFile(
			Messages.get("label.importEstructure"),
			<p>{Messages.get("label.uploadXml")}</p>,
			StructureStore.url+"/import",
			"xml/*",
			formatsBlocked,
			(response) => {
				me.refs['paginator'].load(0);
				Modal.hide();
				//Toastr.remove();
				//Toastr.success("Estrutura " +response.data.name + " importada com sucesso.");
				this.context.toastr.addAlertSuccess( Messages.get("label.structure") + " " +response.data.name + " " + Messages.get("label.success.importing"));
			},
			(response) => {
				Modal.hide();
				this.context.toastr.addAlertError(response.message);
			},
			"xml."
		);

	},

	renderRecords() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}

		if (!this.state.models || (this.state.models.length <= 0)) {
			return <p><i>{Messages.getEditable("label.noStructureRegistred","fpdi-nav-label")}</i></p>;
		}
		return (<div className="row planStructures">
			{this.state.models.map((model, idx) => {
				return (<div key={"company-"+idx} className="col-md-4 col-sm-6">
					<div className="fpdi-card fpdi-card-full">
						<div className="row">
							<div className="fpdi-card-title col-md-6 col-sm-7 col-xs-8">
								<span>{model.get("name")}</span>
							</div>
							<div className="text-right col-md-6 col-sm-5 col-xs-4">
								<Link
									to={"/structures/preview/"+model.get("id")}
									className="mdi mdi-eye"
									title={Messages.get("label.view")}
									data-placement="top"
								/>
								<a
									onClick={this.deleteRecord.bind(this, model)}
									className="mdi mdi-delete marginRight0"
									title={Messages.get("label.delete")}
									data-placement="top"
								/>
							</div>
						</div>
						<p>{model.get("description")}</p>
					</div>
				</div>);
			})}
		</div>);
	},

	renderNotCreatedCompanyMsg() {
		return (
			<p>
				<i>{Messages.getEditable("label.createStructure","fpdi-nav-label")}</i>
			</p>
		)
	},

	render() {
		if (this.props.children) {
			return this.props.children;
		}

		const hasCompanyCreated = EnvInfo.company;

		return (<div className="container-fluid animated fadeIn">
			<h1>{Messages.get("label.structures")}</h1>
			<div className="fpdi-action-list text-right">
				<a
					className="btn btn-sm btn-primary"
					onClick={hasCompanyCreated && this.importStructure}
					disabled={!hasCompanyCreated}
				>
					{Messages.getEditable("label.importEstructurePdi", `fpdi-nav-label ${!hasCompanyCreated && 'cursor-not-allowed'}`)}
				</a>
			</div>

			{
				hasCompanyCreated
					? this.renderRecords()
					: this.renderNotCreatedCompanyMsg()
			}

			<Pagination store={StructureStore} ref="paginator" />
		</div>);
	  }
	});
