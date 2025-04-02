//import Toastr from 'toastr';
import React from "react";
import { Link, hashHistory } from "react-router";
import AttributeInput from "forpdi/src/forpdi/planning/widget/attributeForm/AttributeInput.jsx";
import BudgetField from "forpdi/src/forpdi/planning/view/field/BudgetField.jsx";
import AttachmentField from "forpdi/src/forpdi/planning/view/field/AttachmentField.jsx";
import ActionPlanField from "forpdi/src/forpdi/planning/view/field/ActionPlanField.jsx";
import ScheduleField from "forpdi/src/forpdi/planning/view/field/ScheduleField.jsx";
import TableField from "forpdi/src/forpdi/planning/view/field/TableField.jsx";
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import Messages from "forpdi/src/Messages.jsx";
import ConfirmButton from 'forpdi/src/forpdi/core/widget/form/ConfirmButton.jsx';


var Title = Validation.validate;

const VerticalForm =  React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired
	},
	getDefaultProps() {
		return {
			fields: [],
			onCancel: null,
			onSubmit: null,
			store: null,
			hideCanel: false,
			cancelUrl: null,
			cancelLabel: "Cancelar",
			submitLabel: "Enviar",
			blockButtons: false,
			fieldErrors:[],
			undeletable: false,
			alterable: false,
			onChage: null,
			dateBegin: null,
			dateEnd: null,
			waitingSubmit: false,
		};
	},
	getInitialState() {
		return {
			error: false,
			errorMessage: ""
		};
	},
	cancelWrapper(evt, onCancel) {
		for (var i = 0; i < this.props.fields.length; i++) {
			if (this.refs[this.props.fields[i].name])
				this.refs[this.props.fields[i].name].refs.formAlertError.innerHTML = "";
		}
		evt.preventDefault();
		if (typeof this.props.onCancel === 'function') {
			onCancel();
		} else {
			this.backWrapper();
		}
	},
	submitMultipleAttributesWrapper(evt) {
		evt.preventDefault();
		var error = false;
		if (!this.props.onSubmit)
			console.warn("AttributeForm: You must pass your own onSubmit callback.");
		else {
			this.props.fields.map((field,idx) => {
				if (field.type != AttributeTypes.BUDGET_FIELD
					&& field.type != AttributeTypes.ACTION_PLAN_FIELD
					&& field.type != AttributeTypes.SCHEDULE_FIELD
					&& field.type != AttributeTypes.TABLE_FIELD) {
						if(this.props.isDocument) {
							if(!Title.validateTitle(this.refs[field.name], idx, this.props.editFunc)){
								this.context.toastr.addAlertError(Messages.get("label.form.error"));
								error = true;
							}
						}
					}
			});

			if (!error) {
				this.props.onSubmit(this.getValues());
			}
		}
	},
	
	submitAttributeWrapper(evt, field, idx) {
		evt.preventDefault();
		var error = false;
		if (!this.props.onSubmit)
			console.warn("AttributeForm: You must pass your own onSubmit callback.");
		else {
			if (field.type != AttributeTypes.BUDGET_FIELD
				&& field.type != AttributeTypes.ACTION_PLAN_FIELD
				&& field.type != AttributeTypes.SCHEDULE_FIELD
				&& field.type != AttributeTypes.TABLE_FIELD) {
					if(this.props.isDocument) {
						if(!Title.validateTitle(this.refs[field.name], idx)){
							this.context.toastr.addAlertError(Messages.get("label.form.error"));
							error = true;
						}
					}
				}

			if (!error) {
				this.props.onSubmit(this.getValue(field));
			}
		}
	},
	
	getValue(field) {
		if(field.type != AttributeTypes.BUDGET_FIELD &&
			field.type != AttributeTypes.ACTION_PLAN_FIELD &&
			field.type != AttributeTypes.SCHEDULE_FIELD &&
			field.type != AttributeTypes.TABLE_FIELD &&
			field.type != AttributeTypes.ATTACHMENT_FIELD) {
				return {
					...field,
					value: this.refs[field.name].getValue(),
					name: this.refs[field.name].refs['edit-input'].value,
				}
		}
	},
	
	getValues() {
		var data = {};
		this.props.fields.forEach(field => {
			 if(field.type != AttributeTypes.BUDGET_FIELD &&
				field.type != AttributeTypes.ACTION_PLAN_FIELD &&
				field.type != AttributeTypes.SCHEDULE_FIELD &&
				field.type != AttributeTypes.TABLE_FIELD &&
				field.type != AttributeTypes.ATTACHMENT_FIELD) {
					data[field.name] = this.refs[field.name].getValue();
					if(!data[field.name]) {
						data[field.name] = this.refs[field.name].props.fieldDef.value;
					}
			}
		});

		return data;
	},
	backWrapper() {
		hashHistory.goBack();
	},
	componentDidMount() {
		if (this.props.store) {
			this.props.store.on("invalid", this.handleValidation, this);
			this.props.store.on("fail", this.handleFailure, this);
		}
	},
	componentDidUpdate() {
		var fieldName;
		var me = this;
		if(this.props.vizualization) {
			this.props.fields.map((field,idx) => {
				fieldName = field.name;
				if (me.refs[fieldName] != undefined)
					me.refs[fieldName].refs.formAlertError.innerHTML = "";
			})
		}
	},
	componentWillUnmount() {
		if (this.props.store) {
			this.props.store.off("invalid", this.handleValidation, this);
			this.props.store.off("fail", this.handleFailure, this);
		}
	},
	handleValidation(model, errors, opts) {
		this.setState({
			error: true,
			errorMessage: errors
		});
	},
	handleFailure(errors) {
		//Toastr.remove();
		if (typeof this.state.errorMessage == 'string') {
			//Toastr.error(errors);
			this.context.toastr.addAlertError(errors);
		} else if (typeof this.state.errorMessage == 'object') {
			var msg = "<ul>";
			_.each(errors, (err) => {
				msg += "<li>"+err+"</li>";
			});
			msg += "</ul>";
			//Toastr.error(msg);
			this.context.toastr.addAlertError(msg);
		} else {
			//Toastr.error("Um erro inesperado ocorreu.");
			this.context.toastr.addAlertError("Um erro inesperado ocorreu.");
		}
		/*this.setState({
			error: true,
			errorMessage: errors
		});*/
	},
	closeAlerts() {
		this.setState({
			error: false
		});
	},
	
	renderFormButtons(requiredField, blockButtons, alerts, onCancel, onSubmit, loading) {
		return (
			<div>
				{requiredField ?
					<p className="help-block">
						<span className="fpdi-required" /> {Messages.getEditable("label.requiredFields","fpdi-nav-label")}
					</p>
				: ""}
				{alerts}
				{(blockButtons ?
					(<div className="form-group">
						<button type="submit" className="btn btn-success btn-block">{this.props.submitLabel}</button>
						{!this.props.hideCanel ? (!this.props.cancelUrl ?
							<button className="btn btn-default  btn-block" onClick={(e) => this.cancelWrapper(e, onCancel)}>{this.props.cancelLabel}</button>
							:(
								<Link to={this.props.cancelUrl} className="btn btn-default btn-block">{this.props.cancelLabel}</Link>
							)):""}
					</div>)
				:
					(<div className="form-group text-left">
						<ConfirmButton
							type="submit"
							onClick={onSubmit}
							loading={loading}>
								{this.props.submitLabel}
						</ConfirmButton>
						{!this.props.hideCanel ? (!this.props.cancelUrl ?
							<button
								className="btn btn-sm btn-default"
								onClick={(e) => this.cancelWrapper(e, onCancel)}
								disabled={loading}
							>
									{this.props.cancelLabel}
							</button>
							:
							<Link 
								className="btn btn-sm btn-default"
								to={this.props.cancelUrl}
							>
								{this.props.cancelLabel}
							</Link>
						):""}
					</div>)
				)}
			</div>	
		)
	},
	
	render() {

		var alerts = null;
		var showButtons =  !this.props.vizualization;
		var requiredFields = false;
		if (this.state.error) {
			if (typeof this.state.errorMessage == 'string') {
				alerts = (<div className="alert alert-danger animated fadeIn" role="alert">
					<span className="close mdi mdi-close" aria-label="Fechar Alerta" onClick={this.closeAlerts} />
					{this.state.errorMessage}
				</div>);
			} else if (typeof this.state.errorMessage == 'object') {
				var errNo = 0;
				alerts = (<div className="alert alert-danger animated fadeIn" role="alert">
					<span className="close mdi mdi-close" aria-label="Fechar Alerta" onClick={this.closeAlerts} />
					{this.state.errorMessage.map(err => {
						return <li key={"errmsg-"+(errNo++)}>{err}</li>;
					})}
				</div>);
			} else {
				alerts = (<div className="alert alert-danger animated fadeIn" role="alert">
					<span className="close mdi mdi-close" aria-label="Fechar Alerta" onClick={this.closeAlerts} />
					An unexpected error occurred.
				</div>);
			}
		}

		return (<div>
			{this.props.fields.map((field,idx) => {
				if (field.type != AttributeTypes.BUDGET_FIELD
					&& field.type != AttributeTypes.ACTION_PLAN_FIELD
					&& field.type != AttributeTypes.SCHEDULE_FIELD
					&& field.type != AttributeTypes.TABLE_FIELD
					&& field.type != AttributeTypes.ATTACHMENT_FIELD) {
						showButtons = !this.props.vizualization;

						if(showButtons && this.props.showButtons != null){
							showButtons = this.props.showButtons;
						}
						
						const {
							undeletable,
							deleteFunc,
							editFunc,
							alterable,
							isDocument,
							vizualization,
							onClick,
							onChange,
							waitingSubmit,
						} = this.props;
						
						const fieldInput = (
							<AttributeInput
								id={field.id}
								index={idx}
								fieldDef={field}
								ref={field.name}
								key={field.name}
								undeletable={undeletable}
								deleteFunc={deleteFunc}
								editFunc={editFunc}
								alterable={alterable}
								vizualization={isDocument ? vizualization[idx+1] : vizualization}
								isDocument={isDocument}
								onClick={onClick}
								onChange={onChange}
								waitingSubmit={isDocument ? waitingSubmit[idx+1] : waitingSubmit}
							/>
						);
						
							
						const fieldFormButtons = (this.props.isDocument
							&& !this.props.vizualization[idx+1]
							&& this.renderFormButtons(
								field.required,
								this.props.blockButtons,
								alerts,
								() => this.props.onCancel(idx),
								(e) => this.submitAttributeWrapper(e, field, idx),
								this.props.waitingSubmit[idx+1],
							)
						);
								
						return [fieldInput, fieldFormButtons];	
						
				} else if(field.type == AttributeTypes.BUDGET_FIELD && (EnvInfo.company && EnvInfo.company.showBudgetElement == true)){
					return(<BudgetField hasPermission={this.props.hasPermission} key={field.name} data={field.budgets} newFunc={field.extra}/>);
				} else if(field.type == AttributeTypes.ACTION_PLAN_FIELD){
					return(<ActionPlanField hasPermission={this.props.hasPermission} key={field.name} responsible={this.props.userResponsible}
						newFunc={field.extraActionPlans} dataIniPlan={this.props.dataIniPlan} dataFimPlan={this.props.dataFimPlan} dateBegin={this.props.dateBegin} dateEnd={this.props.dateEnd} levelInstanceId = {this.props.levelInstanceIdActionPlan}/>);
				} else if(field.type == AttributeTypes.SCHEDULE_FIELD){
					return(<ScheduleField key={field.name} data={field.schedule} newFunc={field.extraSchedule} title={field.label}
						editFunc={this.props.editFunc} index={idx} isDocument={this.props.isDocument}/>);
				} else if(field.type == AttributeTypes.TABLE_FIELD){
					return(<TableField key={field.name} data={field.tableFields} newFunc={field.extraTableFields} title={field.label}
						editFunc={this.props.editFunc} index={idx} isDocument={this.props.isDocument} deleteFunc={this.props.deleteFunc}/>);
				} else if(field.type == AttributeTypes.ATTACHMENT_FIELD){
					return(<AttachmentField hasPermission={this.props.hasPermission} key={field.name} responsible={this.props.userResponsible} manager={this.props.userManager}
						levelInstanceId={this.props.levelInstanceId}/>);
				}
				if (field.required)
					requiredFields = true;
			})}
			{!this.props.isDocument && !this.props.vizualization && 
				this.renderFormButtons(
					requiredFields,
					this.props.blockButtons,
					alerts,
					this.props.onCancel,
					this.submitMultipleAttributesWrapper,
					this.props.waitingSubmit,
				)
			}
		</div>);
	}
});

export default VerticalForm;
