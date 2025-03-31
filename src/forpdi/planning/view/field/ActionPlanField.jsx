import _ from "underscore";
import moment from 'moment';
import React from "react";
import ActionPlanStore from "forpdi/src/forpdi/planning/store/ActionPlan.jsx";
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import DatePicker from 'react-datepicker';
import { parseDate, parseDateToStr, splitDateTime, isDateInRange } from 'forpdi/src/utils/dateUtil';
import 'react-datepicker/dist/react-datepicker.css';
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import Messages from "forpdi/src/Messages.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import TablePagination from "forpdi/src/forpdi/core/widget/TablePagination.jsx";
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import UserStore from "forpdi/src/forpdi/core/store/User.jsx";
import Pagination from 'forpdi/src/components/Pagination';
import NewModal from "forpdi/src/components/modals/Modal";
import AdvancedSearchModal from "forpdi/src/forpdi/planning/widget/AdvancedSearchModal";
import AccessLevels from 'forpdi/src/forpdi/core/store/AccessLevels.json';
import LinkActionPlanModal from 'forpdi/src/forpdi/planning/widget/LinkActionPlanModal';
import StructureStore from "forpdi/src/forpdi/planning/store/Structure.jsx";

var Validate = Validation.validate;

const statusEnum = {
	none: { name: 'Sem status', id: 1 },
	completed: { name: 'Concluído', id: 2 },
	notCompleted: { name: 'Não concluído', id: 3 },
};
const statusList = _.values(statusEnum);

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired,
		accessLevel: React.PropTypes.number.isRequired,
		accessLevels: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
		roles: React.PropTypes.object.isRequired
	},

	getInitialState() {
		var datatual = new Date();
		var ano = datatual.getFullYear();
		if(!(this.props.dataIniPlan<= ano && 
			this.props.dataFimPlan>=ano)){
				ano = '';
			}
		return {
			error: false,
			errorMessage: "",
			actionPlans: null,
			parentId: null,
			users: null,
			selectedUserId: '',
			editingActionID: 0,
			status: statusEnum.none.id,
			hide: false,
			initChanged:false,
			idx:-1,
			endChanged:false,
			ref: null,
			levelInstanceId: this.props.levelInstanceId,
			loading: true,
			totalPlans: null,
			simpleFilter: '',
			advancedFilters: null,
			page: 1,
			pageSize: 5,
			sortFieldName:"description",
			sortDirection: "asc",
			sortedBy:["description", true]
		};
	},

	componentDidMount()	{
		this.setState({
    		adding: false,
    	});
    	ActionPlanStore.on("actionPlanSavedSuccess", model => {
			this.state.actionPlans.push(model.data);
			this.setState({
				adding: false,
				loading:false,
			});

			this.clearSearch();

			this.context.toastr.addAlertSuccess(Messages.get("label.success.planSaved"));
		},this);

		ActionPlanStore.on("actionPlanDeletedSuccess", model => {
			const filteredActions = _.filter(this.state.actionPlans, ({ id }) => id !== model.data.id);

			this.setState({
				actionPlans: filteredActions,
				totalPlans: filteredActions.length,
			});

			this.context.toastr.addAlertSuccess(Messages.get("label.success.actionPlanDeleted"));
		},this);

		ActionPlanStore.on("actionPlanDeletedError", model => {
			this.context.toastr.addAlertError(Messages.get("label.error.deletePlanAction"));
			this.setState({
				adding: false,
				Loading:false
			});
		},this);

		ActionPlanStore.on("actionPlanEdited", model => {

			if(model.responseText){
				this.context.toastr.addAlertError(Messages.get("label.error.alreadyRegisteredPlanAction"));
			} else{
				this.context.toastr.addAlertSuccess(Messages.get("label.success.editPlanAction"));
				this.setState({
					loading:false
				})
			}

			const newActionPlans = this.state.actionPlans;
			newActionPlans.splice(newActionPlans.findIndex(elem => elem.id === this.state.editingActionID),1,model.data);

			this.setState({actionPlans: newActionPlans});
			this.cancelNewActionPlan();
		});

		ActionPlanStore.on("listActionPlanRetrieved", (model) => {
			this.setState({
				actionPlans:model.data,
				loading:false,
				totalPlans:model.total
			})
		},this);

		UserStore.on('retrieve-to-select-user', ({ data }) => {
			this.setState({
				users: data.list,
			});
		},this)

		UserStore.dispatch({
			action: UserStore.ACTION_RETRIEVE_TO_SELECT_USER,
		});

		ActionPlanStore.on("actionPlanLinked", model => {
			this.context.toastr.addAlertSuccess(Messages.get("label.success.editPlanAction"));
		});

		StructureStore.on("levelSonsRetrieved", (model) => {
			this.setState({
				parentId: model.data.id,
			});
		}, this);
		this.clearSearch();
	},

	componentWillUnmount() {
		ActionPlanStore.off(null, null, this);
	},

	newActionPlan() {
		if(this.props.dateBegin && this.props.dateEnd){
					this.setState({
						adding: true,
						editingActionID: 0,
						hide: false,
						endDate: undefined,
						initDate: undefined,
						loading:false,
						status: statusEnum.none.id,
						selectedUserId: '',
						});
						return;
			}
			
			this.context.toastr.addAlertError(Messages.get("label.fillRequiredFieldsToGenerateActionPlan"));
	},

	onKeyUp(evt){
		var key = evt.which;
		if(key == 13 || key == 17) {
			evt.preventDefault();
			return;
		}
	},

	maxLengthMask(){
		if(this.refs[this.ref].value.length >= this.refs[this.ref].maxLength){
			const msg = Messages.get("label.limit") + this.refs[this.ref].maxLength + " " + Messages.get("label.error.limitCaracteres");
			this.context.toastr.addAlertError(msg);
		}
	},

	emptyValidation(isDate, formAlertError){
		if(isDate){
			this.refs[formAlertError].innerHTML = '';
		}else{
			if(this.refs[this.ref].value != ""){
				this.refs[this.ref].className = "budget-field-table";
				this.refs[formAlertError].innerHTML = '';
			}
		}
	},

	cancelNewActionPlan(){
		this.setState({
    		adding: false,
    		editingActionID: 0,
    	});
	},

acceptNewActionPlan() {
  const validation = Validate.validationNewActionPlan(this.state, this.refs);

  if (validation.boolMsg) {
      this.context.toastr.addAlertError(validation.msg);
      return;
  }

  const startDate =this.props.dateBegin;
  const finalDate =  this.props.dateEnd;

  const beginDate = parseDateToStr(validation.dataBegin);
    const endDate = parseDateToStr(validation.dataEnd);

  if (!beginDate) {
    this.context.toastr.addAlertError("Data de início inválida.");
    return;
  }

  if (!endDate) {
    this.context.toastr.addAlertError("Data de término inválida.");
    return;
  }

  if (!isDateInRange(beginDate, startDate, finalDate) || !isDateInRange(endDate, startDate, finalDate)) {
    this.context.toastr.addAlertError(Messages.get("label.error.invalidActionPlanDateRange"));
    return;
  }

  const actionPlan = {
      description: this.refs.descricao.value,
      responsible: '',
      begin: validation.dataBegin,
      end: validation.dataEnd,
      user: { id: this.state.selectedUserId },
      ...this.parseStatusValueToActionFlags(this.state.status),
  };

  this.props.newFunc(actionPlan);
},

	linkGoal(id, linkedGoalId){

		ActionPlanStore.dispatch({
			action: ActionPlanStore.ACTION_LINK_GOAL,
			data: {
				id: id,
				linkedGoalId: linkedGoalId,
			}
		});
	},

	acceptEditActionPlan(id) {
    var validation = Validate.validationEditActionPlan(this.state, this.refs);

    const startDate =  this.props.dateBegin;
    const finalDate =  this.props.dateEnd;

    const beginDate = validation.initDate;
    const endDate = validation.endDate;

    if (!beginDate) {
        this.context.toastr.addAlertError("Data de início inválida.");
        return;
    }

    if (!endDate) {
        this.context.toastr.addAlertError("Data de término inválida.");
        return;
    }

    if (!isDateInRange(beginDate, startDate, finalDate) || !isDateInRange(endDate, startDate, finalDate)) {
      this.context.toastr.addAlertError(Messages.get("label.error.invalidActionPlanDateRange"));
      return;
    }

    ActionPlanStore.dispatch({
        action: ActionPlanStore.ACTION_CUSTOM_UPDATE,
        data: {
            id: id,
            description: this.refs.descricaoEdit.value,
            responsible: '',
            begin: validation.initDate,
            end: validation.endDate,
            userId: this.state.selectedUserId,
            ...this.parseStatusValueToActionFlags(this.state.status),
        }
    });
},

	editActionPlan(actionPlan, idx) {
		var dataBegin = new Date ();
		var dataSimple = actionPlan.begin.split(" ");
		var data = dataSimple[0].split("/");
		dataBegin = data[0]+"/"+(data[1])+"/"+data[2];
		var dataEnd = new Date ();
		var dataSimple = actionPlan.end.split(" ");
		var data = dataSimple[0].split("/");
		dataEnd = data[0]+"/"+(data[1])+"/"+data[2];
		dataBegin = moment(dataBegin,"DD/MM/YYYY");
		dataEnd = moment(dataEnd,"DD/MM/YYYY");

		const selectedUserId = actionPlan && actionPlan.user
			? actionPlan.user.id
			: '';

		this.setState({
			editingActionID: actionPlan.id,
			status: this.parseActionPlanToStatusValue(actionPlan),
			adding: false,
			initDate: dataBegin,
			endDate: dataEnd,
			loading:false,
			selectedUserId,
		})
	},

	onHandleRenderModal(action) {

    const modal = (
      <LinkActionPlanModal
        heading={Messages.get('label.planAction')}
				actionPlan={action}
				users={this.state.users}
				parentId={this.state.parentId}
				onChange={(linkedGoalId) => this.linkGoal(action.id, linkedGoalId)}
				actionPlanId={action.id} 
      />
    );

    NewModal.show(modal, "fpdi");
  },

	deleteActionPlan(id, idx,evt) {
		var msg = Messages.get("label.deleteConfirmation") + " " + ((this.state.actionPlans[idx].description.length >150)?(this.state.actionPlans[idx].description.substr(0,150)+"..."):
			(this.state.actionPlans[idx].description)) + "?"

		Modal.confirmCancelCustom(() => {
				Modal.hide();
				ActionPlanStore.dispatch({
					action: ActionPlanStore.ACTION_DELETE,
					data: {
					id: id
					}
				});

			},msg,()=>{Modal.hide()});
	},

	updateStatus(e, actionPlan) {
		const { value } = e.target;

		const statusFlags = this.parseStatusValueToActionFlags(value);

		var msg = Messages.get("label.updatePlanActionStatus") + " " + actionPlan.description + "?";

		Modal.confirmCustom(() => {
			ActionPlanStore.dispatch({
				action: ActionPlanStore.ACTION_UPDATE_STATUS,
				data: {
					id: actionPlan.id,
					...statusFlags,
				}
			});

			Modal.hide();
			const updatedActionPlans = _.map(
				this.state.actionPlans,
				ap => (ap.id === actionPlan.id ? { ...ap, ...statusFlags } : ap)
			);

			this.setState({
				actionPlans: updatedActionPlans,
			});
		}, msg, () => Modal.hide());
	},

	hideFields() {
		this.setState({
			hide: !this.state.hide
		})
	},

	onChangeInit(formAlertError, data){
		this.emptyValidation(true, formAlertError)
		this.setState({
			initDate:data,
			initChanged:true
		});
	},

	onChangeEnd(formAlertError, data){
		this.emptyValidation(true, formAlertError)
		this.setState({
			endDate: data,
			endChanged:true
		})
	},

	onChangeStatus(e) {
		this.setState({ status: parseInt(e.target.value, 10) });
	},

	pageChange(page,pageSize) {
		this.setState({
			loading: true,
			page: page,
			pageSize: pageSize
		}, () => this.getActionPlans());
	},

	parseStatusValueToLabel(value) {
		return _.find(statusList, ({ id }) => id === value).name;
	},

	parseActionPlanToStatusValue(actionPlan) {
		if (actionPlan.checked) {
			return statusEnum.completed.id;
		}
		if (actionPlan.notChecked) {
			return statusEnum.notCompleted.id;
		}

		return statusEnum.none.id;
	},

	parseStatusValueToActionFlags(value) {
		if (value === -1) {
			return {};
		}
		
		return {
			checked: parseInt(value, 10) === statusEnum.completed.id,
			notChecked: parseInt(value, 10) === statusEnum.notCompleted.id,
		};
	},

	renderActionField(edit, action,idx){
		if(edit){
			return this.renderEditActionPlan(action);
		} else {
			const status = this.parseActionPlanToStatusValue(action);

			return (
				<tr key={"action"+action.id} >
					<td>
						{
							this.hasEditPermissionOrIsActionResponsible(action) ? (
								this.renderStatusSelectField(status, e => this.updateStatus(e, action))
							) : this.parseStatusValueToLabel(status)
						}
					</td>
					<td style={{ maxWidth: '50px', wordBreak: 'break-word' }}>{action.description}</td>
					<td>{this.getResponsibleName(action)}</td>
					<td>{action.begin.split(" ")[0]}</td>
					<td>{action.end.split(" ")[0]}</td>
					<td id={'options'+idx} className='edit-budget-col cursorDefault' style={{ marginTop: '-1px'}}>
						{
							this.hasEditPermissionOrIsActionResponsible(action) && (
								<span className='mdi mdi-pencil cursorPointer' onClick={() => this.editActionPlan(action, idx)} title={Messages.get("label.title.editInformation")}/>
							)
						}
						{
							this.hasEditPermission() && (
								<span className='mdi mdi-delete cursorPointer' onClick={() => this.deleteActionPlan(action.id, idx)} title={Messages.get("label.delete")}/>
							)
						}
						{
							this.hasEditPermission() && (
								<span className='mdi mdi-eye cursorPointer' onClick={() => this.onHandleRenderModal(action)} title={Messages.get("label.view")}/>
							)
						}
					</td>
				</tr>
			);
		}
	},

	hasEditPermissionOrIsActionResponsible(action) {
		const { user } = action;
		const isResponsible = user && user.id == UserSession.get("user").id;
		return this.hasEditPermission() || isResponsible;
	},

	hasEditPermission() {
		const isIndicatorResponsible = this.props.responsible && UserSession.get("user").id == this.props.responsible.id;
		return (this.context.roles.MANAGER)
			|| _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION)
			|| isIndicatorResponsible;
	},

	getResponsibleName(action) {
		const { user, responsible } = action;
		return user && user.id
			? user.name
			: responsible;
	},

	renderEditActionPlan(action){
    var desc = 'descricaoEdit';
    var me = this;
    return(
        <tr key={"action"+action.id} >
            <td className="table-cell small-width">
                {this.renderStatusSelectField(this.state.status, this.onChangeStatus)}
            </td>
            <td className="table-cell large-width">
						<textarea
                    ref='descricaoEdit'
                    className='budget-field-table full-width'
                    placeholder="Informe a descrição"
                    defaultValue={action.description}
                    maxLength="3900"
                    rows="1"
                    style={{resize: "none", overflow: 'hidden', height: 'auto'}}
                    onInput={this.handleTextareaInput}
                    onKeyUp={function(evt){
                        this.ref = desc;
                        if (evt.which != 17) {
                            me.onKeyUp(evt);
                            me.maxLengthMask();
                            me.emptyValidation(false,"formAlertErrorDescriptionEdit");
                        }
                    }}
                />
                <div ref="formAlertErrorDescriptionEdit" className="formAlertError"></div>
            </td>
            <td className="table-cell flex-width">
                {
                    this.hasEditPermission()
                        ? this.renderResponsibleField()
                        : this.getResponsibleName(action)
                }
            </td>
            <td className="table-cell">
                <DatePicker
                    type="datepicker"
                    ref='begin'
                    className="date-picker-width"
                    dateFormat="DD/MM/YYYY"
                    selected={this.state.initDate}
                    onChange={this.onChangeInit.bind(this,"formAlertErrorBeginEdit")}
                    placeholderText="DD/MM/AAAA"
                    showYearDropdown
                    autoComplete="off"
                    fixedHeight
                />
                <div ref="formAlertErrorBeginEdit" className="formAlertError"></div>
            </td>
            <td className="table-cell">
                <DatePicker
                    type="datepicker"
                    ref='end'
                    className="date-picker-width "
                    dateFormat="DD/MM/YYYY"
                    selected={this.state.endDate}
                    onChange={this.onChangeEnd.bind(this,"formAlertErrorEndEdit")}
                    placeholderText="DD/MM/AAAA"
                    showYearDropdown
                    autoComplete="off"
                    fixedHeight
                />
                <div ref="formAlertErrorEndEdit" className="formAlertError"></div>
            </td>
            <td className="table-cell small-width">
                <div className='displayFlex'>
                    <span className='mdi mdi-check accepted-budget' onClick={this.acceptEditActionPlan.bind(this,action.id)} title={Messages.get("label.submitLabel")}></span>
                    <span className='mdi mdi-close reject-budget' onClick={this.cancelNewActionPlan} title={Messages.get("label.cancel")}></span>
                </div>
            </td>
        </tr>
    );  
},

	handleTextareaInput(e) {
		e.target.style.height = 'inherit';
		e.target.style.height = `${e.target.scrollHeight}px`;
	},


	renderNewActionPlan(){
		this.state.idx = this.state.actionPlans.length;
		var desc = "descricao";
		var me = this;
		return(
			<tr key='new-actionPlan'>
				<td>
					{this.renderStatusSelectField(this.state.status, this.onChangeStatus)}
				</td>
				<td>
					<textarea
						type='text'
						ref="descricao"
						className='budget-field-table'
						placeholder="Informe a descrição"
						rows="1" 
						style={{resize: "none", overflowY: "hidden"}}
						onInput={this.handleTextareaInput}
						maxLength="3900"
						onKeyUp={function(evt){
						me.ref = desc;
						if (evt.which != 17) {
							me.onKeyUp(evt);
							me.maxLengthMask();
							me.emptyValidation(false,"formAlertErrorDescription");
						}
					}}
					/>
					<div ref="formAlertErrorDescription" className="formAlertError"></div>
				</td>
				<td>
					{this.renderResponsibleField()}
				</td>
				<td>
					<DatePicker
						type="datepicker"
						className = 'budget-field-table'
						ref='begin'
						dateFormat="DD/MM/YYYY"
						selected={this.state.initDate}
						onChange={this.onChangeInit.bind(this,"formAlertErrorBegin")}
						placeholderText="DD/MM/AAAA"
						showYearDropdown
						autoComplete="off"
						fixedHeight
					/>
					<div ref="formAlertErrorBegin" className="formAlertError"></div>
				</td>
				<td>
					<DatePicker
						type="datepicker"
						className = 'budget-field-table'
						ref='end'
						dateFormat="DD/MM/YYYY"
						selected={this.state.endDate}
						onChange={this.onChangeEnd.bind(this,"formAlertErrorEnd")}
						placeholderText="DD/MM/AAAA"
						showYearDropdown
						autoComplete="off"
						fixedHeight
					/>
					<div ref="formAlertErrorEnd" className="formAlertError"></div>
				</td>
				<td>
					<div className='displayFlex'>
							<span className='mdi mdi-check accepted-budget' onClick={this.acceptNewActionPlan} title={Messages.get("label.submitLabel")}></span>
							<span className='mdi mdi-close reject-budget' onClick={this.cancelNewActionPlan} title={Messages.get("label.cancel")}></span>
					</div>
				</td>
			</tr>
		);
	},

	renderStatusSelectField(value, onChange) {
		return (
			<div style={{ width: '100px'}}>
				<select
					value={value}
					onChange={onChange}
					className='budget-field-table'
					style={{ padding: '1.5px 2px', width: '100.5px' }}
				>
					{
						_.map(statusList, ({ name, id }) => (
							<option value={id} key={id}>{name}</option> 
						))
					}
				</select>
			</div>
		);
	},

	renderResponsibleField() {
		const { users, selectedUserId } = this.state;
		return (
			<div>
				<select
					value={selectedUserId}
					style={{ width: '130px' }}
					onChange={(e) => this.setState({ selectedUserId: e.target.value })}
					ref="responsavel"
				>
					<option key="none-selected-user" value='' disabled>
						{Messages.get('label.selectResponsible')}
					</option>
					{
						_.map(users, ({name, id}) => (
							<option key={'user-field-opt-' + id} value={id}>
								{name}
							</option>
						))
					}
				</select>
				<div ref="formAlertErrorResponsible" className="formAlertError"></div>
			</div>
		);
	},
	
	exportCSV(evt) {
		evt.preventDefault();

		const {
			simpleFilter, 
			levelInstanceId,
		} = this.state;

		const data = {
			levelInstanceId,
			description: simpleFilter,
			...this.getAdvancedFilters(),
		}

		window.location.href = "forpdi/api/field/actionplan/exportCSV?" + new URLSearchParams(data).toString();
	},

	onChangeFilters(newFilters) {
		const { filters } = this.state;
		this.setState({
			filters: {
				...filters,
				...newFilters,
			}
		}, () => this.renderAdvancedSearchModal());
	},
	
	getYearsToSelect(startYear, endYear) {
		const years = [];
		for (let year = startYear; year <= endYear; year++) {
			years.push(year);
		}
		return _.map(years, (year) => ({ id: year, name: year }));
	},
	
	renderAdvancedSearchModal() {
		const { dataFimPlan, dataIniPlan } = this.props;

		const modal = (
		<AdvancedSearchModal
			onSubmit={this.onAdvancedSearch}
			rowsStructure={[["status", "year"], ["description"]]}
			fields={[
				{
					label: Messages.get('label.status'),
					initialValue: -1,
					name: "status",
					options: statusList,
					fieldRenderer: AdvancedSearchModal.fieldRenderer.selectBox,
				},
				{
					label: Messages.get('label.description'),
					name: "description",
					initialValue: "",
					fieldRenderer: AdvancedSearchModal.fieldRenderer.textField,	
				},
				{
					label: Messages.get('label.ano'),
					initialValue: -1,
					name: "year",
					options: this.getYearsToSelect(dataIniPlan, dataFimPlan,),
					fieldRenderer: AdvancedSearchModal.fieldRenderer.selectBox,
				},
			]}
		/>
		)
		NewModal.show(modal, "fpdi");
	},
	
	clearSearch() {
		this.setState({
			simpleFilter: '',
			advancedFilters: null,
			page: 1
		}, () => this.getActionPlans());
	},
	
	onSearchKeyPress(event) {
		const { key } = event;
		if (key === 'Enter') {
			this.onClickSearch();
		}
	},
	
	onClickSearch() {
		this.setState({
			advancedFilters: null,
			page: 1
		}, () => this.getActionPlans());
	},
	
	onAdvancedSearch(filters) {
		this.setState({
			advancedFilters: filters,
			simpleFilter: '',
			page: 1,
		}, () => this.getActionPlans());
	},
	
	getActionPlans() {
		const {
			simpleFilter, 
			levelInstanceId,
			page,
			pageSize,
			sortedBy,
		} = this.state;

		const [field , asc] = sortedBy;
		
		this.setState({ loading: true });
		ActionPlanStore.dispatch({
			action: ActionPlanStore.ACTION_RETRIVE_ACTION_PLAN_ATTRIBUTE,
			data: {
				id: levelInstanceId,
				page: page,
				pageSize: pageSize,
				description: simpleFilter,
				sortedBy: [field, asc ? 'asc' : 'desc'],
				...this.getAdvancedFilters(),
			}
		});
	},

	getAdvancedFilters() {
		const { advancedFilters } = this.state;
		if (!advancedFilters) {
			return {};
		}

		return {
			description: advancedFilters.description,
			year: advancedFilters.year,
			...this.parseStatusValueToActionFlags(advancedFilters.status),
		}
	},
	
	onChangeFilter(event) {
		const { target } = event;
		this.setState({ simpleFilter: target.value })
	},

	getDate(elem) {
		const { date } = splitDateTime(elem);
		return parseDate(date);
	},

	sort(direction, fieldName, getField) {
		let fieldNameAdaptaded = fieldName == 'responsible' ? 'user.name' : fieldName;

		const [field, asc] = this.state.sortedBy;
		
		this.setState({
			sortFieldName: fieldName,
			sortDirection: direction,
			sortedBy:[fieldNameAdaptaded, field !== fieldNameAdaptaded || !asc]
		},() => this.getActionPlans());
	},

	render(){
		const { simpleFilter, page, pageSize, totalPlans } = this.state;
		return(
			<div className="panel panel-default panel-margins">
				<div className="panel-heading displayFlex">
					<b className="budget-graphic-title">{Messages.getEditable("label.planAction","fpdi-nav-label")} </b>
					{(this.state.adding)?
						"":
					<div className="budget-btns" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
						<div className="inner-addon right-addon right-addonPesquisa plan-search-border" style={{"marginLeft": "15px"}}>
							<i className="mdiClose mdi mdi-close pointer" onClick={this.clearSearch} title={Messages.get("label.clean")}> </i>
							<input style={{ paddingRight: "85px", width: "220px" }} value={simpleFilter} onChange={this.onChangeFilter} type="text" className="form-control-busca" placeholder={Messages.get('label.searchDescription')} ref="name" onKeyPress={this.onSearchKeyPress}/>
							<i style={{"right": "30px"}} className="mdiBsc mdi mdi-chevron-down pointer" onClick={this.renderAdvancedSearchModal} title={Messages.get("label.advancedSearch")}> </i>
							<i id="searchIcon" className="mdiIconPesquisa mdiBsc  mdi mdi-magnify pointer" onClick={this.onClickSearch} title={Messages.get("label.search")}></i>
						</div>
						{totalPlans > 0 &&
							<button className="btn btn-primary budget-new-btn" onClick={this.exportCSV}>
								{Messages.getEditable("label.exportCSV", "fpdi-nav-label")}
							</button>
						}
						{
							this.hasEditPermission() && (
								<button type="button" className="btn btn-primary budget-new-btn" onClick={this.newActionPlan}>{Messages.getEditable("label.new","fpdi-nav-label")}</button>
							)
						}
						<span className={(this.state.hide)?("mdi mdi-chevron-right marginLeft15"):("mdi mdi-chevron-down marginLeft15")} onClick={this.hideFields}></span>
					</div>}

				</div>
				{!this.state.hide ?
					(<div className="table-responsive">
						{this.state.loading ? <LoadingGauge /> :
						<div>
							<table className="budget-field-table table">
								<thead>
									<tr>
										<th className="textAlignRight" style={{ marginRight: '10px', width: '180px'}}>{Messages.getEditable("label.status","fpdi-nav-label")}</th>
										<th style={{ width: '400px' }}>{Messages.getEditable("label.description","fpdi-nav-label")}
											<span className={this.state.sortFieldName == "description" ?
												(this.state.sortDirection == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort-descending cursorPointer" ) : "mdi mdi-sort cursorPointer"}
												onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "description" ? "desc" : "asc", "description", (elem) => elem["description"].toUpperCase())}
												title="Ordenar">
											</span>
										</th>
										<th>{Messages.getEditable("label.responsible","fpdi-nav-label")}
											<span className={this.state.sortFieldName == "responsible" ?
												(this.state.sortDirection == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort-descending cursorPointer" ) : "mdi mdi-sort cursorPointer"}
												onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "responsible" ? "desc" : "asc", "responsible", (elem) => this.getResponsibleName(elem).toUpperCase())}
												title="Ordenar">
											</span>
										</th>
										<th>{Messages.getEditable("label.begin","fpdi-nav-label")}
											<span className={this.state.sortFieldName == "begin" ?
												(this.state.sortDirection == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort-descending cursorPointer" ) : "mdi mdi-sort cursorPointer"}
												onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "begin" ? "desc" : "asc", "begin", (elem) => this.getDate(elem["begin"]))}
												title="Ordenar">
											</span>
										</th>
										<th>{Messages.getEditable("label.term","fpdi-nav-label")}
											<span className={this.state.sortFieldName == "end" ?
												(this.state.sortDirection == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort-descending cursorPointer" ) : "mdi mdi-sort cursorPointer"}
												onClick={this.sort.bind(this, this.state.sortDirection === "asc" && this.state.sortFieldName === "end" ? "desc" : "asc", "end", (elem) => this.getDate(elem["end"]))}
												title="Ordenar">
											</span>
										</th>
									</tr>
								</thead>
									<tbody>
										{this.state.adding ? this.renderNewActionPlan() : undefined}
										{this.state.actionPlans.map((model, idx) => {
											return this.renderActionField((model.id == this.state.editingActionID),model,idx);
										})}
									</tbody>
							</table>
						</div>}

						<TablePagination
							page={page}
							pageSize={pageSize}
							total={totalPlans}
							onChangePage={this.pageChange}
							tableName={"actionPlan-table-"+this.props.levelInstanceId}
						/>
					</div>) : undefined
				}
			</div>
		);
	}
});
