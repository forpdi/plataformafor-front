import S from 'string';
import React from "react";
import { Link } from 'react-router';

import Messages from "forpdi/src/Messages.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import BudgetStore from "forpdi/src/forpdi/planning/store/Budget.jsx";
import SubActionSelectBox from "forpdi/src/forpdi/planning/view/field/SubActionSelectBox.jsx";
import PermissionsTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import _ from 'underscore';
import Validation from 'forpdi/src/forpdi/core/util/Validation.jsx';
import TablePagination from "forpdi/src/forpdi/core/widget/TablePagination.jsx"
import ForriscoModal from 'forpdi/src/components/modals/Modal';
import DashboardItemsModal from 'forpdi/src/components/modals/DashboardItemsModal';

var Validate = Validation.validate;

export default React.createClass({
	contextTypes: {
		toastr: React.PropTypes.object.isRequired,
		accessLevel: React.PropTypes.number.isRequired,
		accessLevels: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
		roles: React.PropTypes.object.isRequired,
		theme: React.PropTypes.string.isRequired,
		router: React.PropTypes.object.isRequired,
	},
	getInitialState() {
		return {
			loading: false,
			hide: false,
			budgetElements: [],
			linkedObjectives: {},
			editingId: -1,
			sortIconStatusAction: "asc",
			sortIconStatusLoa: "",
			sortIconStatusBalance: "",
			sortIconStatusObjects: "",
			totalElements: 0,
			page: 1,
			pageSize: 5,
			searchTerm:"",
			sortedBy:[]
		};
	},

	newBudget(evt) {
		this.setState({
			adding: true,
			hide: false
		});
	},

	onKeyUp(evt) {
		var key = evt.which;
		if (key == 13) {
			evt.preventDefault();
			return;
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
		this.refs.searchTerm.value = "";
		const {
      page,
      pageSize,
      searchTerm,
    } = this.state;

		this.getElements(page,pageSize,searchTerm,["subAction", true]);

		this.setState({
			page: this.refs.pagination.state.page,
			pageSize: this.refs.pagination.state.pageSize,
		});

		BudgetStore.on("budgetElementSavedSuccess", model => {
			this.setState({
				adding: false,
				loading: false,
			});
			this.context.toastr.addAlertSuccess("Elemento orçamentário adicionado com sucesso");
			this.getElements(this.state.page, this.state.pageSize,this.state.searchTerm,this.state.sortedBy);
		}, this);
		BudgetStore.on("budgetElementSavedError", (error) => {
			this.setState({
				loading: false,
			});
			this.context.toastr.addAlertError(error.responseJSON.message);
		}, this);

		BudgetStore.on("budgetElementRetrivied", (model) => {
			this.setState({
				budgetElements: model.data,
				totalElements: model.total,
			});
			this.refs.searchTerm.value = this.state.searchTerm
		}, this);

		BudgetStore.on("budgetElementUpdated", model => {
			this.setState({
				loading: false,
				editingId: -1
			});
			if (model.data) {
				/*if (this.state.idx != undefined) {
					this.state.budgetElements[this.state.idx].subAction = model.data.subAction;
					this.state.budgetElements[this.state.idx].balanceAvailable=model.data.balanceAvailable;
					this.state.budgetElements[this.state.idx].budgetLoa = model.data.budgetLoa;
				}*/
				this.context.toastr.addAlertSuccess(Messages.get("label.success.budgetEdited"));
				//this.rejectEditbudget(this.state.idx);
				this.getElements(this.state.page, this.state.pageSize,this.state.searchTerm,this.state.sortedBy);
			} else {
				var errorMsg = JSON.parse(model.responseText)
				this.context.toastr.addAlertError(errorMsg.message);
			}
		}, this);

		BudgetStore.on("budgetElementDeleted", model => {
			if (model.success) {
				//this.state.budgetElements.splice(this.state.idx,1);
				//this.context.toastr.addAlertSuccess(Messages.get("label.deleted.budgetElement"));

				if (this.state.budgetElements.length == 1 && this.state.page > 1) {
					this.getElements(this.state.page - 1, this.state.pageSize,this.state.searchTerm,this.state.sortedBy);
					this.setState({
						page: this.state.page - 1,
						loading: false
					});
				} else {
					this.setState({
						loading: false
					});
					this.getElements(this.state.page, this.state.pageSize,this.state.searchTerm,this.state.sortedBy);
				}
			} else {
				var errorMsg = JSON.parse(model.responseText)
				this.context.toastr.addAlertError(errorMsg.message);
				this.setState({
					loading: false
				});
			}
		}, this);
		
		BudgetStore.on('linkedObjectivesRetrieved', ({ data }) => {
			const { linkedObjectives } = this.state;
			const newLinkedObjectives = { ...linkedObjectives };
			
			let objectives = [];
			
			if (data.length > 0) {
				objectives = _.map(data, ({
					name,
					exportStructureLevelInstanceId,
					exportPlanId,
					budgetElement,
				}) => ({
					name,
					planId: exportPlanId,
					levelInstanceId: exportStructureLevelInstanceId,
					budgetElementId: budgetElement.id,
				}));
				
				const firstObjective = objectives[0];
				const { budgetElementId } = firstObjective;
				newLinkedObjectives[budgetElementId] = objectives;
				this.setState({ linkedObjectives: { ...newLinkedObjectives } });
			}

			this.renderLinkedObjectivesModal(objectives);
		}, this);
	},

	componentWillUnmount() {
		BudgetStore.off(null, null, this);
	},

	cancelNewBudget() {
		this.setState({
			adding: false
		});
	},

	formatEUA(num) {
		const USDollar = new Intl.NumberFormat('en-US', {
			minimumFractionDigits: 2,
		});
	
		const n = num.toFixed(2).toString();
		return USDollar.format(n);
	},

	formatBR(str) {
		var x = str.split('.')[0];
		x = this.replaceAll(x, ",", ".");
		var decimal = str.split('.')[1];
		if (decimal == undefined) {
			decimal = '00';
		}
		return x + "," + decimal;
	},

	converteMoedaFloat(valor) {
		var valorFormated = valor.toString();
		valorFormated = valorFormated.replace(".", ",");
		return valorFormated;
	},

	acceptNewBudget() {
		// Remove os pontos e vírgulas do valor do campo
		const budgetLoaValue = Number(this.refs.budgetLoa.value.replace(/[^\d,]/g, "").replace(",", ".")).toFixed(2).replace(".", ",");
	
		// Validação dos campos
		var validation = Validate.validationNewBudgetElementField(this.refs);
		if (validation.boolMsg) {
			//Toastr.remove();
			//Toastr.error(msg);
			this.context.toastr.addAlertError(validation.msg);
			return;
		}
		this.setState({
			loading: true,
		});

		BudgetStore.dispatch({
			action: BudgetStore.ACTION_CREATE_BUDGET_ELEMENT,
			data: {
				subAction: this.refs.subAction.value,
				budgetLoa: budgetLoaValue,
				companyId: EnvInfo.company.id
			}
		});
	},

	formatReal(int) {
		int = int * 100;
		var tmp = int + '';
		var neg = false;
		if (tmp.indexOf("-") == 0) {
			neg = true;
			tmp = tmp.replace("-", "");
		}

		if (tmp.length == 1) {
			tmp = "0" + tmp;
		}

		tmp = tmp.replace(/([0-9]{2})$/g, ",$1");

		if (tmp.length > 12)
			tmp = tmp.replace(/([0-9]{3}).([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, ".$1.$2.$3,$4");
		else if (tmp.length > 9)
			tmp = tmp.replace(/([0-9]{3}).([0-9]{3}),([0-9]{2}$)/g, ".$1.$2,$3");
		else if (tmp.length > 6)
			tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

		if (tmp.indexOf(".") == 0)
			tmp = tmp.replace(".", "");
		if (tmp.indexOf(",") == 0)
			tmp = tmp.replace(",", "0,");

		return (neg ? '-' + tmp : tmp);
	},
	
	getLinkedObjectives(budgetElement) {
		const { linkedObjectives } = this.state;
		const budgetElementId = budgetElement.id
		const budgetElementLinkedObjectives = linkedObjectives[budgetElementId]
		
		if (budgetElementLinkedObjectives) {
			this.renderLinkedObjectivesModal(budgetElementLinkedObjectives);
		} else {
			BudgetStore.dispatch({
				action: BudgetStore.ACTION_LIST_LINKED_OBJECTIVES,
				data: { budgetElementId: budgetElement.id },
			});	
		}
	},
	
	renderLinkedObjectivesModal(linkedObjectives) {
		const { router } = this.context;
		const modal = (
			<DashboardItemsModal
				heading={Messages.get('label.linkedObjects')}
				items={linkedObjectives}
				getItemText={({ name }) => name}
			  	onClick={({ planId, levelInstanceId }) => {
					router.push(`/plan/${planId}/details/subplan/level/${levelInstanceId}`)
				}}
			/>
		);
		  
		ForriscoModal.show(modal, this.context.theme);
	},

	deleteBudget(id, idx, evt) {
		var msg = "Você tem certeza que deseja excluir " + this.state.budgetElements[idx].subAction + "?";

		Modal.confirmCancelCustom(() => {
			Modal.hide();
			this.setState({
				loading: true,
				idx: idx //index a ser deletado
			});
			//this.forceUpdate();

			BudgetStore.dispatch({
				action: BudgetStore.ACTION_DELETE_BUDGET_ELEMENT,
				data: {
					id: id
				}
			});

		}, msg, () => { Modal.hide() });
	},

	acceptedEditbudget(id, idx) {
		var validation = Validate.validationEditBudgetElementField(this.refs, idx);

		if (validation.boolMsg) {
			//Toastr.remove();
			//Toastr.error(msg);
			this.context.toastr.addAlertError(validation.msg);
			return;
		}
		this.setState({
			loading: true,
			idx: idx //index a ser editado
		});

		//this.forceUpdate();

		BudgetStore.dispatch({
			action: BudgetStore.ACTION_GET_UPDATE_BUDGET_ELEMENT,
			data: {
				idBudgetElement: id,
				subAction: this.refs['nameBudgetElement' + idx].value,
				budgetLoa: this.refs['budgetLoaEdit' + idx].value
			}
		});
	},

	exportCSV(evt) {
		evt.preventDefault();
		window.location.href = "forpdi/budget/exportCSV"
	},

	rejectEditbudget(idx) {
		this.setState({
			editingId: -1
		});
		/*this.forceUpdate();*/
	},

	editBudget(id, idx, evt) {
		//var array = this.state.editingIdx;
		//array.push(idx);
		this.setState({
			editingId: id
		});
		//this.forceUpdate();
	},

	formatValueOnInput(evt) {
		const { value: inputValue } = evt.target;
		const numericValue = inputValue.replace(/\D/g, '').slice(0, 14) / 100;
		const formattedValue = numericValue.toLocaleString('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).replace('R$', '').trim();
		evt.target.value = formattedValue;
	},

	renderEditLine(model, idx) {
		return (
			<tr key={'new-budgetElement-' + idx}>
				<td><input type='text' maxLength='255' className='budget-field-table' ref={'nameBudgetElement' + idx}
					onKeyPress={this.onKeyUp} defaultValue={model.subAction} />
					<div className="formAlertError" ref="formAlertErrorSubActionEdit"></div>
				</td>
				<td>
					<span className='budget-field-table-prefix'>$</span>
					<input
						type='text'
						maxLength='255'
						className='budget-field-table'
						ref={'budgetLoaEdit' + idx}
						defaultValue={this.converteMoedaFloat(model.budgetLoa)}
						onKeyPress={this.onlyNumber}
						onPaste={this.onlyNumberPaste}
						onInput={this.formatValueOnInput}
						style={{ paddingLeft: '10px' }}
					/>
					<div className="formAlertError" ref="formAlertErrorBudgetLoaEdit"></div>
				</td>
				<td> - </td>
				<td> - </td>
				<td> </td>
				<td>
					<div className='displayFlex'>
						<span className='mdi mdi-check accepted-budget' onClick={this.acceptedEditbudget.bind(this, model.id, idx)} title={Messages.get("label.submitLabel")}></span>
						<span className='mdi mdi-close reject-budget' onClick={this.rejectEditbudget.bind(this, idx)} title={Messages.get("label.cancel")}></span>
					</div>
				</td>
			</tr>
		);
	},

	renderNewBudget() {
		return (
			<tr key='new-budget'>
				<td ref="tdSubAction"><input type='text' maxLength='255' className='budget-field-table' ref="subAction" onKeyPress={this.onKeyUp} />
					<div className="formAlertError" ref="formAlertErrorSubAction"></div>
				</td>
				<td ref="tdName">
						<span className='budget-field-table-prefix'>$</span>
						<input
						type='text'
						maxLength='255'
						className='budget-field-table'
						ref="budgetLoa"
						onKeyPress={this.onlyNumber}
						onPaste={this.onlyNumberPaste}
						onInput={this.formatValueOnInput}
						style={{ paddingLeft: '10px' }} 
					/>
					<div className="formAlertError" ref="formAlertErrorBudgetLoa"></div>
				</td>
				<td> - </td>
				<td> - </td>
				<td></td>
				<td>
					<div className='displayFlex'>
						<span className='mdi mdi-check accepted-budget' onClick={this.acceptNewBudget} title={Messages.get("label.submitLabel")}></span>
						<span className='mdi mdi-close reject-budget' onClick={this.cancelNewBudget} title={Messages.get("label.cancel")}></span>
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

	replaceAll(str, needle, replacement) {
		var i = 0;
		while ((i = str.indexOf(needle, i)) != -1) {
			str = str.replace(needle, replacement);
		}
		return str;
	},

	sortColumnBy(sorting,newField) {
    const {
			page,
      pageSize,
      searchTerm,
      sortedBy,
    } = this.state;
    const [field, asc] = sortedBy;

    this.getElements(page, pageSize, searchTerm, [newField, field !== newField || !asc]);
		
		this.setState({
			sortIconStatusAction: newField === "subAction" ? sorting : "",
			sortIconStatusLoa: newField === "budgetLoa" ? sorting : "",
			sortIconStatusBalance: newField === "balanceAvailable" ? sorting : "",
			sortIconStatusObjects: newField === "linkedObjects" ? sorting : "",
		})
  },

	pageChange(page, pageSize) {
		const { searchTerm , sortedBy } = this.state;
		this.getElements(page, pageSize, searchTerm ,sortedBy);
		this.setState({
			page: page,
			pageSize: pageSize,
		});
	},

	getElements(page, pageSize, searchTerm, sortedBy) {
		const [field, asc] = sortedBy;
		this.setState({
      page,
      pageSize,
			sortedBy,
    });

		BudgetStore.dispatch({
			action: BudgetStore.ACTION_GET_BUDGET_ELEMENT,
			data: {
				companyId: EnvInfo.company.id,
				page: page,
				pageSize: pageSize,
				term: searchTerm,
				sortedBy: [field, asc ? 'asc' : 'desc']
			}
		});
	},

	clear() {
		this.refs.searchTerm.value = "";
		this.resultSearch();
	},

	resultSearch() {
		this.setState({
      searchTerm:this.refs.searchTerm.value
    });

		this.getElements(1, this.state.pageSize, this.refs.searchTerm.value,this.state.sortedBy);
	},

	onKeyDown(evt){
		if (evt.key == 'Enter') {
			evt.preventDefault();
			this.resultSearch();
		}
	},

	render() {
		if (this.state.loading) {
			return <LoadingGauge />;
		}
		return (
			<div className="fpdi-profile-user fpdi-budget-element">
				<div className="fpdi-tabs-content animated fadeIn paddingLeft0" style={{ display: 'flex', justifyContent: 'space-between'}}>
					<h1>{Messages.getEditable("label.budgetElement", "fpdi-nav-label")}</h1>
					{
						this.state.budgetElements.length > 0 &&
							<button className="btn btn-primary" style={{ padding: '7px 10px', marginTop: '14px', height: 'fit-content' }} onClick={this.exportCSV}>
								{Messages.getEditable("label.exportCSV", "fpdi-nav-label")}
							</button>
					}
				</div>
				<div className="panel panel-default">
					<div className="panel-heading displayFlex">
						<b className="budget-title"> {Messages.getEditable("label.budgetElement", "fpdi-nav-label")}</b>
						<div className="fpdi-tabs-content fpdi-budget-element-search marginRight10 plan-search-border">
							<div className="inner-addon right-addon right-addonPesquisa">
								<i className="mdiClose mdi mdi-close pointer" style={{right: '30px'}} onClick={this.clear} title={Messages.get("label.clean")}> </i>
									<input type="text" className="form-control-busca" style={{width: '90%'}} ref="searchTerm" onKeyDown={this.onKeyDown} />
									<i id="searchIcon" className="mdiIconPesquisa mdiBsc  mdi mdi-magnify pointer" onClick={this.resultSearch} title={Messages.get("label.search")}> </i>
							</div>
						</div>
						{(this.state.adding)
							? "" : (
								<div className="budget-btns">
									{(this.context.roles.MANAGER || _.contains(this.context.permissions, PermissionsTypes.MANAGE_PLAN_PERMISSION))
										? <button type="button" className="btn btn-primary budget-new-btn" onClick={this.newBudget}>{Messages.getEditable("label.new", "fpdi-nav-label")}</button>
										: ""
									}
									<span className={(this.state.hide) ? ("mdi mdi-chevron-right marginLeft15") : ("mdi mdi-chevron-down marginLeft15")} onClick={this.hideFields} />
								</div>
							)
						}
					</div>
					{!this.state.hide ? (
						<div>
							<table className="budget-field-table table">
								<thead>
									<tr>
										<th className="textAlignCenter">{Messages.getEditable("label.budgetAction", "fpdi-nav-label")}<span className="fpdi-required" />
											<span className={this.state.sortIconStatusAction == "desc" ? "mdi mdi-sort-descending cursorPointer" :
												(this.state.sortIconStatusAction == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort cursorPointer")}
												onClick={(this.state.sortIconStatusAction == "" || this.state.sortIconStatusAction == "desc") ? this.sortColumnBy.bind(this, "asc", "subAction") : this.sortColumnBy.bind(this, "desc", "subAction")} title="Ordenar">
											</span>
										</th>
										<th className="textAlignCenter">{Messages.getEditable("label.budgetLoa", "fpdi-nav-label")} <span className="fpdi-required" />
										<span className={this.state.sortIconStatusLoa == "desc" ? "mdi mdi-sort-descending cursorPointer" :
												(this.state.sortIconStatusLoa == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort cursorPointer")}
												onClick={(this.state.sortIconStatusLoa == "" || this.state.sortIconStatusLoa == "desc") ? this.sortColumnBy.bind(this, "asc", "budgetLoa") : this.sortColumnBy.bind(this, "desc", "budgetLoa")} title="Ordenar">
											</span>
										</th>
										<th className="textAlignCenter">{Messages.getEditable("label.balanceAvailable", "fpdi-nav-label")}
										<span className={this.state.sortIconStatusBalance == "desc" ? "mdi mdi-sort-descending cursorPointer" :
												(this.state.sortIconStatusBalance == "asc" ?  "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort cursorPointer")}
												onClick={(this.state.sortIconStatusBalance == "" || this.state.sortIconStatusBalance == "desc") ? this.sortColumnBy.bind(this, "asc", "balanceAvailable") : this.sortColumnBy.bind(this, "desc", "balanceAvailable")} title="Ordenar">
											</span>
										</th>
										<th className="textAlignCenter">{Messages.getEditable("label.linkedObjects", "fpdi-nav-label")}
										<span className={this.state.sortIconStatusObjects == "desc" ? "mdi mdi-sort-descending cursorPointer" :
												(this.state.sortIconStatusObjects == "asc" ? "mdi mdi-sort-ascending cursorPointer" : "mdi mdi-sort cursorPointer")}
												onClick={(this.state.sortIconStatusObjects == "" || this.state.sortIconStatusObjects == "desc") ? this.sortColumnBy.bind(this, "asc", "linkedObjects") : this.sortColumnBy.bind(this, "desc", "linkedObjects")} title="Ordenar">
											</span>
										</th>
										<th> </th>
									</tr>
								</thead>
								<tbody>
									{this.state.adding ? this.renderNewBudget() : undefined}
									{this.state.budgetElements.map((model, idx) => {
										if (this.state.editingId == model.id) {
											return (this.renderEditLine(model, idx));
										}
										return (
											<tr key={"budget-element" + idx}>
												<td id={'subAction' + idx} className="textAlignCenter">{model.subAction.toUpperCase()}</td>
												<td id={'budgetLoa' + idx} className="textAlignCenter">{"R$" + this.formatBR(this.formatEUA(model.budgetLoa))} </td>
												<td className="textAlignCenter"> {"R$" + this.formatBR(this.formatEUA(model.balanceAvailable))}</td>
												<td id={'linkedObject' + idx} className="textAlignCenter linked-objectives-col">
												<span 
													className="mdi mdi-eye cursorPointer"
													onClick={() => {this.getLinkedObjectives(model)}}
													title={Messages.get("label.view")}
												/>
												</td>
												<td></td>
												{(this.context.roles.MANAGER || _.contains(this.context.permissions,
													PermissionsTypes.MANAGE_PLAN_PERMISSION)) ?
													<td id={'options' + idx} className="edit-budget-col cn cursorDefault">
														<span className="mdi mdi-pencil cursorPointer marginRight10 inner" onClick={this.editBudget.bind(this, model.id, idx)} title={Messages.get("label.title.editInformation")} />
														<span className="mdi mdi-delete cursorPointer inner" onClick={this.deleteBudget.bind(this, model.id, idx)} title={Messages.get("label.delete")} />
													</td>
													: <td></td>}
											</tr>
										);
									})}
								</tbody>
								<tbody />
							</table>
							<TablePagination ref="pagination"
								total={this.state.totalElements}
								onChangePage={this.pageChange}
								tableName={"budget-table"}
								initialPage={this.state.page}
								initialSize={this.state.pageSize}
							/>
						</div>
					) : ("")}
				</div>
			</div>);
	}
});
