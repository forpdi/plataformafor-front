import _ from "underscore";
import React from "react";
import RichText from 'forpdi/src/forpdi/vendor/FPDIRichText.jsx';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import string from 'string';
import $ from 'jquery';
import AttributeTypes from 'forpdi/src/forpdi/planning/enum/AttributeTypes.json';
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import IndicatorType from "forpdi/src/forpdi/planning/view/field/IndicatorTypeField.jsx";
import SelectPlan from "forpdi/src/forpdi/planning/view/field/SelectPlanField.jsx";
import Responsible from "forpdi/src/forpdi/planning/view/field/ResponsibleField.jsx";
import StrategicObjective from "forpdi/src/forpdi/planning/view/field/StrategicObjectiveField.jsx";
import PlanMacroStore from "forpdi/src/forpdi/planning/store/PlanMacro.jsx";
import Messages from "forpdi/src/Messages.jsx";

import Select from 'react-select';

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
		roles: React.PropTypes.object.isRequired,
		planMacro: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			fieldDef: {
				type: "text",
				name: "input-" + Date.now(),
				label: '',
				placeholder: '',
				value: null,
				onChange: null,
				helpBox: null,
				undeletable: false,
				alterable: false,
				editing: false
			},
			selectedOption: null,
			optionsField:[],
			waitingSubmit: false,
		};
	},
	getInitialState() {
		return {
			fieldId: "field-" + this.props.fieldDef.name.replace(/\./g, "-"),
			strategicObjectivesPlansParam: -1,
		};
	},
	
	getValue() {
		var el = this.refs[this.state.fieldId];

		if (!el)
			return el;
		if (!el.type) {
			// para o campo de text area o type esta undefined
			return el.state.value;
		}
		if (el.type == AttributeTypes.DATE_FIELD ||
			el.type == AttributeTypes.DATE_TIME_FIELD)
			return el.valueAsDate;
		if (el.type == AttributeTypes.CURRENCY_FIELD ||
			el.type == AttributeTypes.NUMBER_FIELD ||
			el.type == AttributeTypes.PERCENTAGE_FIELD ||
			el.type == AttributeTypes.TOTAL_FIELD)
			return el.valueAsNumber;
		if (this.props.fieldDef.type == AttributeTypes.SELECT_PLAN_FIELD) {
			if (this.props.fieldDef.selectPlans.length > 0) {
				for (var i = 0; i < this.props.fieldDef.selectPlans.length; i++) {
					if (this.props.fieldDef.selectPlans[i].name == el.value) {
						return this.props.fieldDef.selectPlans[i].id.toString();
					}
				}
			} else {
				return null;
			}
		}
		if (el.mask) {
			return el.mask.getRawValue().trim();
		}
		return el.value;
	},
	getInputNode() {
		return this.refs[this.state.fieldId];
	},
	onKeyUp(evt, preventEnter = true) {
		this.maxLengthMask();
		if (preventEnter) {
			var key = evt.which;
			if (key == 13) {
				evt.preventDefault();
				return;
			}
		}
		if (this.refs[this.state.fieldId].value.length + 1 > this.refs[this.state.fieldId].maxLength) {
			this.refs[this.state.fieldId].value = this.refs[this.state.fieldId].value.substr(0, this.refs[this.state.fieldId].maxLength - 1);
		}
	},
	maxLengthMask() {
		if (this.refs[this.state.fieldId].value.length >= this.refs[this.state.fieldId].maxLength) {
			this.context.toastr.addAlertError(Messages.get("label.error.limit") + " " + this.refs[this.state.fieldId].maxLength + " " + Messages.get("label.error.limitCaracteres"));
		}
	},
	onlyNumber(evt) {
		var key = evt.which;
		if (key == 13 || key != 44 && (key < 48 || key > 57)) {
			evt.preventDefault();
			return;
		}
	},

	onlyNumberPaste(evt) {
		var value = evt.clipboardData.getData('Text');
		if (!(!isNaN(parseFloat(value)) && isFinite(value)) || parseFloat(value) < 0) {
			evt.preventDefault();
			return;
		}
	},

	componentDidMount() {
		if (this.props.fieldDef.type == AttributeTypes.DATE_FIELD ||
			this.props.fieldDef.type == AttributeTypes.DATE_TIME_FIELD) {
			$(this.getInputNode()).daterangepicker({
				autoApply: true,
				autoUpdateInput: true,
				locale: {
					format: 'DD/MM/YYYY'
				},
				opens: 'right',
				drops: 'down',
				showDropdowns: true,
				singleDatePicker: true
			});
		}

		PlanMacroStore.on("getmainmenustate", (data) => {
			this.setState({
				menuHidden: data
			});
		}, this);
	},

	onStrategicObjectivesSelectPlanChange() {
		this.setState({
			strategicObjectivesPlansParam: this.refs.strategicObjectivesSelectPlan.value
		})

	},

	delete() {
		this.props.deleteFunc(this.props.id);
	},

	edit() {
		this.setState({
			editing: true
		});
	},

	cancelEditing() {
		this.setState({
			editing: false
		});
	},

	confirmEdit() {
		if (this.refs['edit-input'].value.trim() != "") {
			this.props.editFunc(this.refs['edit-input'].value, this.props.index);
			this.cancelEditing();
		} else {
			this.context.toastr.addAlertError(Messages.get("label.completedField"));
		}
	},

	renderEditing() {
		return (
			<div className="edit-section-attribute">
				<input defaultValue={this.props.fieldDef.label} className="edit-section-attribute-input" maxLength="255" ref="edit-input" />
				<div className='displayFlex'>
					<span className='mdi mdi-check accepted-budget' onClick={this.confirmEdit} title={Messages.get("label.submitLabel")}></span>
					<span className='mdi mdi-close reject-budget' onClick={this.cancelEditing} title={Messages.get("label.cancel")}></span>
				</div>
			</div>
		);
	},
	
	renderActionButtons() {
		const { planMacro, permissions, roles } = this.context;
		const { undeletable, vizualization, editFunc } = this.props;
		const notArchived = !planMacro.get('archived');
		const hasPermission = roles.MANAGER || _.contains(permissions, PermissionsTypes.MANAGE_DOCUMENT_PERMISSION);
		const buttons = [];
		if (hasPermission && notArchived) {
			if (vizualization) {
				const editButton = (
					<i
						className="mdi mdi-pencil cursorPointer"
						onClick={() => editFunc(this.props.index)}
						title={Messages.get("label.title.editInformation")}
					/>
				);
				buttons.push(editButton);
			}
			if (undeletable) {
				const deleteButton = (
					<span
						type="submit"
						className="mdi mdi-delete attribute-input-edit inner"
						title={Messages.get("label.deleteField")}
						onClick={this.delete}
					/>
				);
				buttons.push(deleteButton);
			}
		}
		return (
			<div style={{ display: 'flex', float: 'right' }}>
				{buttons}
			</div>
		);
	},

	renderLabel(param) {
		return (
			<div>
				<b className="budget-title">{this.props.fieldDef.label}</b>
				{param}
				{(this.context.roles.MANAGER || _.contains(this.context.permissions,
					PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && !this.context.planMacro.get("archived") ?
					(!!this.props.undeletable ? <span type="submit" className="mdi mdi-delete attribute-input-edit inner"
						title={Messages.get("label.title.deleteField")} onClick={this.delete} /> : "")
					: ""}
				{(this.context.roles.MANAGER || _.contains(this.context.permissions,
					PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && !this.context.planMacro.get("archived") ?
					(!!this.props.alterable ? <span className="mdi mdi-pencil attribute-input-edit inner"
						title={Messages.get("label.title.changeField")} onClick={this.edit} /> : "")
					: ""}
			</div>
		);
	},

	handleChange(selectedOption){
		this.setState({ selectedOption });
	  },

	render() {
		var fieldEl;
		if (this.props.vizualization) {
			if (this.props.fieldDef.type == AttributeTypes.INDICATOR_TYPE) {
				fieldEl = (
					<IndicatorType fieldDef={this.props.fieldDef} vizualization={this.props.vizualization} />
				);
			} else if (this.props.fieldDef.type == AttributeTypes.SELECT_STRUCTURE) {
				fieldEl = (
					<span className="pdi-normal-text">{this.props.fieldDef.valueLabel}</span>
				);
			} else if (this.props.fieldDef.type == AttributeTypes.RESPONSIBLE_FIELD || this.props.fieldDef.type == AttributeTypes.MANAGER_FIELD) {
				fieldEl = (
					<Responsible fieldId={this.state.fieldId} fieldDef={this.props.fieldDef} vizualization={this.props.vizualization} />
				);
			} else if (this.props.fieldDef.type == AttributeTypes.SELECT_PLAN_FIELD) {
				fieldEl = (
					<SelectPlan fieldDef={this.props.fieldDef} vizualization={this.props.vizualization} />
				);
			} else if ((this.props.fieldDef.type == AttributeTypes.NUMBER_FIELD ||
				this.props.fieldDef.type == AttributeTypes.CURRENCY_FIELD ||
				this.props.fieldDef.type == AttributeTypes.PERCENTAGE_FIELD) && this.props.fieldDef.formattedValue) {
				fieldEl = (
					<span className="pdi-normal-text">{this.props.fieldDef.formattedValue.trim().substr(0, 4) == "null" ? "" : this.props.fieldDef.formattedValue}</span>
				);
			} else if (this.props.fieldDef.type == AttributeTypes.STRATEGIC_OBJECTIVE_FIELD) {
				fieldEl = (
					<StrategicObjective fieldId={this.state.fieldId} fieldDef={this.props.fieldDef} strategicObjectivesPlansParam={this.state.strategicObjectivesPlansParam} />
				);
			} else {
				var text = this.props.fieldDef.description != null
					? this.props.fieldDef.description
					: this.props.fieldDef.value;
					if (this.props.fieldDef.label === "Descrição")
						text = text || Messages.get("label.descriptionNotInformed");
				var element = this.props.fieldDef.type === AttributeTypes.TEXT_AREA_FIELD
					? <pre className="pre-info">
						{text}
					</pre>
					: <span>{text}</span>;
				fieldEl = (
					<span className="pdi-normal-text">{element}</span>
				);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.STRATEGIC_OBJECTIVE_FIELD) {
			fieldEl = (
				<StrategicObjective fieldId={this.state.fieldId} fieldDef={this.props.fieldDef} strategicObjectivesPlansParam={this.state.strategicObjectivesPlansParam} />
			);
		} else if (this.props.fieldDef.type == AttributeTypes.TEXT_AREA_FIELD) {
			if (this.props.isDocument) {
				fieldEl = (
					<div>
						<RichText
							rows={this.props.fieldDef.justificationField ? 3 : this.props.fieldDef.rows}
							maxLength={this.props.fieldDef.justificationField ? '500' : '10000'}
							className={`form-control ${this.props.fieldDef.justificationField ? 'noResize' : 'minHeight170'}`}
							placeholder={this.props.fieldDef.placeholder}
							name={this.props.fieldDef.name}
							defaultValue={this.props.fieldDef.value}
							id={this.state.fieldId}
							ref={this.state.fieldId}
							onChange={this.props.fieldDef.onChange || _.noop}
							onKeyPress={this.onKeyUp}
							onPaste={this.onKeyUp}
						/>
						{!this.props.fieldDef.justificationField &&
							<div className="textAreaMaxLenght documentText">
								<span>{Messages.getEditable("label.maxTenThousandCaracteres", "fpdi-nav-label")}</span>
							</div>
						}
					</div>
				);
			} else {
				if (this.props.fieldDef.disabled) {
					fieldEl = (
						/* Div criada devido a a necessidade de retorno de apenas um elemento no render */
						<div>
							<textarea
								rows={this.props.fieldDef.justificationField ? 3 : this.props.fieldDef.rows}
								maxLength={this.props.fieldDef.justificationField ? '500' : '4000'}
								className={`form-control ${this.props.fieldDef.justificationField ? 'noResize' : 'minHeight170'}`}
								placeholder={this.props.fieldDef.placeholder}
								name={this.props.fieldDef.name}
								defaultValue={this.props.fieldDef.value}
								id={this.state.fieldId}
								ref={this.state.fieldId}
								onChange={this.props.fieldDef.onChange || _.noop}
								onKeyPress={evt => this.onKeyUp(evt, false)}
								onPaste={this.onKeyUp}
								disabled
								title={Messages.get("label.haveNoPermissionToEdit")}
							/>
							{!this.props.fieldDef.justificationField &&
								<div className="textAreaMaxLenght">
									<span>{Messages.getEditable("label.fourThousandCaracteres", "fpdi-nav-label")}</span>
								</div>
							}
						</div>
					);
				} else {
					fieldEl = (
						/* Div criada devido a a necessidade de retorno de apenas um elemento no render */
						<div>
							<textarea
								rows={this.props.fieldDef.justificationField ? 3 : this.props.fieldDef.rows}
								maxLength={this.props.fieldDef.justificationField ? '500' : '4000'}
								className={`form-control ${this.props.fieldDef.justificationField ? 'noResize' : 'minHeight170'}`}
								placeholder={this.props.fieldDef.placeholder}
								name={this.props.fieldDef.name}
								defaultValue={this.props.fieldDef.value}
								id={this.state.fieldId}
								ref={this.state.fieldId}
								onChange={this.props.fieldDef.onChange || _.noop}
								onKeyPress={evt => this.onKeyUp(evt, false)}
								onPaste={this.onKeyUp}
							/>
							{!this.props.fieldDef.justificationField &&
								<div className="textAreaMaxLenght">
									<span>{Messages.getEditable("label.fourThousandCaracteres", "fpdi-nav-label")}</span>
								</div>
							}
						</div>
					);
				}
			}
		} else if (this.props.fieldDef.type == AttributeTypes.SELECT_FIELD) {

			if (this.props.fieldDef.search) {
				if(this.state.selectedOption == null){
					var selected=[]
					var options=[]

					for(var i=0; i<this.props.fieldDef.optionsField.length;i++){
						options.push({label:this.props.fieldDef.optionsField[i].label, value:this.props.fieldDef.optionsField[i].id})
					}
					this.state.optionsField=options

					if(this.props.fieldDef.value != null){
						this.state.selectedOption={label:this.props.fieldDef.value, value:this.props.fieldDef.id}
					}
				}

				fieldEl = (<Select
					value={this.state.selectedOption}
					onChange={this.handleChange}
					name={this.props.fieldDef.name}
					id={this.state.fieldId}
					ref={this.state.fieldId}
					type={this.props.fieldDef.type}
					options={this.state.optionsField}
					placeholder={this.props.fieldDef.placeholder}
					isSearchable="true"
				/>)

			} else {
				fieldEl = (<select
					className="form-control"
					placeholder={this.props.fieldDef.placeholder}
					name={this.props.fieldDef.name}
					id={this.state.fieldId}
					ref={this.state.fieldId}
					type={this.props.fieldDef.type}
					onChange={this.props.fieldDef.onChange || _.noop}
					defaultValue={this.props.fieldDef.value}
				>
				{this.props.fieldDef.value == null ?
					<option value="" disabled selected>{this.props.fieldDef.placeholder}</option >
					: <option value="" disabled>{this.props.fieldDef.placeholder}</option >
				}
				{this.props.fieldDef.optionsField ? this.props.fieldDef.optionsField.map((opt, idx) => {
					return (<option key={'field-opt-' + this.state.fieldId + "-" + idx} defaultValue={opt.label ? opt.label : null}
						data-placement="right" title={opt.label}>
						{opt.label}</option>);
				}) : ''}
				</select>);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.RESPONSIBLE_FIELD || this.props.fieldDef.type == AttributeTypes.MANAGER_FIELD) {
			if (!this.props.fieldDef.users || this.props.fieldDef.users.length <= 0) {
				fieldEl = (
					<input
						className="form-control"
						placeholder={Messages.get("label.noRegisteredUser")}
						name={this.props.fieldDef.name}
						id={this.state.fieldId}
						ref={this.state.fieldId}
						type={this.props.fieldDef.type}
						disabled
						title={Messages.get("label.needRegisterUsersToProceed")}
					>
					</input>
				);
			} else if (this.props.fieldDef.disabled) {
				fieldEl = (
					<select
						className="form-control"
						placeholder={this.props.fieldDef.placeholder}
						name={this.props.fieldDef.name}
						id={this.state.fieldId}
						ref={this.state.fieldId}
						type={this.props.fieldDef.type}
						onChange={this.props.fieldDef.onChange || _.noop}
						defaultValue={this.props.fieldDef.value}
						disabled
						title={Messages.get("label.haveNoPermissionToEdit")}
					>
						{this.props.fieldDef.value == null ?
							<option value="" disabled selected>{this.props.fieldDef.placeholder}</option >
								: <option value="" disabled>{this.props.fieldDef.placeholder}</option >
						}
						{this.props.fieldDef.users ? this.props.fieldDef.users.map((user, idx) => {
							return (<option key={'field-opt-' + this.state.fieldId + "-" + idx} value={user.id}
								data-placement="right" title={user.name}>
								{user.name}</option>);
						}) : ''}
					</select>
				);
			} else {
				fieldEl = (
					<select
						className="form-control"
						placeholder={this.props.fieldDef.placeholder}
						name={this.props.fieldDef.name}
						id={this.state.fieldId}
						ref={this.state.fieldId}
						type={this.props.fieldDef.type}
						onChange={this.props.fieldDef.onChange || _.noop}
						defaultValue={this.props.fieldDef.value}
					>
						{this.props.fieldDef.value == null ?
							<option value="" disabled selected>{this.props.fieldDef.placeholder}</option >
								: <option value="" disabled>{this.props.fieldDef.placeholder}</option >
						}
						{this.props.fieldDef.users ? this.props.fieldDef.users.map((user, idx) => {
							return (<option key={'field-opt-' + this.state.fieldId + "-" + idx} value={user.id}
								data-placement="right" title={user.name}>
								{user.name}</option>);
						}) : ''}
					</select>
				);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.SELECT_PLAN_FIELD) {
			if (this.props.fieldDef.selectPlans.length > 0) {
				fieldEl = (
					<select
						className="form-control"
						placeholder={this.props.fieldDef.placeholder}
						name={this.props.fieldDef.name}
						id={this.state.fieldId}
						ref={this.state.fieldId}
						type={this.props.fieldDef.type}
						onChange={this.props.fieldDef.onChange || _.noop}
						defaultValue={this.props.fieldDef.value}
					>
						{this.props.fieldDef.selectPlans.map((opt, idx) => {
							return (<option key={'field-opt-' + this.state.fieldId + "-" + idx} value={opt.id}
								data-placement="right" title={opt.name}>
								{(opt.name.length > 92) ? (string(opt.name).trim().substr(0, 89).concat("...").toString()) : (opt.name)}
							</option>);
						})}
					</select>
				);
			} else {
				fieldEl = (
					<select
						disabled
						className="form-control"
						name={this.props.fieldDef.name}
						id={this.state.fieldId}
						ref={this.state.fieldId}
						type={this.props.fieldDef.type}
					>
						<option key='field-opt-' data-placement="right" title={Messages.get("label.noGoalPlanRegistered")}>
							{Messages.getEditable("label.noGoalPlanRegistered", "fpdi-nav-label")}
						</option>
					</select>
				);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.RADIO || this.props.fieldDef.type == AttributeTypes.INDICATOR_TYPE) {
			fieldEl = (
				<div>
					<div className="row">
						{this.props.fieldDef.options.map((option, idx) => {
							return (
								<div className="fpdi-indicator-type-ctn col-sm-2" key={this.props.fieldDef.name + "-option-" + idx}>
									<label>
										<input
											className="col-sm-6"
											type="radio"
											name={this.props.fieldDef.name + idx}
											id={this.props.fieldDef.name + idx}
											defaultValue={option[this.props.fieldDef.valueField]}
											defaultChecked={option[this.props.fieldDef.valueField]}
											ref={this.props.fieldDef.name + "-option-" + idx}
											onChange={this.props.fieldDef.onChange || _.noop}
											onKeyPress={this.onKeyUp}
											onPaste={this.onKeyUp}
											onClick={this.props.fieldDef.onClick} />
										<label
											className="fpdi-indicator-type-label col-sm-6"
											htmlFor={this.props.fieldDef.name + idx}
											id={"label-" + idx}>
												{option[this.props.fieldDef.displayField]}
											</label>
									</label>
								</div>
							);
						})}
					</div>
					{this.props.fieldDef.extraRender ? this.props.fieldDef.extraRender() : ""}
				</div>
			);
		} else if (this.props.fieldDef.type == AttributeTypes.SELECT_STRUCTURE) {
			if (this.props.fieldDef.disabled){ 
				fieldEl = <span className="pdi-normal-text">{this.props.fieldDef.valueLabel}</span> 
			}
			else {
			fieldEl = (
				<select
					className="form-control"
					placeholder={this.props.fieldDef.placeholder}
					name={this.props.fieldDef.name}
					id={this.state.fieldId}
					ref={this.state.fieldId}
					onChange={this.props.fieldDef.onChange}
					defaultValue={this.props.fieldDef.value}
				>
					{this.props.fieldDef.options.map((opt, idx) => {
						return (<option key={'field-opt-' + opt.id + "-" + idx} value={opt.id}
							data-placement="right" title={opt.name}>
							{(opt.get("name").length > 20) ? (string(opt.get("name")).trim().substr(0, 15).concat("...").toString()) : (opt.get("name"))}
						</option>);
					})}
				</select>
			);
		}
		} else if (this.props.fieldDef.type == AttributeTypes.DATE_FIELD || this.props.fieldDef.type == AttributeTypes.DATE_TIME_FIELD) {
			if (this.props.fieldDef.disabled) {
				fieldEl = (<div><DatePicker
					className="form-control"
					type="datepicker"
					name={this.props.fieldDef.name}
					defaultValue={this.props.fieldDef.value}
					ref={this.state.fieldId}
					placeholderText="DD/MM/AAAA"
					dateFormat="DD/MM/YYYY"
					id={this.state.fieldId}
					selected={(this.props.fieldDef.value) ? (moment(this.props.fieldDef.value, "DD/MM/YYYY")) : (null)}
					onChange={this.props.fieldDef.onChange || _.noop}
					onKeyPress={this.onKeyUp}
					onPaste={this.onKeyUp}
					maxLength='255'
					showYearDropdown
					disabled
					title={Messages.get("label.haveNoPermissionToEdit")}
					autoComplete="off"
          fixedHeight
				/></div>);
			} else {
				fieldEl = (<div><DatePicker
					className="form-control"
					type="datepicker"
					name={this.props.fieldDef.name}
					defaultValue={this.props.fieldDef.value}
					ref={this.state.fieldId}
					placeholderText="DD/MM/AAAA"
					dateFormat="DD/MM/YYYY"
					id={this.state.fieldId}
					selected={(this.props.fieldDef.value) ? (moment(this.props.fieldDef.value, "DD/MM/YYYY")) : (null)}
					onChange={this.props.fieldDef.onChange || _.noop}
					onKeyPress={this.onKeyUp}
					onPaste={this.onKeyUp}
					maxLength='255'
					showYearDropdown
					autoComplete="off"
					fixedHeight
				/></div>);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.NUMBER_FIELD ||
			this.props.fieldDef.type == AttributeTypes.PERCENTAGE_FIELD ||
			this.props.fieldDef.type == AttributeTypes.CURRENCY_FIELD) {
			if (this.props.fieldDef.disabled) {
				fieldEl = (<input
					onKeyPress={this.onlyNumber}
					onPaste={this.onlyNumberPaste}
					className="budget-field-table"
					//	type='number'
					step='any'
					min="0" //caso seja necessário campo numérico negativo, remover aqui!
					name={this.props.fieldDef.name}
					defaultValue={this.props.fieldDef.editModeValue}
					id={this.state.fieldId}
					ref={this.state.fieldId}
					placeholder={this.props.fieldDef.placeholder}
					onChange={this.props.fieldDef.onChange || _.noop}
					disabled
					title={Messages.get("label.haveNoPermissionToEdit")}
				/>);
			} else {
				fieldEl = (<input
					onKeyPress={this.onlyNumber}
					onPaste={this.onlyNumberPaste}
					//	className="budget-field-table"
					className="form-control"
					step='any'
					//	type='number'
					min="0" //caso seja necessário campo numérico negativo, remover aqui!
					name={this.props.fieldDef.name}
					defaultValue={this.props.fieldDef.editModeValue}
					id={this.state.fieldId}
					ref={this.state.fieldId}
					placeholder={this.props.fieldDef.placeholder}
					onChange={this.props.fieldDef.onChange || _.noop}
				/>);
			}
		} else if (this.props.fieldDef.type == AttributeTypes.TOTAL_FIELD) {
			fieldEl = (<input
				onKeyPress={this.onlyNumber}
				onPaste={this.onlyNumberPaste}
				className="form-control"
				type='number'
				name={this.props.fieldDef.name}
				value={this.props.fieldDef.value || 0}
				id={this.state.fieldId}
				ref={this.state.fieldId}
				placeholder={this.props.fieldDef.placeholder}
				onChange={this.props.fieldDef.onChange || _.noop}
				disabled={true}
			/>);
		} else {
			let tamMaximo = this.props.id && this.props.id.indexOf("tabValue") >0 ? 3000:255;
			fieldEl = (<input
				//className="budget-field-table"
				className="form-control"
				type={this.props.fieldDef.type}				
				onKeyPress={this.onKeyUp}
				onPaste={this.onKeyUp}
				name={this.props.fieldDef.name}
				defaultValue={this.props.fieldDef.value}
				id={this.state.fieldId}
				ref={this.state.fieldId}
				placeholder={this.props.fieldDef.placeholder}
				onChange={this.props.fieldDef.onChange || _.noop}
				maxLength={tamMaximo}
				disabled={this.props.fieldDef.disabled}
				title={this.props.fieldDef.disabled ? Messages.get("label.haveNoPermissionToEdit") : ""}
			/>);
		}

		var strategicObjectivesPlans = "";
		if (this.props.fieldDef.type == AttributeTypes.STRATEGIC_OBJECTIVE_FIELD) {
			if (this.props.fieldDef.selectPlans.length > 0) {
				strategicObjectivesPlans = (
					<select
						className="marginLeft10"
						placeholder={this.props.fieldDef.placeholder}
						name={this.props.fieldDef.name}
						id={this.props.fieldId}
						ref="strategicObjectivesSelectPlan"
						type={this.props.fieldDef.type}
						onChange={this.onStrategicObjectivesSelectPlanChange}
						defaultValue={this.props.fieldDef.value}
					>
						<option value={-1} data-placement="right" title={Messages.get("label.allGoalPlans")}>{Messages.get("label.allGoalPlans")} </option>
						{this.props.fieldDef.selectPlans.map((opt, idx) => {
							return (<option key={'field-opt-' + this.props.fieldId + "-" + idx} value={opt.id} data-placement="right" title={opt.name}>
								{(opt.name.length > 20) ? (string(opt.name).trim().substr(0, 15).concat("...").toString()) : (opt.name)}
							</option>);
						})}
					</select>
				)
			} else {
				strategicObjectivesPlans = (
					<select
						disabled
						className="marginLeft10"
						name={this.props.fieldDef.name}
						id={this.props.fieldId}
						ref={this.props.fieldId}
						type={this.props.fieldDef.type}
					>
						<option key='field-opt-' data-placement="right" title={Messages.get("label.noGoalPlanRegistered")}>
							{Messages.getEditable("label.noGoalPlanRegistered", "fpdi-nav-label")}
						</option>
					</select>
				)
			}
		}
		return (!!this.props.undeletable || !!this.props.alterable ? (
			<div className="panel panel-default panel-margins">
				<div className="panel-heading attribute-input-opts">
					{!this.props.vizualization ?
						<div className="edit-section-attribute">
							<input defaultValue={this.props.fieldDef.label} className="edit-section-attribute-input" maxLength="255" ref="edit-input" /> <br />
							<div className="formAlertError" ref="formAlertError-edit-input"></div>
						</div>
						:
						<div>
							<div className={(!!this.props.undeletable ? (this.state.menuHidden ? "" : "widthLimit pull-left") : "")}>
								<b className="budget-title">{this.props.fieldDef.label}</b>
							</div>
							{strategicObjectivesPlans}
							{this.renderActionButtons()}
							<div className="clearfix" />
						</div>
					}

				</div>
				<div>
					{fieldEl}
				</div>
				<div className="formAlertError" ref="formAlertError"></div>
			</div>
		) : (
				<div className={"form-group form-group-sm" + (this.props.fieldDef.type == 'hidden' ? " hidden" : "")}>
					{this.props.vizualization && this.props.fieldDef.name == "indicator-type" ? "" :
						<label htmlFor={this.state.fieldId} className="fpdi-text-label">
							{this.props.fieldDef.label}
							{this.props.fieldDef.required && !this.props.vizualization ? <span className="fpdi-required">&nbsp;</span> : ""}
						</label>}
					{fieldEl}
					{typeof this.props.fieldDef.helpBox === 'string' ?
						<p className="help-block">{this.props.fieldDef.helpBox}</p>
						: this.props.fieldDef.helpBox
					}
					<div className="formAlertError" ref="formAlertError"></div>
				</div>
			));
	}
});
