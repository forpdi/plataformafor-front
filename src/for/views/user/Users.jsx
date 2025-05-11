import S from "string";
import React from "react";
import { Link } from "react-router";
import _ from "underscore";

import AccessLevels from "forpdi/src/forpdi/core/store/AccessLevels.json";
import UserStore from "forpdi/src/forpdi/core/store/User.jsx";
import UserSession from "forpdi/src/forpdi/core/store/UserSession.jsx";
import LoadingGauge from 'forpdi/src/components/LoadingGauge.jsx';
import Modal from "forpdi/src/forpdi/core/widget/Modal.jsx";
import Pagination from 'forpdi/src/components/Pagination';
import Messages from "forpdi/src/Messages.jsx";
import Validation from "forpdi/src/forpdi/core/util/Validation.jsx";
import permissionTypes from "forpdi/src/forpdi/planning/enum/PermissionsTypes.json";
import VerticalInput from "forpdi/src/forpdi/core/widget/form/VerticalInput.jsx";
import AppContainer from 'forpdi/src/components/AppContainer';
import SearchBox from 'forpdi/src/components/inputs/SearchBox';
import InfoButton from 'forpdi/src/components/buttons/InfoButton';

import { censorCPF, censorEmail, censorName } from "forpdi/src/utils/util.js";

var Validate = Validation.validate;
var countNumberConvite = 0;

export default React.createClass({
	contextTypes: {
		accessLevel: React.PropTypes.number.isRequired,
		roles: React.PropTypes.object.isRequired,
		router: React.PropTypes.object,
		toastr: React.PropTypes.object.isRequired,
		permissions: React.PropTypes.array.isRequired,
		hasManageUsersPermission: React.PropTypes.bool.isRequired,
		hasViewUsersPermission: React.PropTypes.bool.isRequired,
	},
	getInitialState() {
		return {
			loading: true,
			loadingSend: false,
			loadingCreate: false,
			error: null,
			hideUser: false,
			hideNewUser: true,
			hideCreateUser: true,
			accessLevelSelect: null,
			models: null,
			totalUsers: null,
			usersToImport: [],
			countSelectedUsers: 0,
			importFileName: "",
			searchTerm: '',
			sortedBy: [],
			page: 1,
      pageSize: 5,
		};
	},

	componentDidMount() {
    if (!EnvInfo.company) {
      return;
    }
		var me = this;
		/* Comentado pois interferia no acesso ao perfil do próprio usuário por outros níveis de conta,
		 * remover o código caso não for essencial para outras funcionalidades

		if (!me.context.roles.ADMIN) {
			me.context.router.replace("/home");
			return;

		}

		}*/

		//UserStore.on('find', store => {
		//	me.setState({
		//		loading: false,
		//		models: store.models
		//	});

		//}, me);

		me.getUsers(this.state.page, this.state.pageSize, null, this.state.sortedBy);

		UserStore.on(
			"retrieve-user",
			(model) => {
				me.setState({
					loading: false,
					models: model.data,
					totalUsers: model.total,
				});
			},
			me
		);

		UserStore.on(
			"remove",
			(data) => {
				if (data.data) {
					this.context.toastr.addAlertSuccess(
						Messages.get("label.success.removerUser")
					);
					me.setState({
						models: [],
						totalUsers: 0,
					});
					me.getUsers(
						this.state.page,
						this.state.pageSize,
						null,
						[],
					);
					//me.refs["pagination"].reload();
				}
				//Toastr.remove();
				//Toastr.success("Usuário removido com sucesso.");
			},
			me
		);

		UserStore.on(
			"block",
			() => {
				//Toastr.remove();
				//Toastr.success("Usuário bloqueado com sucesso.");
				this.context.toastr.addAlertSuccess(
					Messages.get("label.success.userBlock")
				);
				me.setState({
					models: [],
					totalUsers: 0,
				});
				me.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
				//me.refs["pagination"].reload();
			},
			me
		);

		UserStore.on(
			"unblock",
			() => {
				//Toastr.remove();
				//Toastr.success("Usuário desbloqueado com sucesso.");
				this.context.toastr.addAlertSuccess(
					Messages.get("label.success.userUnblock")
				);
				me.setState({
					models: [],
					totalUsers: 0,
				});
				me.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
				//me.refs["pagination"].reload();
			},
			me
		);

		UserStore.on(
			"resend-invitation",
			() => {
				//Toastr.remove();
				//Toastr.success("Convite reenviado com sucesso.");
				me.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
				//this.context.toastr.addAlertSuccess(Messages.get("label.success.invitionUserAgain"));
			},
			me
		);

		UserStore.on(
			"invite-user",
			({ data }) => {
				//Toastr.remove();
				this.setState({
					loadingSend: false,
				});

				this.context.toastr.addAlertSuccess(
					Messages.get("label.success.emailSent") +
						" " +
						data.email +
						Messages.get("label.success.userCompleteRegister")
				);

				this.refs.nameUser.value = "";
				this.refs.emailUser.value = "";
				this.refs.selectAccessLevels.value = -1;
				me.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
			},
			me
		);

		UserStore.on(
			"invite-user-error",
			(errorMsg) => {
				this.setState({
					loadingSend: false,
				});
				this.context.toastr.addAlertError(errorMsg);
			},
			me
		);

		UserStore.on(
			"user-registred",
			(model) => {
				this.setState({
					loadingCreate: false,
				});
				this.context.toastr.addAlertSuccess(
					Messages.get("label.success.registredUser") +
						model.data.email
				);

				this.refs.newNameUser.value = "";
				this.refs.newEmailUser.value = "";
				this.refs.newPasswordUser.value = "";
				this.refs.newSelectAccessLevels.value = -1;
				this.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
			},
			me
		);

		UserStore.on(
			"fail",
			(msg) => {
				this.context.toastr.addAlertError(msg);
				this.setState({
					loadingCreate: false,
					loadingSend: false,
				});
				this.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
			},
			me
		);

		UserStore.on(
			"users-imported",
			(data) => {
				this.context.toastr.addAlertSuccess(
					Messages.get("label.success.importedUser")
				);
				me.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
				//me.refs["pagination"].reload();
			},
			me
		);

		UserStore.on(
			"editUserAccessLevel",
			(store) => {
				if (store.data) {
					this.context.toastr.addAlertSuccess(
						Messages.get("label.success.dataEdited")
					);
					me.getUsers(
						this.state.page,
						this.state.pageSize,
						null,
						[],
					);
				} else {
					var errorMsg = JSON.parse(store.responseText);
					this.context.toastr.addAlertError(errorMsg.message);
				}
			},
			me
		);
	},

	componentWillUnmount() {
		UserStore.off(null, null, this);
	},

	closeAlert() {
		this.setState({
			error: null,
		});
	},

	cancelBlockUnblock() {
		Modal.hide();
	},

	removeUser(id, event) {
		event && event.preventDefault();
		var msg = Messages.get("label.msg.removeUser");
		Modal.confirmCancelCustom(
			() => {
				Modal.hide();
				UserStore.dispatch({
					action: UserStore.ACTION_REMOVE,
					data: id,
				});
			},
			msg,
			this.cancelBlockUnblock
		);
	},

	blockUser(id, nome, event) {
		event && event.preventDefault();
		var msg =
			Messages.get("label.msg.user") +
			" " +
			nome +
			" " +
			Messages.get("label.msg.blockUser");

		Modal.confirmCancelCustom(
			() => {
				Modal.hide();
				UserStore.dispatch({
					action: UserStore.ACTION_BLOCK,
					data: id,
				});
			},
			msg,
			this.cancelBlockUnblock
		);
	},

	unblockUser(id, nome, event) {
		event && event.preventDefault();
		var msg =
			Messages.get("label.msg.user") +
			" " +
			nome +
			" " +
			Messages.get("label.msg.unblockUser");
		Modal.confirmCustom(
			() => {
				Modal.hide();
				UserStore.dispatch({
					action: UserStore.ACTION_UNBLOCK,
					data: id,
				});
			},
			msg,
			this.cancelBlockUnblock
		);
	},

	resendInvitation(id, event) {
		event && event.preventDefault();
		UserStore.dispatch({
			action: UserStore.ACTION_RESEND_INVITATION,
			data: id,
		});
		this.context.toastr.addAlertSuccess(
			Messages.get("label.resendInviteUser")
		);
	},

	hideFieldsUser() {
		this.setState({
			hideUser: !this.state.hideUser,
		});
	},

	hideFieldsNewUser() {
		this.setState({
			hideNewUser: !this.state.hideNewUser,
		});
	},

	hideFieldsCreateUser() {
		this.setState({
			hideCreateUser: !this.state.hideCreateUser,
		});
	},

	userExists(email) {
		for (var aux in this.state.models) {
			if (this.state.models[aux].email.localeCompare(email) == 0) {
				return true;
			}
		}
		return false;
	},

	onSubmitConviteUser() {
		var me = this;
		var errorField = false;
		const maxRequestMinute = 5;

		var errorField = Validate.validationConviteUser(this.refs);

		if (errorField) {
			//Toastr.remove();
			//Toastr.error(msg);
			this.context.toastr.addAlertError(
				Messages.get("label.msg.errorsForm")
			);
			return;
		} else {
			this.setState({
				loadingSend: true,
			});

			this.setState({
				accessLevelSelect: this.refs.selectAccessLevels.value,
			});
		}

		if (
			!me.userExists(this.refs.emailUser.value.trim()) &&
			countNumberConvite < maxRequestMinute
		) {
			UserStore.dispatch({
				action: UserStore.ACTION_INVITE_USER,
				data: {
					name: this.refs.nameUser.value.trim(),
					email: this.refs.emailUser.value.trim(),
					accessLevel: parseInt(this.refs.selectAccessLevels.value),
				},
			});
			countNumberConvite++;

			setTimeout(function () {
				countNumberConvite = 0;
			}, 60000);
		} else if (countNumberConvite >= maxRequestMinute) {
			this.context.toastr.addAlertError(
				Messages.get("label.limitOfRequestsReached")
			);
			this.setState({
				loadingSend: false,
			});
		} else {
			this.context.toastr.addAlertError(
				Messages.get("label.resendEmail")
			);
			this.setState({
				loadingSend: false,
			});
		}
	},

	onSubmitCreateUser() {
		var me = this;
		var errorField = false;

		var errorField = Validate.validationCreateUser(this.refs);

		if (errorField) {
			this.context.toastr.addAlertError(
				Messages.get("label.msg.errorsForm")
			);
			return;
		} else {
			this.setState({
				loadingCreate: true,
			});

			this.setState({
				newAccessLevelSelect: this.refs.newSelectAccessLevels.value,
			});
		}

		if (!me.userExists(this.refs.newEmailUser.value.trim())) {
			UserStore.dispatch({
				action: UserStore.ACTION_REGISTER,
				data: {
					name: this.refs.newNameUser.value.trim(),
					email: this.refs.newEmailUser.value.trim(),
					password: this.refs.newPasswordUser.value.trim(),
					accessLevel: parseInt(
						this.refs.newSelectAccessLevels.value
					),
				},
			});
		} else {
			this.context.toastr.addAlertError(Messages.get("label.equalEmail"));
			this.setState({
				loadingCreate: false,
			});
		}
	},

	quickSortByUsersName(sorting) {
		const { pageSize, searchTerm } = this.state;

		this.getUsers(1, pageSize, searchTerm, ['user.name', sorting]);
	},

	onSubmitSearch(term) {
		this.setState({
			page: 1,
			term,
		}, () => this.getUsers(1, this.state.pageSize, term, []));
	},

	pageChange(page, pageSize) {
		const { sortedBy } = this.state;
		this.setState({
			page,
			pageSize,
		}, () => this.getUsers(page, pageSize, this.state.searchTerm, sortedBy));
	},

	getUsers(page, pageSize, term, sortedBy) {
		this.setState({
      sortedBy,
    });
		UserStore.dispatch({
			action: UserStore.ACTION_RETRIEVE_USER,
			data: {
				page,
				pageSize,
				term,
				sortedBy,
			},
		});
	},

	onSearchTermChange(value) {
    this.setState({
      searchTerm: value,
    });
  },

	copyInviteToken(token) {
		var url = window.location.href.split("#")[0] + "#/register/" + token;
		var textArea = document.createElement("textarea");
		textArea.value = url;
		document.body.appendChild(textArea);
		textArea.select();
		try {
			var successful = document.execCommand("copy");
			if (successful)
				this.context.toastr.addAlertSuccess(
					Messages.get(label.copiedUrl)
				);
			document.body.removeChild(textArea);
		} catch (err) {
			document.body.removeChild(textArea);
			window.prompt(Messages.get("label.copyUrl"), url);
		}
	},

	renderSameUserOptions() {
		return (
			<ul className="dropdown-menu">
				<li>
					<Link to="/users/profile">
						{Messages.getEditable(
							"label.myProfile",
							"fpdi-nav-label"
						)}
					</Link>
				</li>
			</ul>
		);
	},

	renderAnotherUser(model, cpf) {
		return (
			<ul className="dropdown-menu">
				{!model.active ? (
					<li>
						<a
							onClick={this.copyInviteToken.bind(
								this,
								model.inviteToken
							)}
						>
							{Messages.getEditable(
								"label.copyLinkRegister",
								"fpdi-nav-label"
							)}
						</a>
					</li>
				) : (
					""
				)}
				{!model.active ? (
					<li>
						<a onClick={this.resendInvitation.bind(this, model.id)}>
							{Messages.getEditable(
								"label.resendInvitation",
								"fpdi-nav-label"
							)}
						</a>
					</li>
				) : (
					""
				)}
				{model.active &&
					(this.context.roles.MANAGER ||
						_.contains(
							this.context.permissions,
							permissionTypes.MANAGE_USERS_PERMISSION
						) ||
						_.contains(
							this.context.permissions,
							permissionTypes.VIEW_USERS_PERMISSION
						) ||
						_.contains(
							this.context.permissions,
							permissionTypes.FORRISCO_MANAGE_USERS_PERMISSION
						) ||
						_.contains(
							this.context.permissions,
							permissionTypes.FORRISCO_VIEW_USERS_PERMISSION
						)) && (
						<li>
							<Link to={"/users/details/" + model.id}>
								{Messages.getEditable(
									"label.viewUser",
									"fpdi-nav-label"
								)}
							</Link>
						</li>
					)}
				{(this.context.roles.ADMIN ||
					_.contains(
						this.context.permissions,
						permissionTypes.MANAGE_USERS_PERMISSION
					) ||
					_.contains(
						this.context.permissions,
						permissionTypes.FORRISCO_MANAGE_USERS_PERMISSION
					)) && (
					<li>
						{model.blocked ? (
							<a
								onClick={this.unblockUser.bind(
									this,
									model.id,
									model.name
								)}
							>
								{Messages.getEditable(
									"label.unblockUser",
									"fpdi-nav-label"
								)}
							</a>
						) : (
							<a
								onClick={this.blockUser.bind(
									this,
									model.id,
									model.name
								)}
							>
								{Messages.getEditable(
									"label.blockUser",
									"fpdi-nav-label"
								)}
							</a>
						)}
					</li>
				)}
				{(this.context.roles.ADMIN ||
					_.contains(
						this.context.permissions,
						permissionTypes.MANAGE_USERS_PERMISSION
					) ||
					_.contains(
						this.context.permissions,
						permissionTypes.FORRISCO_MANAGE_USERS_PERMISSION
					)) && (
					<li>
						{" "}
						{this.userCanBeRemoved(model) ? (
							<a onClick={this.removeUser.bind(this, model.id)}>
								{Messages.getEditable(
									"label.removeUser",
									"fpdi-nav-label"
								)}
							</a>
						) : (
							<a className="mdi mdi-delete disabledIcon cursorPointer">
								{" "}
								{Messages.getEditable(
									"label.removeUser",
									"fpdi-nav-label"
								)}{" "}
							</a>
						)}
					</li>
				)}
			</ul>
		);
	},

	userCanBeRemoved(user) {
		const { accessLevel, active } = user;
		return (
			accessLevel < this.context.accessLevel ||
			(accessLevel == this.context.accessLevel && !active)
		);
	},

	showInfoModal: () => {
		const title = 'Permissão dos Perfis';
		const message = 'Modal de informação dos perfis';
		Modal.showInfoModal(title, message);
	},

	readCSVFile() {
		var me = this;
		Modal.readFile(
			Messages.get("label.importUsers"),
			<div>
				<p>{Messages.getEditable("label.fileCsv", "fpdi-nav-label")}</p>
			</div>,
			".csv",
			(resp) => {
				var fileInput =
					document.getElementById("file-reader-field");
				var file = fileInput.files[0];
				var reader = new FileReader();
				var importFileName = file.name;
				var ext = file.name
					.substring(file.name.lastIndexOf("."))
					.toLowerCase();
				if (ext == ".csv") {
					reader.readAsText(file);
					reader.onload = function (event) {
						var errorTag =
								document.getElementById("upload-error-span");
						errorTag.innerHTML = "";
						var fileArr = event.target.result.split("\n");
						var msg = Messages.get("label.userList");
						function User() {
							var name;
							var email;
							var validEmail;
						}
						var userList = [];
						var csvValidation = true;
						var nameValidation = true;
						for (var i = 0; i < fileArr.length; i = i + 1) {
							//fazer validação do arquivo csv de forma geral
							if (!fileArr[i].trim()) {
								continue;
							}
							var linha = fileArr[i].split(";");
							if (linha.length != 2) {
								csvValidation = false;
								break;
							}
							var user = new User();
							user.name = linha[0].replace(
								/[^a-zA-Z áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ]/g,
								""
							);
							if (!Validate.nameIsValid(user.name)) {
								csvValidation = false;
								nameValidation = false;
								break;
							};
							user.email = linha[1].replace(/"/g, "");
							user.validEmail = Validate.emailIsValid(user.email);
							userList.push(user);
						}
						if (csvValidation) {
							me.setState({
								usersToImport: userList,
								importFileName: importFileName,
							});
							Modal.importUsers(
								Messages.get("label.importUsers"),
								me.renderImportedUsers(userList),
								() => {
									me.selectedUsersToImport();
									//Modal.hide retirado para quadro não desaparecer
								}
							);
						} else {
							errorTag.innerHTML =
								`${Messages.get("label.theFile")} ${importFileName} ${Messages.get("label.noCsv")}
									Há um erro na linha ${i+1}${!nameValidation ? `: ${Messages.get("label.wordsNotCapitalized")}.` : '.'}`;
						}
					};
				} else {
					errorTag.innerHTML = Messages.get("label.fileExtCsv");
				}
				fileInput.value = "";
			}
		);
	},

	submitUserAccessLevel(accessLevel, userId) {
		var msg = Messages.get("label.msgUpdate");

		Modal.confirmCustom(
			() => { // onConfirm
				Modal.hide();
				UserStore.dispatch({
					action: UserStore.ACTION_UPDATE_USER_ACCESS_LEVEL,
					data: {
						userId,
						accessLevel,
					},
				});
			},
			msg,
			() => { // onCancel
				Modal.hide();
				this.getUsers(
					this.state.page,
					this.state.pageSize,
					null,
					[],
				);
			}
		);
	},

	selectedUsersToImport(userList, importFileName) {
		var i;
		var nameList = [];
		var emailList = [];
		var accessList = [];

		for (i = 0; i < this.state.usersToImport.length; i++) {
			if (
				document.getElementById("checkbox-" + i).checked &&
				!document.getElementById("checkbox-" + i).disabled
			) {
				var name = document.getElementById("user-name-" + i).innerHTML;
				var email = document.getElementById(
					"user-email-" + i
				).innerHTML;
				var accessLevel = document.getElementById(
					"user-accesLevel-" + i
				).value;

				nameList.push(name.trim());
				emailList.push(email.trim());
				accessList.push(accessLevel);
			}
		}

		var emptyUsersToImport = document.getElementById("emptyUsersToImport");

		if (
			nameList.length > 0 &&
			emailList.length > 0 &&
			accessList.length > 0
		) {
			Modal.hide();
			emptyUsersToImport.innerHTML = "";
			UserStore.dispatch({
				action: UserStore.ACTION_IMPORT_USERS,
				data: {
					nameList: nameList,
					emailList: emailList,
					accessList: accessList,
				},
			});
		} else {
			var emptyUsersToImport = document.getElementById("emptyUsersToImport");

			emptyUsersToImport.innerHTML = 
				`${Messages.get('label.notSelect')} 
				<strong>${Messages.get('label.noUser')}</strong> 
				${Messages.get('label.toImport')}`;
		}

		this.setState({
			countSelectedUsers: 0,
		});
	},

	selectAll() {
		var i = 0;
		var me = this;
		var countSelected = 0;

		for (i = 0; i < this.state.usersToImport.length; i++) {
			if (!document.getElementById("checkbox-" + i).disabled) {
				document.getElementById("checkbox-" + i).checked =
					document.getElementById("selectAll").checked;
				if (document.getElementById("checkbox-" + i).checked) {
					countSelected++;
				}
			}
		}
		this.setState({
			countSelectedUsers: countSelected,
		});
		document.getElementById("qntdSelectedUsers").innerHTML = countSelected;
	},

	onCheck(idy) {
		var selectAll = true;
		var i;
		var countSelected = this.state.countSelectedUsers;
		if (document.getElementById("checkbox-" + idy).checked) {
			countSelected++;
		} else {
			countSelected--;
		}
		this.setState({
			countSelectedUsers: countSelected,
		});
		document.getElementById("qntdSelectedUsers").innerHTML = countSelected;

		for (i = 0; i < this.state.usersToImport.length; i++) {
			if (!document.getElementById("checkbox-" + i).checked) {
				selectAll = false;
			}
		}
		document.getElementById("selectAll").checked = selectAll;
	},

	onKeyUp(evt) {
		var key = evt.which;
		if (key == 13) {
			evt.preventDefault();
			return;
		}
	},
	onlyLetter(evt) {
		var regex = new RegExp("^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$");
		var key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
		if (!regex.test(key)) {
			evt.preventDefault();
			return false;
		}
	},

	onlyLetterPaste(evt) {
		var regex = new RegExp("^[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$");
		var value = evt.clipboardData.getData("Text");
		if (!regex.test(value)) {
			evt.preventDefault();
			return;
		}
	},

	renderImportedUsers(users) {
		var me = this;
		const accessLevelOptions = this.context.roles.SYSADMIN
				? AccessLevels.list : AccessLevels.listNoSysAdm

		return (
			<div>
				<table className="import-user-table table table-fixed">
					<thead className="import-table-header">
						<tr>
							<th className="column-goals-perfomance col-xs-1">
								<input
									id="selectAll"
									value="selectAll"
									type="checkbox"
									title={Messages.get("label.all")}
									onChange={me.selectAll}
								/>
							</th>
							<th className="column-goals-perfomance col-xs-4">
								{Messages.getEditable(
									"label.name",
									"fpdi-nav-label"
								)}
							</th>
							<th className="column-goals-perfomance col-xs-4">
								{Messages.getEditable(
									"label.email",
									"fpdi-nav-label"
								)}
							</th>
							<th className="column-goals-perfomance col-xs-3">
								{Messages.getEditable(
									"label.accountType",
									"fpdi-nav-label"
								)}
							</th>
						</tr>
					</thead>
					<tbody id="importUsersData">
						{users.map((attr, idy) => {
							return !attr.validEmail ? (
								<tr key={idy} id={"row-" + idy}>
									<td className="col-xs-1 disabled">
										<span
											data-placement="right"
											title="Email inválido."
										>
											<input
												id={"checkbox-" + idy}
												type="checkbox"
												onChange={me.onCheck.bind(
													this,
													idy
												)}
												disabled="true"
											/>
										</span>
									</td>
									<td
										className="col-xs-4 disabled"
										id={"user-name-" + idy}
									>
										<span
											data-placement="right"
											title="Email inválido."
										>
											{attr.name}
										</span>
									</td>
									<td
										className="col-xs-4 disabled"
										id={"user-email-" + idy}
									>
										<span
											data-placement="right"
											title="Email inválido."
										>
											{attr.email}
										</span>
									</td>
									<td className="col-xs-3 disabled">
										<span
											data-placement="right"
											title="Email inválido."
										>
											<select
												id={"user-accesLevel-" + idy}
												className="form-control user-select-box disabled"
												disabled="true"
											>
												{accessLevelOptions.map(
													(attr, idy) => {
														return (
															<option
																key={
																	attr.accessLevel
																}
																value={
																	attr.accessLevel
																}
																data-placement="right"
																title={
																	attr.name
																}
															>
																{attr.name}
															</option>
														);
													}
												)}
											</select>
										</span>
									</td>
								</tr>
							) : (
								<tr key={idy} id={"row-" + idy}>
									<td className="col-xs-1">
										<input
											id={"checkbox-" + idy}
											type="checkbox"
											onChange={me.onCheck.bind(
												this,
												idy
											)}
										/>
									</td>
									<td
										className="col-xs-4"
										id={"user-name-" + idy}
									>
										{attr.name}
									</td>
									<td
										className="col-xs-4"
										id={"user-email-" + idy}
									>
										{attr.email}
									</td>
									<td className="col-xs-3">
										<select
											id={"user-accesLevel-" + idy}
											className="form-control user-select-box"
										>
											{accessLevelOptions.map(
												(attr, idy) => {
													return (
														<option
															key={
																attr.accessLevel
															}
															value={
																attr.accessLevel
															}
															data-placement="right"
															title={attr.name}
														>
															{attr.name}
														</option>
													);
												}
											)}
										</select>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div>
					<strong>
						<span id="qntdSelectedUsers">0</span>{" "}
						{Messages.getEditable(
							"label.selectUsers",
							"fpdi-nav-label"
						)}
					</strong>
					<span className="floatRight">
						<strong>
							{Messages.getEditable(
								"label.file",
								"fpdi-nav-label"
							)}{" "}
						</strong>
						<span id="fileName">{this.state.importFileName}</span>
					</span>
				</div>
				<div id="emptyUsersToImport" className="emptyUsersToImport"></div>
			</div>
		);
	},

	getAccessLevelField(model) {
		return {
			name: "accessLevel",
			type: "select",
			maxLength: 255,
			currValue: model.accessLevel,
			value: model.accessLevel,
			displayField: "name",
			valueField: "accessLevel",
			options: this.context.roles.SYSADMIN
				? AccessLevels.list.filter((level) => {
						return level.accessLevel <= this.context.accessLevel;
				  })
				: AccessLevels.listNoSysAdm.filter((level) => {
						return level.accessLevel <= this.context.accessLevel;
				  }),
			onChange: (e) =>{
			this.setState({
				models: _.map(this.state.models, (mod) => {
					if (mod.id === model.id) {
						mod.accessLevel = e.target.value;
					}
					return mod;
				})
			});
			this.submitUserAccessLevel(e.target.value, model.id)
			},
		};
	},

	renderRecords() {
		var sameUser;

		return (
			<div className="container-user">
				{this.context.roles.ADMIN || this.context.hasManageUsersPermission ? (
					<div className="panel panel-default">
						<div
							className="panel-heading displayFlex cursorPointer"
							onClick={this.hideFieldsNewUser}
						>
							<b className="budget-graphic-title">
								{" "}
								{Messages.getEditable(
									"label.inviteUser",
									"fpdi-nav-label"
								)}{" "}
							</b>
							<div className="performance-strategic-btns floatRight">
								<button
									type="button"
									className="btn btn-for budget-new-btn"
									onClick={this.readCSVFile}
								>
									{" "}
									{Messages.getEditable(
										"label.importUsers",
										"fpdi-nav-label"
									)}{" "}
								</button>
								<span
									className={
										this.state.hideNewUser
											? "mdi mdi-chevron-right marginLeft15 cursorPointer"
											: "mdi mdi-chevron-down marginLeft15 cursorPointer"
									}
									onClick={this.hideFieldsNewUser}
								/>
							</div>
						</div>
						{!this.state.hideNewUser ? (
							this.state.loadingSend ? (
								<LoadingGauge />
							) : (
								<table className="table fpdi-table">
									<thead className="hidden-xs">
										<tr>
											<th className="col-sm-3">
												{Messages.getEditable(
													"label.name",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
											</th>
											<th className="col-sm-3">
												{Messages.getEditable(
													"label.email",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
											</th>
											<th className="col-sm-3">
												{Messages.getEditable(
													"label.accountType",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
												<InfoButton style={{ marginLeft: '5px' }} onClick={this.showInfoModal} />
											</th>
											<th className="col-sm-3"> </th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className="fdpi-table-cell">
												<input
													maxLength="255"
													className="budget-field-table"
													ref="nameUser"
													type="text"
													defaultValue=""
													onKeyPress={this.onlyLetter}
													onPaste={
														this.onlyLetterPaste
													}
												/>
												<div
													ref="formAlertNameUser"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<input
													maxLength="255"
													className="budget-field-table"
													ref="emailUser"
													type="text"
													defaultValue=""
												/>
												<div
													ref="formAlertEmail"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<select
													className="form-control user-select-box"
													ref="selectAccessLevels"
													defaultValue={-1}
												>
													<option
														value={-1}
														disabled
														data-placement="right"
														title={Messages.get(
															"label.selectAccountType"
														)}
													>
														{Messages.getEditable(
															"label.selectAccountType",
															"fpdi-nav-label"
														)}{" "}
													</option>
													{this.context.roles.SYSADMIN
														? AccessLevels.list.map(
																(attr, idy) => {
																	return (
																		<option
																			key={
																				attr.accessLevel
																			}
																			value={
																				attr.accessLevel
																			}
																			data-placement="right"
																			title={
																				attr.name
																			}
																		>
																			{
																				attr.name
																			}
																		</option>
																	);
																}
														  )
														: AccessLevels.listNoSysAdm.map(
																(attr, idy) => {
																	return (
																		<option
																			key={
																				attr.accessLevel
																			}
																			value={
																				attr.accessLevel
																			}
																			data-placement="right"
																			title={
																				attr.name
																			}
																		>
																			{
																				attr.name
																			}
																		</option>
																	);
																}
														  )}
												</select>
												<div
													ref="formAlertTypeAccont"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<button
													type="button"
													className="btn btn-for budget-new-btn"
													onClick={
														this.onSubmitConviteUser
													}
												>
													{" "}
													{Messages.getEditable(
														"label.submit.sendInvitation",
														"fpdi-nav-label"
													)}{" "}
												</button>
											</td>
										</tr>

										<tr>
											<td
												colSpan="4"
												className="fdpi-table-cell"
											>
												<div className="notUseEmail">
													{Messages.getEditable(
														"label.typeEmail",
														"fpdi-nav-label"
													)}{" "}
													{/*Atenção: Evite convidar usuários utilizando e-mails do MSN, Hotmail, Outlook e Windows Live Mail*/}
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							)
						) : (
							""
						)}
					</div>
				) : (
					""
				)}

				{this.context.roles.SYSADMIN && (
					<div className="panel panel-default">
						<div
							className="panel-heading displayFlex cursorPointer"
							onClick={this.hideFieldsCreateUser}
						>
							<b className="budget-graphic-title">
								{" "}
								{Messages.getEditable(
									"label.RegisterUser",
									"fpdi-nav-label"
								)}{" "}
							</b>
							<div className="performance-strategic-btns floatRight">
								<span
									className={
										this.state.hideCreateUser
											? "mdi mdi-chevron-right marginLeft15 cursorPointer"
											: "mdi mdi-chevron-down marginLeft15 cursorPointer"
									}
									onClick={this.hideFieldsCreateUser}
								/>
							</div>
						</div>
						{!this.state.hideCreateUser ? (
							this.state.loadingCreate ? (
								<LoadingGauge />
							) : (
								<table className="table fpdi-table">
									<thead className="hidden-xs">
										<tr>
											<th className="col-sm-3">
												{Messages.getEditable(
													"label.name",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
											</th>
											<th className="col-sm-3">
												{Messages.getEditable(
													"label.email",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
											</th>
											<th className="col-sm-2">
												{Messages.getEditable(
													"label.password",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
											</th>
											<th className="col-sm-2">
												{Messages.getEditable(
													"label.accountType",
													"fpdi-nav-label"
												)}{" "}
												<span className="fpdi-required"></span>{" "}
												<InfoButton style={{ marginLeft: '5px' }} onClick={this.showInfoModal} />
											</th>
											<th className="col-sm-2"> </th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td className="fdpi-table-cell">
												<input
													maxLength="255"
													className="budget-field-table"
													ref="newNameUser"
													type="text"
													defaultValue=""
													onKeyPress={this.onlyLetter}
													onPaste={
														this.onlyLetterPaste
													}
												/>
												<div
													ref="formAlertNewNameUser"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<input
													maxLength="255"
													className="budget-field-table"
													ref="newEmailUser"
													type="text"
													defaultValue=""
												/>
												<div
													ref="formAlertNewEmail"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<input
													maxLength="255"
													className="budget-field-table"
													ref="newPasswordUser"
													type="password"
													defaultValue=""
												/>
												<div
													ref="formAlertNewPasswordUser"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<select
													className="form-control user-select-box"
													ref="newSelectAccessLevels"
													defaultValue={-1}
												>
													<option
														value={-1}
														disabled
														data-placement="right"
														title={Messages.get(
															"label.selectAccountType"
														)}
													>
														{Messages.getEditable(
															"label.selectAccountType",
															"fpdi-nav-label"
														)}{" "}
													</option>
													{this.context.roles.SYSADMIN
														? AccessLevels.list.map(
																(attr, idy) => {
																	return (
																		<option
																			key={
																				attr.accessLevel
																			}
																			value={
																				attr.accessLevel
																			}
																			data-placement="right"
																			title={
																				attr.name
																			}
																		>
																			{
																				attr.name
																			}
																		</option>
																	);
																}
														  )
														: AccessLevels.listNoSysAdm.map(
																(attr, idy) => {
																	return (
																		<option
																			key={
																				attr.accessLevel
																			}
																			value={
																				attr.accessLevel
																			}
																			data-placement="right"
																			title={
																				attr.name
																			}
																		>
																			{
																				attr.name
																			}
																		</option>
																	);
																}
														  )}
												</select>
												<div
													ref="formAlertNewTypeAccont"
													className="formAlertError"
												></div>
											</td>
											<td className="fdpi-table-cell">
												<button
													type="button"
													className="btn btn-for budget-new-btn"
													onClick={
														this.onSubmitCreateUser
													}
												>
													{Messages.getEditable(
														"label.register",
														"fpdi-nav-label"
													)}
												</button>
											</td>
										</tr>
										<tr>
											<td
												colSpan="5"
												className="fdpi-table-cell"
											>
												<div className="notUseEmail">
													{Messages.getEditable(
														"label.noConfirmToEmail",
														"fpdi-nav-label"
													)}
												</div>
											</td>
										</tr>
									</tbody>
								</table>
							)
						) : (
							""
						)}
					</div>
				)}

				<div className="panel panel-default">
					<div
						className="panel-heading cursorPointer"
						onClick={this.hideFieldsUser}
					>
						<b className="budget-graphic-title">
							{" "}
							{Messages.getEditable(
								"label.systemUsers",
								"fpdi-nav-label"
							)}{" "}
						</b>
						<div className="performance-strategic-btns floatRight">
							<span
								className={
									this.state.hideUser
										? "mdi mdi-chevron-right marginLeft15 cursorPointer"
										: "mdi mdi-chevron-down marginLeft15 cursorPointer"
								}
								onClick={this.hideFieldsUser}
							/>
						</div>
					</div>
					{!this.state.hideUser ? (
						<div>
							<div style={{ margin: '25px 14px 14px' }}>
								<SearchBox
									value={this.state.searchTerm}
									placeholder={Messages.get('label.search')}
									onChange={this.onSearchTermChange}
									onSubmit={term => this.onSubmitSearch(term)}
								/>
							</div>
							<table className="table fpdi-table">
								<thead className="hidden-xs">
									<tr>
										<th className="col-sm-3">
											{Messages.getEditable(
												"label.name",
												"fpdi-nav-label"
											)}{" "}
											<span
												className={
													this.state.sortedBy.length
														? `mdi mdi-sort-${this.state.sortedBy[1] == 'asc' ? 'desc' : 'asc'}ending cursorPointer`
														: "mdi mdi-sort cursorPointer"
												}
												onClick={
													this.state.sortedBy.length &&
													this.state.sortedBy[1] ==
														"asc"
														? this.quickSortByUsersName.bind(
																this,
																"desc"
														  )
														: this.quickSortByUsersName.bind(
																this,
																"asc"
														  )
												}
												title="Ordenar"
											>
												{" "}
											</span>
										</th>
										<th className="col-sm-3">
											{Messages.getEditable(
												"label.email",
												"fpdi-nav-label"
											)}
										</th>
										<th className="col-sm-2">
											{Messages.getEditable(
												"label.cpf",
												"fpdi-nav-label"
											)}
										</th>
										<th className="col-sm-3" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
											{Messages.getEditable(
												"label.accountType",
												"fpdi-nav-label"
											)}
											<InfoButton style={{ marginLeft: '5px' }} onClick={this.showInfoModal} />
										</th>
										<th className="col-sm-4">
											{" "}
											{Messages.getEditable(
												"label.situation",
												"fpdi-nav-label"
											)}{" "}
										</th>
									</tr>
								</thead>
								<tbody>
									{this.state.models.map((model, idx) => {
										var cpf = S(model.cpf);
										const modelField =
											this.getAccessLevelField(model);
										const sameUser = cpf.isEmpty() || UserSession.attributes.user == null
												? false
												: cpf == UserSession.attributes.user.cpf;
										const userDidNotAcceptTerms = model.termsAcceptance === false || model.termsAcceptance === undefined;
										return (
											<tr
												key={"user-" + idx}
												className={
													(model.blocked
														? "danger"
														: "") +
													(userDidNotAcceptTerms
														? " not-accepted-terms"
														: "")
												}
											>
												<td
													className={
														"col-sm-3 break-text" +
														(!model.active
															? " warning"
															: "")
													}
												>
													<span className="dropdown">
														<a
															className="dropdown-toggle"
															data-toggle="dropdown"
															aria-haspopup="true"
															aria-expanded="true"
															title={Messages.getEditable(
																"label.actions",
																"fpdi-nav-label"
															)}
														>
															<span className="sr-only">
																{Messages.getEditable(
																	"label.actions",
																	"fpdi-nav-label"
																)}
															</span>
															<span
																title={Messages.getEditable(
																	"label.actions",
																	"fpdi-nav-label"
																)}
																className="for mdi mdi-chevron-down"
															/>
														</a>

														{sameUser
															? this.renderSameUserOptions()
															: this.renderAnotherUser(this.state.models[idx], cpf)}
													</span>
													<span title={model.name}>{censorName(model.name)}</span>
												</td>
												<td
													className={"col-sm-3" + (!model.active ? " warning" : "")}
												>
													<p className="break-text" title={model.email}>
														{censorEmail(model.email)}
													</p>
												</td>
												<td
													className={
														"col-sm-2" +
														(!model.active
															? " warning"
															: "")
													}
												>
													<p className="break-text">
														{!model.active
															? ""
															: censorCPF(cpf.s)}
													</p>
												</td>
												<td
													className={
														"col-sm-3" +
														(!model.active
															? " warning"
															: "")
													}
												>
													{this.context
														.hasManageUsersPermission ? (
														<VerticalInput
															fieldDef={modelField}
															ref={modelField.name}
															key={modelField.name}
														/>
													) : (
														_.find(AccessLevels.list, ({ accessLevel }) => model.accessLevel === accessLevel).name
													)}
												</td>
												<td
													className={
														"col-sm-4" +
														(!model.active
															? " warning"
															: "")
													}
												>
													{!model.active ? (
														model.blocked ? (
															Messages.getEditable(
																"label.blockedUser",
																"fpdi-nav-label"
															)
														) : (
															<p className="break-text white-space">
																<small>
																	{" "}
																	{Messages.getEditable(
																		"label.userNoRegister",
																		"fpdi-nav-label"
																	)}
																</small>
															</p>
														)
													) : model.blocked ? (
														Messages.getEditable(
															"label.blockedUser",
															"fpdi-nav-label"
														)
													) : model.termsAcceptance ? (
														Messages.get(
															"label.regularUser"
														) +
														model.termsAcceptance
													) : (
														Messages.get(
															"label.userDidNotAcceptTerms"
														)
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
							<Pagination
								total={this.state.totalUsers}
								onChange={this.pageChange}
								page={this.state.page}
								pageSize={this.state.pageSize}
								options={[
									{ value: 5, label: '5 itens' },
									{ value: 10, label: '10 itens' },
									{ value: 15, label: '15 itens' },
									{ value: 20, label: '20 itens' },
									{ value: 25, label: '25 itens' },
									{ value: 50, label: '50 itens' },
								]}
							/>

						</div>
					) : (
						""
					)}
				</div>
			</div>
		);
	},

	render() {
    if (!EnvInfo.company) {
      return <h3 className="marginLeft30">{Messages.get('label.noCompanyRegistered')}</h3>;
    }
		return (
			<AppContainer.ScrollableContent>
				<div className="fpdi-profile-user padding40">
					<div className="fpdi-tabs-content container-fluid animated fadeIn">
						<h1>
							{Messages.getEditable(
								"label.users",
								"for-primary-color fpdi-nav-label"
							)}
						</h1>
						{/*
						<ul className="fpdi-action-list text-right">
							<Link to="/users/new" className="btn btn-sm btn-for">
								<span className="mdi mdi-plus"
								/> Convidar um usuário
							</Link>
						</ul>
					*/}
						{this.state.loading ? (
							<LoadingGauge />
						) : (
							this.renderRecords()
						)}
					</div>
				</div>
			</AppContainer.ScrollableContent>
		);
	},
});
