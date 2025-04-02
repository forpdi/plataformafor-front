
import React from "react";

import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";

import ScheduleStore from "forpdi/src/forpdi/planning/store/Schedule.jsx";

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import moment from 'moment';
import _ from "underscore";
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import Messages from "forpdi/src/Messages.jsx";

//import Toastr from 'toastr';

var Validate = Validation.validate;

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired,
		accessLevel: React.PropTypes.number.isRequired,
        accessLevels: React.PropTypes.object.isRequired,
        permissions: React.PropTypes.array.isRequired,
        roles: React.PropTypes.object.isRequired,
        planMacro: React.PropTypes.object.isRequired
	},

	getDefaultProps() {
		return {
			fieldDef: {
				type: "text",
				name: "input-"+Date.now(),
				label: '',
				placeholder: '',
				value: null,
				onChange: null,
				helpBox: null,
				undeletable: false,
				alterable: false,
				editing: false,
			}
		};
	},

	getInitialState() {
		return {
			schedule: this.props.data,
			title: this.props.title,
			loading: false,
			initChanged:false,
			idx:-1,
			endChanged:false,
			sortIconStatus: {
				activity: '',
				begin: '',
		  	end: ''},
		};
	},

	newSchedule(evt){
    	this.setState({
    		adding: true,
    		hide: false
    	});
	},

	componentDidMount()	{
		this.setState({
    		adding: false,
    	});
    	ScheduleStore.on('scheduleSaved', model => {
    		if (model.responseText) {
				//console.log(model.responseText);
			} else {
	    		var scheduleInstance = model.data;
				this.state.schedule.scheduleInstances.push(scheduleInstance);
				this.setState({
					adding: false
				});
				//Toastr.remove();
				//Toastr.success("Informações salvas com sucesso");
				this.context.toastr.addAlertSuccess(Messages.get("label.success.informationSaved"));
			}
		}, this);
		ScheduleStore.on("scheduleUpdated", model => {
			if (model.responseText) {
				//console.log(model.responseText);
			} else {
				this.state.schedule.scheduleInstances[this.state.idx] = model.data;
				this.setState({
					loading: false
				});
				//Toastr.remove();
				//Toastr.success("Cronograma editado com sucesso");
				this.context.toastr.addAlertSuccess(Messages.get("label.success.scheduleEdit"));
				this.cancelNewSchedule();
			}
		},this);
		ScheduleStore.on("scheduleDeleted", model => {
			if (model.responseText) {
				//console.log(model.responseText);
			} else {
	    		this.state.schedule.scheduleInstances.splice(this.state.idx,1);
				this.setState({
					loading: false
				});
				//Toastr.remove();
				//Toastr.success("Exclusão realizada com sucesso");
				this.context.toastr.addAlertSuccess(Messages.get("label.success.deletion"));
			}
		},this);
	},
	
	componentWillUnmount() {
		ScheduleStore.off(null, null, this);
	},

	acceptNewSchedule(){
		var validation = Validate.validationNewSchedule(this.refs, this.state);

		if (validation.boolMsg) {
			//Toastr.remove();
 			//Toastr.error(msg);
			this.context.toastr.addAlertError(validation.msg);
 			return;
		}

		//Seta as variáveis de data como nulo para que a proxima inserção elas estejam com nenhuma data definida
		this.state.initDate = null;
		this.state.endDate = null;

		var scheduleValues = [];
		if (this.state.schedule.scheduleStructures.length >0) {
			this.state.schedule.scheduleStructures.map((model, idx) => {
				scheduleValues.push({
					value: document.getElementById('schedValue'+idx).value,
					scheduleStructure: {
						id: this.state.schedule.scheduleStructures[idx].id
					}
				});
			});
		}
		var scheduleInstance = {
			description:  validation.desc,
			begin: validation.initDate,
			end:  validation.endDate,
			periodicity: validation.peri,
			scheduleValues: scheduleValues,
			scheduleId: this.state.schedule.id
		};
		this.props.newFunc(scheduleInstance);
	},

	deleteSchedule(id, idx,evt){

		Modal.deleteConfirm(() => {
			Modal.hide();
			this.setState({
				loading: true,
				idx: idx //index a ser deletado
			});
			ScheduleStore.dispatch({
				action: ScheduleStore.ACTION_DELETE,
				data: {
					id: id
				}
			});
		});
	},


	acceptEditSchedule(id, idx){
		var validation = Validate.validationEditSchedule(this.refs, this.state);


		if (validation.boolMsg) {
			//Toastr.remove();
 			//Toastr.error(msg);
			this.context.toastr.addAlertError(validation.msg);
 			return;
		}

		var scheduleValues = [];
		if (this.state.schedule.scheduleInstances.length >0) {
			if (this.state.schedule.scheduleInstances[idx].scheduleValues.length >0) {
				this.state.schedule.scheduleInstances[idx].scheduleValues.map((mod, i) => {
					scheduleValues.push({
						value: document.getElementById('valueSchedule'+mod.id).value,
						scheduleStructure: {
							id: mod.scheduleStructure.id
						}
					});
				});
			}
		}
		var scheduleInstance = {
			id: id,
			description: validation.desc,
			begin:  validation.initDate,
			end:  validation.endDate,
			periodicity:  validation.peri,
			scheduleValues: scheduleValues,
			scheduleId: this.state.schedule.id
		};
        this.setState({
			loading: true,
			idx: idx //index a ser editado
		});
		this.props.newFunc(scheduleInstance);
	},

	editSchedule(id,idx) {
		this.setState({
			editingScheduleID: id,
			editingScheduleIdx: idx
		})
	},

	cancelNewSchedule(){
		this.setState({
    		adding: false,
    		editingScheduleID: 0,
    		editingScheduleIdx: null
    	});
	},

	onKeyUp(evt){
		var key = evt.which;
		if(key == 13) {
			evt.preventDefault();
			return;
		}
	},

	onChangeInit(data){
		this.setState({
			initDate: data,
			initChanged:true,
		})
	},
	onChangeEnd(data){
		this.setState({
			endDate: data,
			endChanged:true
		})
	},

	renderNewSchedule(){
		return(
			<tr key='new-schedule'>
				<td></td>
				<td><input type='text' className='budget-field-table' ref="scheduleDescription" onKeyPress={this.onKeyUp}/>
					<div className="formAlertError" ref="formAlertErrorDescription"></div>
				</td>
				<td><DatePicker
					type="datepicker"
					ref='begin'
					className='budget-field-table'
					dateFormat="DD/MM/YYYY"
					selected={this.state.initDate}
					onChange={this.onChangeInit}
					placeholderText="DD/MM/AAAA"
					showYearDropdown
					autoComplete="off"
          fixedHeight
					/>
					<div className="formAlertError" ref="formAlertErrorBegin"></div>
				</td>
				<td><DatePicker
					type="datepicker"
					ref='end'
					className='budget-field-table'
					dateFormat="DD/MM/YYYY"
					selected={this.state.endDate}
					onChange={this.onChangeEnd}
					placeholderText="DD/MM/AAAA"
					showYearDropdown
					autoComplete="off"
					fixedHeight
					/>
					<div className="formAlertError" ref="formAlertErrorEnd"></div>
				</td>
				{this.state.schedule.periodicityEnable ?
					<td><input type='text' className='budget-field-table' ref="schedulePeriodicity" onKeyPress={this.onKeyUp}/>
						<div className="formAlertError" ref="formAlertErrorPeriodicity"></div>
					</td>
				: <td></td>}
				{this.state.schedule.scheduleStructures.length >0 ?
					this.state.schedule.scheduleStructures.map((model, idx) => {
						return(
							<td key={"value-"+idx}><input type='text' className='budget-field-table' id={"schedValue"+idx} ref={"schedValue"+idx} onKeyPress={this.onKeyUp}/>
								<div className="formAlertError" ref={"formAlertError"+idx}></div>
							</td>
						);
					})
				: <td></td>}
				<td>
                    <div className='displayFlex'>
                       	<span className='mdi mdi-check accepted-budget' onClick={this.acceptNewSchedule} title={Messages.get("label.submitLabel")}></span>
                      	<span className='mdi mdi-close reject-budget' onClick={this.cancelNewSchedule} title={Messages.get("label.cancel")}></span>
                   	</div>
	            </td>
			</tr>
		);
	},

	hideFields() {
		this.setState({
			hide: !this.state.hide
		})
	},

	sortTypes(data, colType, order){

		data.sort(function(a, b) {
			if (colType === 'activity'){		
				return a.description < b.description ? order[0] : order[1]
			}
			else if(colType === 'begin' || colType === 'end'){
				var datearrayA = a[colType].split("/");
				var datearrayB = b[colType].split("/");

				return Date.parse(datearrayA[1] + '/' + datearrayA[0] + '/' + datearrayA[2])
					< Date.parse(datearrayB[1] + '/' + datearrayB[0] + '/' + datearrayB[2]) ? order[0] : order[1]
				}
			else{
				return a.tableValues[column].value < b.tableValues[column].value ? order[0] : order[1]
			}
		})
	},

	quickSort(sorting, colType){
		var scheduleInstances = [];
		const { schedule, sortIconStatus } = this.state;
		scheduleInstances = this.state.schedule.scheduleInstances;

		if(sorting == "asc"){
			this.sortTypes(scheduleInstances, colType, [-1, 1]);
		} else if(sorting == "desc"){
			this.sortTypes(scheduleInstances, colType, [1, -1]);
		}

   		this.setState({
				schedule: {
					...schedule, 
					scheduleInstances
				},
				sortIconStatus: {
					...'',
					[colType]: sorting,
				}
   		})
	},

	renderScheduleField(edit, model, idx){
		if(edit){
			return this.renderEditSchedule(model,idx);
		} else {
			return (
				<tr key={"schedule-"+idx}>
					<td>{model.number}</td>
					<td>{model.description}</td>
					<td>{model.begin.split(" ")[0]}</td>
					<td>{model.end.split(" ")[0]}</td>
					{model.periodicityEnable ?
						<td>{model.periodicity}</td>
					: <td></td>}
					{model.scheduleValues.length >0 ?
						model.scheduleValues.map((mod, id) => {
							return(
								<td key={"scheduleValue-"+id}>{mod.value}</td>
							);
						})
					: <td></td>}

					{(this.context.roles.MANAGER || _.contains(this.context.permissions,
						PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && !this.context.planMacro.get('archived')?
						<td className="edit-budget-col floatRight scheduleRenderIcons">
							<span className="mdi mdi-pencil" onClick={this.editSchedule.bind(this,model.id,idx)}/>
							<span className="mdi mdi-delete" onClick={this.deleteSchedule.bind(this,model.id,idx)}/>
						</td>
					: <td></td>}
				</tr>
			);
		}
	},

	renderEditSchedule(model,idx){
		if(idx != this.state.idx){
			this.state.initChanged = false;
			this.state.endChanged = false;
		}
		this.state.idx = idx;
		var dataBegin = new Date ();
		var dataSimple = model.begin.split(" ");
		var data = dataSimple[0].split("/");
		dataBegin = data[0]+"/"+(data[1])+"/"+data[2];
		var dataEnd = new Date ();
		var dataSimple = model.end.split(" ");
		var data = dataSimple[0].split("/");
		dataEnd = data[0]+"/"+(data[1])+"/"+data[2];
		dataBegin = moment(dataBegin,"DD/MM/YYYY");
		dataEnd = moment(dataEnd,"DD/MM/YYYY");
		if(!this.state.initChanged){
		    this.state.initDate = dataBegin;
		}
		if(!this.state.endChanged){
			this.state.endDate = dataEnd;
		}
		return(
			<tr key={"schedule"+idx}>
				<td>{model.number}</td>
				<td><input type='text' ref='descriptionEdit' className='budget-field-table' defaultValue={model.description} />
					<div className="formAlertError" ref="formAlertErrorDescriptionEdit"></div>
				</td>
				<td><DatePicker
					type="datepicker"
					ref='begin'
					className='budget-field-table'
					dateFormat="DD/MM/YYYY"
					selected={this.state.initDate}
					onChange={this.onChangeInit}
					placeholderText="DD/MM/AAAA"
					showYearDropdown
					autoComplete="off"
					fixedHeight
					/>
					<div className="formAlertError" ref="formAlertErrorBeginEdit"></div>
				</td>
				<td><DatePicker
					type="datepicker"
					ref='end'
					dateFormat="DD/MM/YYYY"
					selected={this.state.endDate}
					onChange={this.onChangeEnd}
					placeholderText="DD/MM/AAAA"
					showYearDropdown
					autoComplete="off"
					fixedHeight
					/>
					<div className="formAlertError" ref="formAlertErrorEndEdit"></div>
				</td>
	            {model.periodicityEnable ?
					<td><input type='text' ref='periodicityEdit' className='budget-field-table' defaultValue={model.periodicity} onKeyPress={this.onKeyUp}/>
						<div className="formAlertError" ref="formAlertErrorPeriodicityEdit"></div>
					</td>
				: <td></td>}
				{model.scheduleValues.length >0 ?
					model.scheduleValues.map((mod, i) => {
						return(
						<td><input type='text' ref='valueEdit' id={'valueSchedule'+mod.i} className='budget-field-table' defaultValue={mod.value} onKeyPress={this.onKeyUp}/>
							<div className="formAlertError" ref="formAlertErrorValueEdit"></div>
						</td>);
					})
				: <td></td>}
				<td className="edit-budget-col floatRight scheduleRenderIcons">
	               	<span className='mdi mdi-check accepted-budget' onClick={this.acceptEditSchedule.bind(this,model.id,idx)} title={Messages.get("label.submitLabel")}></span>
	              	<span className='mdi mdi-close reject-budget' onClick={this.cancelNewSchedule} title={Messages.get("label.cancel")}></span>
		        </td>
			</tr>
		);
	},

	edit(){
		this.setState({
			editing: true
		});
	},

	cancelEditing(){
		this.setState({
			editing: false
		});
	},

	confirmEdit(){
		if(this.refs['edit-input'].value.trim() != ""){
			this.props.editFunc(this.refs['edit-input'].value, this.props.index);
			this.state.title = this.refs['edit-input'].value;
			this.cancelEditing();
		}else{
			this.context.toastr.addAlertError(Messages.get("label.error.completeSchedule"));
		}
	},

	renderEditTitle(){
		return(
			<div className="panel-heading attribute-input-opts">
			<div className="edit-section-attribute">
				<input defaultValue={this.props.fieldDef.label == "" ? this.state.title : this.props.fieldDef.label} className="edit-section-attribute-input" ref="edit-input"/>
				<div className=' displayFlex'>
                   	<span className='mdi mdi-check accepted-budget' onClick={this.confirmEdit} title={Messages.get("label.submitLabel")}></span>
                  	<span className='mdi mdi-close reject-budget' onClick={this.cancelEditing} title={Messages.get("label.cancel")}></span>
               	</div>
			</div>
			</div>
		);
	},

	render(){
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		return(
			<div className="panel panel-default panel-margins">
				{!!this.state.editing ? this.renderEditTitle()
				:
				<div className="panel-heading displayFlex attribute-input-opts">
					<b className="budget-title" ref="titleSchedule">{this.state.title}</b>
					{!!this.props.isDocument ? ((this.context.roles.MANAGER || _.contains(this.context.permissions,
													PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && !this.context.planMacro.get('archived') ?
					<span className="mdi mdi-pencil attribute-input-edit atribute-input-edit-schedule inner"
					title={Messages.get("label.title.changeField")} onClick={this.edit}/> :"") : ""}
					{(this.state.adding)?
						"":
					<div className="budget-btns">
					{(this.context.roles.MANAGER || _.contains(this.context.permissions,
						PermissionsTypes.MANAGE_DOCUMENT_PERMISSION)) && !this.context.planMacro.get('archived') ?
						<button type="button" className="btn btn-primary budget-new-btn" onClick={this.newSchedule}>{Messages.get("label.new")}</button>
					:""}
						<span  className={(this.state.hide)?("mdi mdi-chevron-right marginLeft15"):("mdi mdi-chevron-down marginLeft15")}  onClick={this.hideFields}/>
					</div>}
				</div>
				}
				<table className="budget-field-table table">
					<thead>
						<tr>
							<th>#</th>
							<th>{Messages.getEditable("label.activity","fpdi-nav-label")}
								<span className={this.state.sortIconStatus['activity'] == "desc" ? "mdi mdi-sort-ascending cursorPointer" :
									(this.state.sortIconStatus['activity'] == "asc" ? "mdi mdi-sort-descending cursorPointer" : "mdi mdi-sort cursorPointer")}
									onClick={(this.state.sortIconStatus['activity'] == "" || this.state.sortIconStatus['activity'] == "desc")
									? this.quickSort.bind(this, "asc", 'activity') : this.quickSort.bind(this, "desc", 'activity')}> 
								</span>
							</th>
							<th>{Messages.getEditable("label.begin","fpdi-nav-label")}
							<span className={this.state.sortIconStatus['begin'] == "desc" ? "mdi mdi-sort-ascending cursorPointer" :
									(this.state.sortIconStatus['begin'] == "asc" ? "mdi mdi-sort-descending cursorPointer" : "mdi mdi-sort cursorPointer")}
									onClick={(this.state.sortIconStatus['begin'] == "" || this.state.sortIconStatus['begin'] == "desc")
									? this.quickSort.bind(this, "asc", 'begin') : this.quickSort.bind(this, "desc", 'begin')}> 
								</span>
							</th>
							<th>{Messages.getEditable("label.end","fpdi-nav-label")}
							<span className={this.state.sortIconStatus['end'] == "desc" ? "mdi mdi-sort-ascending cursorPointer" :
									(this.state.sortIconStatus['end'] == "asc" ? "mdi mdi-sort-descending cursorPointer" : "mdi mdi-sort cursorPointer")}
									onClick={(this.state.sortIconStatus['end'] == "" || this.state.sortIconStatus['end'] == "desc")
									? this.quickSort.bind(this, "asc", 'end') : this.quickSort.bind(this, "desc", 'end')}> 
								</span>
							</th>
							{this.state.schedule.periodicityEnable ? <th>{Messages.getEditable("label.title.periodicity","fpdi-nav-label")}</th> : <th></th>}
							{this.state.schedule.scheduleStructures.length >0 ?
								this.state.schedule.scheduleStructures.map((model, idx) => {
									return(
										<th key={"structure-"+idx}>{model.label}</th>
									);
								})
							: <th></th>}
						</tr>
					</thead>
					<tbody>
						{this.state.adding ? this.renderNewSchedule() : undefined}
						{!this.state.hide ? this.state.schedule.scheduleInstances.map((model, idx) => {
							return this.renderScheduleField((model.id == this.state.editingScheduleID),model,idx);
						}) : <th></th>}
					</tbody>
				</table>
			</div>
		);
	}

});
