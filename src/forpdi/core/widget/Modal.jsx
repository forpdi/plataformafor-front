import _ from 'underscore';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import FeedbackPost from "forpdi/src/forpdi/core/widget/contact/FeedbackPost.jsx";
import ReportProblem from "forpdi/src/forpdi/core/widget/contact/ReportProblem.jsx";
import Messages from "forpdi/src/Messages.jsx";
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';
import VerticalInput from "forpdi/src/forpdi/core/widget/form/VerticalInput.jsx";
import AppStyledButton from 'forpdi/src/components/buttons/AppStyledButton';

var EL = document.getElementById("main-global-modal");
var NC = document.getElementById("main-global-modal-noclose")

var AlertModal = React.createClass({
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			<p>{this.props.message}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.ok")}</button>
	      			</div>
				</div>
			</div>
		);
	}
});


var NoClosableModal = React.createClass({
	getDefaultProps() {
		return {
			confirmText: Messages.get("label.ok"),
			confirmTitle: Messages.get("label.confirmation"),
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content fpdi-modal-confirmCustom">
					<div className="modal-header fpdi-modal-header">
	        			<h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel"><i className="mdi mdi-confirmModalCustom mdi-48px" id="modalIcon"></i> {this.props.confirmTitle}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal">
	      				<br/>
	        			<div id>{this.props.message}</div>
	      			</div>
				</div>
			</div>
		);
	}
});

var ConfirmModal = React.createClass({
	/*render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body">
	        			{this.props.message}
	      			</div>
	      			<div className="modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Cancelar</button>
	        			<button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>Confirmar</button>
	      			</div>
				</div>
			</div>
		);
	}*/

	getDefaultProps() {
		return {
			confirmText: Messages.get("label.ok"),
			confirmTitle: Messages.get("label.confirmation"),
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content fpdi-modal-confirmCustom">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.props.onConfirm}><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel"><i className="mdi mdi-confirmModalCustom mdi-48px mdi-checkbox-marked-circle" id="modalIcon"></i> {this.props.confirmTitle}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal">
	      				<br/>
	        			<div id>{this.props.message}</div>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	      				<button type="button" className="btn btn-sm btn-success modal-button" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});

var ConfirmModalCustom = React.createClass({
	getDefaultProps() {
		return {
			confirmText: Messages.get("label.yes"),
			declineText: Messages.get("label.no")
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content fpdi-modal-confirmCustom">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel"><i className="mdi mdi-confirmModalCustom mdi-48px mdi-checkbox-marked-circle" id="modalIcon"></i> {Messages.get("label.confirmation")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal">
	        			<p id>{this.props.text}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	      				<button type="button" className="btn btn-sm btn-success modal-button" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	        			<button type="button" className="btn btn-sm btn-default modal-button" onClick={this.props.onCancel} >{this.props.declineText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});



var ConfirmConviteUser = React.createClass({
	render() {
		var msg1 = (Messages.get("label.success.emailSent") + " ");
		var msg2 = Messages.get("label.success.userCompleteRegister");
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content fpdi-modal-confirmCustomUser">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel">{Messages.get("label.confirmation")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal modal-content-confirmUser">
						<p id> {msg1}<strong>{this.props.text}</strong>{msg2}</p>
	      			</div>
				</div>
			</div>
		);
	}
});

var CancelModalCustom = React.createClass({
	getDefaultProps() {
		return {
			confirmText: Messages.get("label.yes"),
			declineText: Messages.get("label.no")
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content fpdi-modal-confirmCustom">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			 <h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel"><i className=" mdi-cancelModalCustom mdi mdi-alert-circle" id="modalIcon"> </i> {Messages.get("label.alert")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal">
	        			<p id>{this.props.text}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	      				<button type="button" className="btn btn-sm btn-success modal-button" id = "cancelModalCustom" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	        			<button type="button" className="btn btn-sm btn-default modal-button" onClick={this.props.onCancel} >{this.props.declineText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});

var DeleteConfirmModal = React.createClass({
	getDefaultProps() {
		return {
			text: Messages.get("label.deleteRecord"),
			confirmText: Messages.get("label.delete"),
			declineText: Messages.get("label.cancel")
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{Messages.get("label.attention")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			<p>{this.props.text}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
	        			<button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});

var DeleteConfirmModalCustom = React.createClass({
	getDefaultProps() {
		return {
			confirmText: Messages.get("label.delete"),
			declineText: Messages.get("label.cancel")
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{Messages.get("label.attention")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			<p>{this.props.text}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
	        			<button type="button" className="btn btn-sm btn-primary" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});




var ConcludeGoalModalCustom = React.createClass({
	getDefaultProps() {
		return {
			confirmText: Messages.get("label.confirm"),
			declineText: Messages.get("label.cancel")
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title centerTitleModalCompleteGoal" id="myModalLabel">{Messages.get("label.confirmation")}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body-close-goal">
	        			<p id>{this.props.text}</p>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{this.props.declineText}</button>
	        			<button type="button" className="btn btn-sm btn-success" onClick={this.props.onConfirm}>{this.props.confirmText}</button>
	      			</div>
				</div>
			</div>
		);
	}
});


var ReadTextModal = React.createClass({
	onConfirmWrapper(evt) {
		var me = this,
			value = me.refs['text-input'].value;
		_.defer(() => {
			me.props.onConfirm(value);
		});
	},
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body">
	        			<p>{this.props.message}</p>
	        			<input type='text' className='form-control' ref="text-input" />
	      			</div>
	      			<div className="modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
	        			<button type="button" className="btn btn-sm btn-primary" onClick={this.onConfirmWrapper}>{Messages.get("label.confirm")}</button>
	      			</div>
				</div>
			</div>
		);
	}
});

var FileUploadModal = React.createClass({
	render() {
		return (
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			<div>{this.props.message}</div>
	        			<input type='file' name="file" className='form-control' ref="file-upload-field" id="file-upload-field" accept={this.props.type}/>
	        			<span id="upload-error-span" className="upload-error"/>
								<div style={{ marginLeft: '10px' }} className={'fpdi-primary-color'}>
              		<div style={{ display: 'inline' }} className="fontWeightBold">{`${Messages.get('label.validFormats')} `}</div>
              			{ this.props.validSamples.replaceAll(/,\s*/g, ', ') }
            		</div>
            		{this.props.maxSize && <div style={{ marginLeft: '10px' }} className={'fpdi-primary-color'}>
              		<div style={{ display: 'inline' }} className="fontWeightBold">
                		{`${Messages.get('label.FileMaxSize')}: `}
              		</div>
										{`${this.props.maxSize/10e5}MB`}
            		</div>}
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<div id="file-upload-progress" className="progress" style={{border: '1px solid #ccc'}}>
		        			<div className="progress-bar progress-bar-success"></div>
		    			</div>
	      			</div>
				</div>
			</div>
		);
	}
});

var FileReaderModal = React.createClass({

	render() {
		return (
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			<div>{this.props.message}</div>
	        			<input type='file' name="file" className='form-control' ref="file-reader-field" id="file-reader-field" accept={this.props.type} onChange={this.props.onSuccess}/>
	        			<span id="upload-error-span" className="upload-error"/>
	      			</div>
	      			<div className="modal-footer fpdi-modal-footer">
	        			<div id="file-reader-progress" className="progress" style={{border: '1px solid #ccc'}}>
		        			<div className="progress-bar progress-bar-success"></div>
		    			</div>
	      			</div>
				</div>
			</div>
		);
	}
});

var MediumModal = React.createClass({
	getDefaultProps() {
		return {
			title: null
		};
	},
	render() {
		return (
			<div className="modal-dialog modal-md">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	        			{this.props.children}
	      			</div>
				</div>
			</div>
		);
	}
});

var ExportDocumentModal = React.createClass({
	render() {
		return (
			<div className="modal-dialog modal-md">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
					</div>
					<hr className="divider"></hr>
					<div className="modal-body fpdi-modal-body">
						<form>
							<div className="col-md-6">
								<label htmlFor="documentTitle">{Messages.get("label.documentTitle")} <span className="fpdi-required">&nbsp;</span>
									<input type='text' name="documentTitle" ref="documentTitle" id="documentTitle" />
								</label>
							</div>
							<div className="col-md-6">
								<label htmlFor="documentAuthor">{Messages.get("label.author")} <span className="fpdi-required">&nbsp;</span>
									<input type='text' name="documentAuthor"  ref="documentAuthor" id="documentAuthor" />
								</label>
							</div>
							<div className="col-md-12" >
								<label htmlFor="container"> {Messages.get("label.includeSectionsDocument")} <span className="fpdi-required">&nbsp;</span></label>
								<div className="container" id="container">
									{this.props.text}
								</div>
							</div>
							<br/>
							<div className="col-md-12" >
								<label className="paddingTop5">{Messages.get("label.emptySectionNoExported")}</label>
							</div>
							<div id="exportDocumentModalFooter" name="exportDocumentModalFooter">
								<p id="paramError" className="exportDocumentError"></p>
								<p className="help-block">
									<span className="fpdi-required" /> {Messages.get("label.requiredFields")}
								</p>
								<br/>
								<button type="button" className="btn btn-sm btn-success"  onClick={this.props.onConfirm}>{Messages.get("label.export")}</button>
								<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
});


var GoalsAttributesModal = React.createClass({
	render() {
		return (
			<div className="modal-dialog modal-sm">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
					</div>
					<div className="modal-body fpdi-modal-body">
						{this.props.text}
					</div>
				</div>
			</div>
		);
	}
});

var ImportUsersModal = React.createClass({
	render() {
		return (
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
	        			<button type="button" className="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
	        			</button>
	        			<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	      			</div>
	      			<div className="modal-body fpdi-modal-body">
	      				<p id="paramError" className="importUsersWarning"><strong> {Messages.get("label.attention") + ":"}</strong> {Messages.get("label.userTypeAccount")}</p>
							{this.props.text}
						<div id="importUserstModalFooter" name="importUserstModalFooter">
								<p id="paramError" className="importUsersWarning"></p>
	        					<button type="button" className="btn btn-sm btn-success"  onClick={this.props.onConfirm}>{Messages.get("label.import")}</button>
	        					<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
	        				</div>
	      			</div>
				</div>
			</div>
		);
	}
});


var ExportPlansModal = React.createClass({
	getInitialState() {
		return {
			selectedPlanIds: [],
			errorMsg: null,
		}
	},

	onCheckboxChange(planId) {
		const { selectedPlanIds } = this.state;
		const newSelectedPlanIds = selectedPlanIds.includes(planId)
				? _.filter(selectedPlanIds, id => planId !== id)
				: [...selectedPlanIds, planId];
		
		this.setState({
				selectedPlanIds: newSelectedPlanIds,
		})
	},

	onSelectAll() {
		const { selectedPlanIds } = this.state;
		const { plans } = this.props;

		const newSelectedPlanIds = selectedPlanIds.length < plans.length
			? _.map(plans, ({ id }) => id)
			: [];

		this.setState({ selectedPlanIds: newSelectedPlanIds });
	},

	onConfirmHandle() {
		const { selectedPlanIds } = this.state;

		if (selectedPlanIds.length === 0) {
			this.setState({
				errorMsg: Messages.get('label.error.mustSelectPlansToExport'),
			});
		} else {
			this.setState({ errorMsg: null });
			this.props.onConfirm(selectedPlanIds);
		}
	},

	render() {
		const { selectedPlanIds, errorMsg } = this.state;
		const { plans } = this.props;

		return (
			<div className="modal-dialog modal-md">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title" id="myModalLabel">{Messages.get('label.exportPlansConfirmation')}</h4>
					</div>
					<hr className="divider"></hr>
					<div className="modal-body fpdi-modal-body">
						<form>
							<div className="col-md-12" >
								<label htmlFor="container"> {Messages.get("label.selectPlansToExport")} <span className="fpdi-required">&nbsp;</span></label>
								<div className="container" id="container">
									<div className="row">
										<div key="rootSection-selectall">
											<div className="checkbox marginLeft5 col-md-10">
												<label>
													<input
														type="checkbox"
														onChange={this.onSelectAll}
														checked={selectedPlanIds.length === plans.length}
													/>
													Selecionar todos
												</label>
											</div>
										</div>
										{
											plans.map(({ id, name }) => (
												<div key={"rootSection-filled" + id}>
													<div className="checkbox marginLeft5 col-md-10">
														<label>
															<input
																type="checkbox"
																checked={selectedPlanIds.includes(id)}
																onChange={() => this.onCheckboxChange(id)}
															/>
															{name}
														</label>
													</div>
												</div>
											))
										}
										<br />
										<br />
									</div>
								</div>
							</div>
							<br/>
							<div className="col-md-12" style={{ marginBottom: '2rem' }}>
								<label className="paddingTop5">{Messages.get("label.emptySectionNoExported")}</label>
								<p id="paramError" className="exportDocumentError">{errorMsg}</p>
							</div>
							<div id="exportDocumentModalFooter" name="exportDocumentModalFooter">
								<button type="button" className="btn btn-sm btn-success"  onClick={this.onConfirmHandle}>{Messages.get("label.export")}</button>
								<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">{Messages.get("label.cancel")}</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
});

var InfoModal = React.createClass({
	getInitialState() {
		return {
			currentModal: 'ForPDI',
			selectedForpdiPermissions: true,
		};
	},

	handleForPDIButtonClick() {
		this.setState({ currentModal: 'ForPDI' });
		this.setState({ selectedForpdiPermissions: true })
	},

	handleForRiscoButtonClick() {
		this.setState({ currentModal: 'ForRisco' });
		this.setState({ selectedForpdiPermissions: false })
	},

	render() {
		const { currentModal, selectedForpdiPermissions } = this.state;
		return (
			<div className="modal-dialog modal-lg" style={{ borderRadius: '15px' }}>
				<div className="modal-content">
					<div
						className="for-primary-color fpdi-nav-label"
						style={{
							display: 'flex',
							justifyContent: 'left',
							marginLeft: '1.5em',
							marginTop: '1.5em',
							fontSize: '22px',
							color: 'rgba(99, 97, 97)',
							fontFamily: 'Open+Sans'
						}}
					>
						<span style={{
							fontFamily: 'Open Sans',
							fontSize: '23.5px',
							fontWeight: 'bolder',
							marginTop: '12px',
						}}
						>
							Hierarquia de perfis</span>
						<div
							className="col-md-2"
							style={{ marginLeft: '30%', display: 'flex' }}
						>
							<AppStyledButton
								text={Messages.get('label.forPdiBrand')}
								title={Messages.get('label.forPdiBrand')}
								onClick={this.handleForPDIButtonClick}
								disabled={selectedForpdiPermissions}
								appName="fpdi"
								style={{
									marginRight: '10px',
									backgroundColor: 'none',
									alignItems: 'right',
									fontSize: '18px',
								}}
							/>
							<AppStyledButton
								text={Messages.get('label.forRiscoBrand')}
								title={Messages.get('label.forRiscoBrand')}
								onClick={this.handleForRiscoButtonClick}
								disabled={!selectedForpdiPermissions}
								appName="frisco"
								style={{ fontSize: '18px' }}
							/>
							<div
								style={{
									height: '80%',
									marginTop: '5px',
									borderLeft: '1px solid rgba(128, 128, 128, 0.5)',
									backgroundColor: '1px solid rgba(128, 128, 128, 0.5)',
									marginLeft: '20px',
								}}
							/>
							<button
								className="mdiClose mdi mdi-close pointer"
								style={{
									backgroundColor: 'rgba(0, 0, 0, 0.085)',
									border: 'none',
									borderRadius: '10px',
									padding: '5px',
									marginTop: '10px',
									width: '30px',
									height: '30px',
									marginLeft: '1em',
									color: 'rgba(146,100,221,255)',
									display: 'flex',           
									alignItems: 'center',      
									justifyContent: 'center',  
								}}
								data-dismiss="modal"
							></button>
						</div>
					</div>
					{currentModal === 'ForPDI' && (
						<div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'left',
									marginLeft: '1.5em',
									marginTop: '1em',
								}}
							>
							</div>
							<div className="modal-header fpdi-modal-header">
								<div className="modal-body fpdi-modal-body">
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '-5px',
										width: '100%'
									}}
									/>
									<p style={{ fontSize: '15px' }}>
										<strong>Administrador</strong>
									</p>
									<p>
										Tem a permissão de realizar todas as funcionalidades
										disponíveis, independente da atuação no item a ser tratado.
									</p>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '30px',
										width: '100%'
									}}
									/>
									<p style={{ fontSize: '15px' }}>
										<strong>Gerente</strong>
									</p>
									<p style={{ fontSize: '14px' }}>
										Possui permissão intermediária em relação ao Administrador e
										ao Colaborador. <br /><br />
										<strong>Para o PDI</strong><br /><br />
										<ul style={{ paddingLeft: '20px' }}>
											<li>Realiza gestão de elementos orçamentários.</li>
											<li>De maneira geral, tem a possibilidade de visualizar todos os itens
												disponíveis, gerar relatórios, adicionar aos favoritos e editar
												informações. Excluir e gerar metas.</li>
											<li>Enquanto a atuação é de "Gestor", além dos itens padrões, tem possibilidade de exclusão
												do item, adição e edição de orçamentos, conclusão e reabertura
												de metas, adição e exclusão de arquivos, visualização e edição
												de status de planos de ação.</li>
											<li>Mesmo com a atuação como "Responsável técnico" da meta, o gerente permanece com as
												permissões acima.</li>
											<li>Vale ressaltar que a árvore de plano de metas
												possui hierarquia, sendo assim, quando um gerente é Gestor de um
												nível, ele passa a receber as permissões para os níveis abaixo.</li>
										</ul>
									</p>
									<p>
										<span style={{ color: '#FF0000' }}>Atenção:</span> Quando o gerente não for Gestor, apenas visualizará os itens, o que permite que se tenha vários perfis de gerente por campus.
									</p>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '15px',
										width: '100%'
									}}
									/>
									<p style={{ fontSize: '15px' }}>
										<strong>Colaborador</strong>
									</p>
									<p style={{ fontSize: '14px' }}>
										É o menor nível de atuação dentro do sistema. Possuindo como
										padrão principal somente a visualização das informações.
									</p>
									<p></p>
									<p><strong style={{ fontSize: '14px' }}>Para o PDI</strong></p>
									<ul style={{ fontSize: '14px', paddingLeft: '20px' }}>
										<li>De maneira geral tem a possibilidade de visualizar todos os itens disponíveis e adicionar aos favoritos.</li>
										<li>Para Indicador, visualizar todos os status e editar itens de plano de ação que está como responsável técnico, além de realizar buscas e exportar csv.</li>
										<li>Para metas, como "Responsável técnico", permite a alteração das informações dos campos "Alcançado" e "Justificativa", e gestão dos anexos.</li>
									</ul>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '15px',
										width: '100%'
									}}
									/>
								</div>
								<div className="modal-footer"></div>
							</div>
						</div>
					)}
					{currentModal === 'ForRisco' && (
						<div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'left',
									marginLeft: '1.5em',
									marginTop: '1em',
								}}
							>
							</div>
							<div className="modal-header fpdi-modal-header">
								<div className="modal-body fpdi-modal-body">
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '-5px',
										width: '100%'
									}} />
									<p style={{ fontSize: '15px' }}>
										<strong>Administrador</strong>
									</p>
									<p>
										Tem a permissão de realizar todas as funcionalidades
										disponíveis, independente da atuação no item a ser tratado.
									</p>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '30px',
										width: '100%'
									}} />
									<p style={{ fontSize: '15px' }}>
										<strong>Gerente</strong><br />
									</p>
									<p>
										Possui permissão intermediária em relação ao Administrador e
										ao Colaborador.<br /><br />
										<p><strong style={{ fontSize: '14px' }}>Para o RISCO</strong></p>
										<ul style={{ paddingLeft: '20px' }}>
											<li>Possui permissão para atualização dos itens
												relacionados a processos e riscos, propriamente ditos.</li>
											<li>Para os itens de menu políticas e plano de gestão de risco, somente tem
												a possibilidade de visualização.</li>
											<li>Para os itens Unidade e Subunidade, possuem como padrão visualização das informações.</li>
											<li>Porém, enquanto a atuação é de "Responsável técnico", da unidade ou subunidade, além dos itens padrões, tem a possibilidade de edição das informações gerais, com exceção do campo "responsável técnico".</li>
										</ul>
									</p>
									<p>
										<span style={{ color: '#FF0000' }}>Atenção:</span> A atuação como gestor somente difere, quanto aos itens padrões, em relação às notificações recebidas referentes às atualizações e monitoramento (validar notificações).
									</p>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '15px',
										width: '100%'
									}} />
									<p>
										<strong>Colaborador</strong>
									</p>
									<p>
										É o menor nível de atuação dentro do sistema. Possuindo como
										padrão principal somente a visualização das informações.
									</p>
									<p>
										<strong>Para o RISCO</strong>
									</p>
									<ul style={{ paddingLeft: '20px' }}>
										<li>Possui permissão padrão somente para visualização das informações.</li>
										<li>Enquanto a atuação é de "Responsável técnico", da unidade ou subunidade, além da visualização padrão, tem a possibilidade de edição das informações gerais, com exceção do campo "responsável técnico".</li>
										<li>Enquanto a atuação é de "Responsável técnico" de um risco, consegue editar as informações gerais, com exceção do nome do risco, código de identificação do risco, gestor e responsável técnico.</li>
										<li>Permite a criação e gestão dos itens das abas ações de prevenção, monitoramento, incidentes e contingenciamento.</li>
									</ul>
									<hr style={{
										borderTop: '2px solid rgba(128, 128, 128, 0.5)',
										marginTop: '30px',
										width: '100%'
									}} />
								</div>
								<div className="modal-footer"></div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	},
});

var GraphHistory= React.createClass({
	render() {
		return (
			<div className="modal-dialog modal-graph modal-md">
				<div className="modal-content graph">
					<div className="frisco-modal-history">
	        			<span style={{"display":"inline-block"}}>
							<h4 className="modal-title" id="myModalLabel">{this.props.title}</h4>
	        			</span>
						<button type="button" className="mdi mdi-close-circle close-modal cursorPointer" data-dismiss="modal"/>
	      			</div>

	      			<hr className="divider"/>
	      			<div className="modal-body fpdi-modal-body"> {this.props.text} </div>
				</div>
			</div>
		);
	}
});

var TextAreaModal = React.createClass({
	getInitialState() {
		return {
			value: this.props.value,
		}
	},

	componentWillReceiveProps(newProps) {
		const { value } = newProps;
		this.setState({ value });
	},

	render() {
		return (
			<div className="modal-dialog modal-md">
				<div className="modal-content">
					<div className="modal-header fpdi-modal-header">
						<div className="modal-body fpdi-modal-body">
							<VerticalInput
								fieldDef={{
									name: "new-monitor-report",
									type: "textarea",
									rows: "10",
									currValue: this.state.value,
									onChange: (e) => {
										this.setState({ value: e.target.value });
										this.props.onChange(e);
									},
								}}
							/>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-info" data-dismiss="modal">Ok</button>
						</div>
					</div>
				</div>
			</div>
		)
	},
});

var Modal = {
	$el: EL,
	$nc: NC,
	$init() {
		$(this.$el).modal({
			show: false
		});
	},
	hide() {
		$(this.$el).modal("hide");
		_.defer(() => {
			ReactDOM.render((
				<div></div>
			),this.$el);
		});

		$(this.$nc).modal("hide");
		_.defer(() => {
			ReactDOM.render((
				<div></div>
			),this.$nc);
		});
	},
	show() {
		$(this.$el).modal("show");
	},
	detailsModal(title, Components) {
		ReactDOM.render((
			<MediumModal title={title}>
				{Components}
			</MediumModal>
		),this.$el);
		$(this.$el).modal('show');
	},
	alert(title, msg) {
		ReactDOM.render((
			<AlertModal title={title} message={msg} />
		),this.$el);
		$(this.$el).modal('show');
	},
	acceptTerms(title, msg, cb) {
		ReactDOM.render((
			<NoClosableModal onConfirm={cb}  confirmTitle={title} message={msg} />
		),this.$nc);
		$(this.$nc).modal('show');
	},
	confirm(title, msg, cb) {
		ReactDOM.render((
			<ConfirmModal onConfirm={cb}  confirmTitle={title} message={msg} />
		),this.$el);
		$(this.$el).modal('show');
	},
	confirmCustom(cb, text, cd) {
		ReactDOM.render((
			<ConfirmModalCustom onConfirm={cb} text={text} onCancel = {cd}/>
		),this.$el);
		$(this.$el).modal('show');
	},

	confirmConviteUserCustom(text) {
		ReactDOM.render((
			<ConfirmConviteUser text={text} />
		),this.$el);
		$(this.$el).modal('show');
	},

	confirmCancelCustom(cb, text, cd) {
		ReactDOM.render((
			<CancelModalCustom onConfirm={cb} text={text} onCancel = {cd}/>
		),this.$el);
		$(this.$el).modal('show');
	},

	deleteConfirm(cb) {
		ReactDOM.render((
			<DeleteConfirmModal onConfirm={cb} />
		),this.$el);
		$(this.$el).modal('show');
	},
	deleteConfirmCustom(cb, text) {
		ReactDOM.render((
			<DeleteConfirmModalCustom onConfirm={cb} text={text}/>
		),this.$el);
		$(this.$el).modal('show');
	},
	completeGoalCustom(cb, text) {
		ReactDOM.render((
			<ConcludeGoalModalCustom onConfirm={cb} text={text}/>
		),this.$el);
		$(this.$el).modal('show');
	},
	readText(title, msg, cb) {
		ReactDOM.render((
			<ReadTextModal title={title} message={msg} onConfirm={cb} />
		),this.$el);
		$(this.$el).modal('show');
	},

	feedbackPost() {
		ReactDOM.render((
			<MediumModal title={Messages.get("label.sendFeedback")}>
				<FeedbackPost
					onCancel={this.hide.bind(this)}
					onSubmit={this.hide.bind(this)}
				/>
			</MediumModal>
		),this.$el);
		$(this.$el).modal('show');
	},
	showInfoModal(title, text) {
		ReactDOM.render((
			<InfoModal title={title} text={text} />
		), this.$el);
		this.show();
	},
	reportProblem() {
		ReactDOM.render((
			<MediumModal title={Messages.get("label.reportIssue")}>
				<ReportProblem
					onCancel={this.hide.bind(this)}
					onSubmit={this.hide.bind(this)}
				/>
			</MediumModal>
		),this.$el);
		$(this.$el).modal('show');
	},

	uploadFile(title, msg, url, fileType, typesBlocked, onSuccess, onFailure, validSamples, maxSize) {
		var me = this;
		var format = "";
		var sizeExceeded = false;
		var typeViolation = false;
		if(maxSize){
			maxSize *= 10e5;
		}
		ReactDOM.render((
			<FileUploadModal title={title} message={msg} type={fileType} validSamples={validSamples} maxSize={maxSize}/>
		),this.$el);
		document.getElementById('upload-error-span').innerHTML = "";
		this.show();

		var uploadOptions = {
			url: url,
			dataType: 'json',
			beforeSend : function(xhr, opts) {
				format = this.files[0].name.substring(this.files[0].name.lastIndexOf(".")+1, this.files[0].name.length);
	        	if ((!(this.files[0].type.toLowerCase().match(fileType)) && !(format.toLowerCase().match(fileType)))
	        			|| format.toLowerCase().match(typesBlocked)) { //|| this.files[0].type.toLowerCase().match(typesBlocked)
	        		if (!this.files[0].type.toLowerCase().match(fileType) || this.files[0].type.toLowerCase().match(typesBlocked))
	        			format = this.files[0].type.split("/")[1] || "";
	        		typeViolation = true;
					xhr.abort();
				/*if (!(format.toLowerCase().match(fileType)) || format.toLowerCase().match(typesBlocked)) {
	        		typeViolation = true;
					xhr.abort();*/
				} else if (maxSize && this.files[0].size > maxSize){
					sizeExceeded = true;
					xhr.abort();
				}
				me.fileName = this.files[0].name;
	    },
			done: function (evt, opts) {
				if (evt.type == 'fileuploaddone') {
					if (typeof onSuccess == 'function') {
						onSuccess.call(me,opts.jqXHR.responseJSON);
					}
					else {
						console.warn("No success callback passed for file upload window.");
					}
				}
				else if (typeof onFailure == 'function') {
					onFailure.call(me,opts.jqXHR.responseJSON);
				}
			},
			fail: function (evt,opts) {
				if(typeViolation){
					document.getElementById('upload-error-span').innerHTML =
					"O formato "+format+" não é válido.<br>"+(validSamples ? Messages.get("label.examplesValidFormats") + ": "+validSamples : "");
				} else if (sizeExceeded){
					document.getElementById('upload-error-span').innerHTML =
					"Tamanho máximo excedido, o tamanho máximo é "+maxSize/10e5 +"MB";
				} else if (typeof onFailure == 'function') {
	            	onFailure.call(me,opts.jqXHR.responseJSON);
				}
			},
			progressall: function (e, data) {
					var progress = parseInt(data.loaded / data.total * 100, 10);
					$('#file-upload-progress .progress-bar').css(
							'width',
							progress + '%'
					);
			}
	  }

		$('#file-upload-field').fileupload(uploadOptions).prop('disabled', !$.support.fileInput)
						.parent().addClass($.support.fileInput ? undefined : 'disabled');
	},

	readFile(title, msg, fileType, onSuccess) {
		var me = this;
		var format = "";
		ReactDOM.render((
			<FileReaderModal title={title} message={msg} type={fileType} onSuccess={onSuccess}/>
		),this.$el);
		this.show();

	},

	exportDocument(title, text, cb) {
		var me = this;
		ReactDOM.render((
			<ExportDocumentModal title={title} text={text} onConfirm={cb}/>
		),this.$el);
		this.show();
	},

	selectGoalsAttributes(title, text, cb) {
		var me = this;
		ReactDOM.render((
			<GoalsAttributesModal title={title} text={text} onConfirm={cb}/>
		),this.$el);
		this.show();
	},

	importUsers(title, text, cb) {
		var me = this;
		ReactDOM.render((
			<ImportUsersModal title={title} text={text} onConfirm={cb}/>
		),this.$el);
		this.show();
	},

	exportPlanMacros(plans, onConfirm) {
		var me = this;
		ReactDOM.render((
			<ExportPlansModal plans={plans} onConfirm={onConfirm}/>
		),this.$el);
		this.show();
	},

	GraphHistory(title, text){
		var me = this;
		ReactDOM.render((
			<GraphHistory title={title} text={text}/>
		),this.$el);

		this.show();
	},

	MultiSelectMod(units, selectedUnits, unitChangeHandler){
		var me = this;
		ReactDOM.render((
		<div className="modal-dialog modal-md">
			<div className="modal-content">
				<div className="modal-header fpdi-modal-header">
					<div className="modal-body fpdi-modal-body" style={{width: "50%"}}>
					<ReactMultiSelectCheckboxes 
					className="unit-mult-select"
					placeholderButtonLabel="Selecione uma ou mais"
					options={units}
					defaultValue={selectedUnits}
					onChange={unitChangeHandler}
					/>
	      			</div>
					  <div className="modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Fechar</button>

	      			</div>
				</div>
			</div>
		</div>
		),this.$el);

		this.show();
	},

	TextArea(value, onChange){
		ReactDOM.render((
			<TextAreaModal value={value} onChange={onChange} />
		),this.$el);

		this.show();
	},

	ShowText(data_value){
		var me = this;
		ReactDOM.render((
		<div className="modal-dialog modal-md">
			<div className="modal-content">
				<div className="modal-header fpdi-modal-header">
					<div className="modal-body fpdi-modal-body" style={{overflowWrap: "break-word"}}>
						<span>{data_value}</span>
	      			</div>
					  <div className="modal-footer">
	        			<button type="button" className="btn btn-sm btn-default" data-dismiss="modal">Fechar</button>
	      			</div>
				</div>
			</div>
		</div>
		),this.$el);

		this.show();
	},
};

$(() => {
	Modal.$init();
});

export default Modal;
